import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class LapAnalyzer:
    """
    Analyzes lap times and sector performance.
    Provides methods for lap comparison, consistency scoring, and trend analysis.
    """
    
    @staticmethod
    def calculate_sector_times(lap_data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract and validate sector times from lap data.
        
        Args:
            lap_data: DataFrame with lap and sector data
            
        Returns:
            DataFrame with validated sector times
        """
        sector_cols = []
        for col in ['S1_SECONDS', 'S2_SECONDS', 'S3_SECONDS']:
            if col in lap_data.columns:
                sector_cols.append(col)
            elif f' {col}' in lap_data.columns:
                sector_cols.append(f' {col}')
        
        if not sector_cols:
            logger.warning("No sector time columns found")
            return lap_data
        
        # Validate: sector sum should equal lap time
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in lap_data.columns else 'LAP_TIME'
        
        if lap_time_col in lap_data.columns and len(sector_cols) == 3:
            calculated_lap_time = lap_data[sector_cols].sum(axis=1)
            actual_lap_time = lap_data[lap_time_col]
            
            tolerance = 0.1
            inconsistent = abs(calculated_lap_time - actual_lap_time) > tolerance
            
            if inconsistent.any():
                logger.warning(f"Found {inconsistent.sum()} laps with inconsistent sector times")
        
        return lap_data
    
    @staticmethod
    def find_best_lap(driver_laps: pd.DataFrame) -> Optional[Dict]:
        """
        Identify fastest lap for a driver.
        
        Args:
            driver_laps: DataFrame with laps for single driver
            
        Returns:
            Dictionary with best lap info or None
        """
        if driver_laps.empty:
            return None
        
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in driver_laps.columns else 'LAP_TIME'
        lap_num_col = ' LAP_NUMBER' if ' LAP_NUMBER' in driver_laps.columns else 'LAP_NUMBER'
        
        if lap_time_col not in driver_laps.columns:
            return None
        
        # Exclude pit laps if column exists
        valid_laps = driver_laps.copy()
        if 'is_pit_lap' in valid_laps.columns:
            valid_laps = valid_laps[~valid_laps['is_pit_lap']]
        
        if valid_laps.empty:
            return None
        
        best_lap_idx = valid_laps[lap_time_col].idxmin()
        best_lap = valid_laps.loc[best_lap_idx]
        
        return {
            'lap_number': int(best_lap[lap_num_col]) if lap_num_col in best_lap else None,
            'lap_time': float(best_lap[lap_time_col]),
            'sector_1': float(best_lap.get('S1_SECONDS', best_lap.get(' S1_SECONDS', 0))),
            'sector_2': float(best_lap.get('S2_SECONDS', best_lap.get(' S2_SECONDS', 0))),
            'sector_3': float(best_lap.get('S3_SECONDS', best_lap.get(' S3_SECONDS', 0)))
        }
    
    @staticmethod
    def calculate_lap_delta(current_lap: pd.Series, reference_lap: pd.Series) -> Dict:
        """
        Calculate time difference between two laps.
        
        Args:
            current_lap: Current lap data
            reference_lap: Reference lap data (e.g., best lap)
            
        Returns:
            Dictionary with delta information
        """
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in current_lap.index else 'LAP_TIME'
        
        if lap_time_col not in current_lap.index or lap_time_col not in reference_lap.index:
            return {'total_delta': 0, 'sector_deltas': [0, 0, 0]}
        
        total_delta = current_lap[lap_time_col] - reference_lap[lap_time_col]
        
        sector_deltas = []
        for i in range(1, 4):
            s_col = f'S{i}_SECONDS'
            s_col_space = f' S{i}_SECONDS'
            
            curr_col = s_col_space if s_col_space in current_lap.index else s_col
            ref_col = s_col_space if s_col_space in reference_lap.index else s_col
            
            if curr_col in current_lap.index and ref_col in reference_lap.index:
                delta = current_lap[curr_col] - reference_lap[ref_col]
                sector_deltas.append(float(delta))
            else:
                sector_deltas.append(0.0)
        
        return {
            'total_delta': float(total_delta),
            'sector_deltas': sector_deltas
        }

    @staticmethod
    def calculate_consistency_score(lap_times: List[float], pit_laps: List[bool]) -> float:
        """
        Calculate driver consistency score (0-100).
        
        Uses coefficient of variation with outlier removal.
        Higher score = more consistent performance.
        
        Args:
            lap_times: List of lap times
            pit_laps: List of booleans indicating pit laps
            
        Returns:
            Consistency score from 0-100
        """
        if len(lap_times) < 3:
            return 0.0
        
        # Remove pit laps
        clean_laps = [lt for i, lt in enumerate(lap_times) if not pit_laps[i]]
        
        if len(clean_laps) < 3:
            return 0.0
        
        # Remove outliers using IQR method
        q1, q3 = np.percentile(clean_laps, [25, 75])
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        filtered_laps = [lt for lt in clean_laps if lower_bound <= lt <= upper_bound]
        
        if len(filtered_laps) < 3:
            filtered_laps = clean_laps
        
        # Calculate coefficient of variation
        std_dev = np.std(filtered_laps)
        mean_lap = np.mean(filtered_laps)
        
        if mean_lap == 0:
            return 0.0
        
        coefficient_of_variation = std_dev / mean_lap
        
        # Map to 0-100 scale (0.01 CV = 90 score, 0.05 CV = 50 score)
        score = max(0, min(100, 100 - (coefficient_of_variation * 1000)))
        
        return float(score)
    
    @staticmethod
    def calculate_lap_time_trend(lap_data: pd.DataFrame) -> Dict:
        """
        Calculate lap time trend (improving, degrading, stable).
        
        Args:
            lap_data: DataFrame with lap times
            
        Returns:
            Dictionary with trend information
        """
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in lap_data.columns else 'LAP_TIME'
        
        if lap_time_col not in lap_data.columns or len(lap_data) < 3:
            return {'trend': 'insufficient_data', 'rate': 0.0}
        
        # Exclude pit laps
        valid_laps = lap_data.copy()
        if 'is_pit_lap' in valid_laps.columns:
            valid_laps = valid_laps[~valid_laps['is_pit_lap']]
        
        if len(valid_laps) < 3:
            return {'trend': 'insufficient_data', 'rate': 0.0}
        
        lap_times = valid_laps[lap_time_col].values
        x = np.arange(len(lap_times))
        
        # Linear regression
        slope, intercept = np.polyfit(x, lap_times, 1)
        
        # Determine trend
        if abs(slope) < 0.01:
            trend = 'stable'
        elif slope < 0:
            trend = 'improving'
        else:
            trend = 'degrading'
        
        return {
            'trend': trend,
            'rate': float(slope),
            'average_lap_time': float(np.mean(lap_times))
        }
    
    @staticmethod
    def get_sector_analysis(lap_data: pd.DataFrame) -> Dict:
        """
        Analyze sector performance across all laps.
        
        Args:
            lap_data: DataFrame with sector times
            
        Returns:
            Dictionary with sector analysis
        """
        analysis = {
            'sector_1': {},
            'sector_2': {},
            'sector_3': {}
        }
        
        for i in range(1, 4):
            s_col = f' S{i}_SECONDS' if f' S{i}_SECONDS' in lap_data.columns else f'S{i}_SECONDS'
            
            if s_col in lap_data.columns:
                sector_times = lap_data[s_col].dropna()
                
                if not sector_times.empty:
                    analysis[f'sector_{i}'] = {
                        'best': float(sector_times.min()),
                        'average': float(sector_times.mean()),
                        'worst': float(sector_times.max()),
                        'std_dev': float(sector_times.std())
                    }
        
        return analysis

    @staticmethod
    def analyze_lap_times(driver_laps: pd.DataFrame) -> Dict:
        """
        Comprehensive lap time analysis for a driver.
        
        Args:
            driver_laps: DataFrame with all laps for a driver
            
        Returns:
            Dictionary with complete analysis
        """
        if driver_laps.empty:
            return {}
        
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in driver_laps.columns else 'LAP_TIME'
        
        # Get basic stats
        best_lap = LapAnalyzer.find_best_lap(driver_laps)
        sector_analysis = LapAnalyzer.get_sector_analysis(driver_laps)
        trend = LapAnalyzer.calculate_lap_time_trend(driver_laps)
        
        # Calculate consistency
        lap_times = driver_laps[lap_time_col].dropna().tolist()
        pit_laps = [False] * len(lap_times)
        if 'is_pit_lap' in driver_laps.columns:
            pit_laps = driver_laps['is_pit_lap'].fillna(False).tolist()
        
        consistency = LapAnalyzer.calculate_consistency_score(lap_times, pit_laps)
        
        # Combine all analysis
        analysis = {
            'best_lap': best_lap,
            'sector_analysis': sector_analysis,
            'trend': trend,
            'consistency_score': consistency,
            'total_laps': len(driver_laps),
            'average_lap_time': float(driver_laps[lap_time_col].mean()) if lap_time_col in driver_laps.columns else None
        }
        
        # Flatten sector analysis for easier access
        for sector_key, sector_data in sector_analysis.items():
            if isinstance(sector_data, dict):
                for stat_key, stat_value in sector_data.items():
                    analysis[f'{sector_key}_{stat_key}'] = stat_value
        
        return analysis
