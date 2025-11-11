import pandas as pd
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class PerformanceMetrics:
    """
    Calculates driver performance metrics beyond lap times.
    Provides pace rating, improvement rate, and comparative analysis.
    """
    
    @staticmethod
    def calculate_pace_rating(driver_avg: float, field_avg: float) -> float:
        """
        Calculate pace rating relative to field average.
        
        Positive value = faster than average
        Negative value = slower than average
        
        Args:
            driver_avg: Driver's average lap time
            field_avg: Field average lap time
            
        Returns:
            Pace rating as percentage difference
        """
        if field_avg == 0:
            return 0.0
        
        pace_rating = ((field_avg - driver_avg) / field_avg) * 100
        return float(pace_rating)
    
    @staticmethod
    def calculate_improvement_rate(lap_times: List[float]) -> Dict:
        """
        Calculate improvement rate across session.
        
        Uses linear regression to find trend in lap times.
        
        Args:
            lap_times: List of lap times
            
        Returns:
            Dictionary with improvement metrics
        """
        if len(lap_times) < 3:
            return {
                'rate': 0.0,
                'trend': 'insufficient_data',
                'total_improvement': 0.0
            }
        
        x = np.arange(len(lap_times))
        slope, intercept = np.polyfit(x, lap_times, 1)
        
        # Negative slope = improving (getting faster)
        if slope < -0.05:
            trend = 'improving'
        elif slope > 0.05:
            trend = 'degrading'
        else:
            trend = 'stable'
        
        # Total improvement from first to last lap
        total_improvement = lap_times[0] - lap_times[-1]
        
        return {
            'rate': float(slope),
            'trend': trend,
            'total_improvement': float(total_improvement),
            'first_lap': float(lap_times[0]),
            'last_lap': float(lap_times[-1])
        }
    
    @staticmethod
    def calculate_racing_line_efficiency(telemetry: pd.DataFrame) -> Dict:
        """
        Calculate racing line efficiency from GPS data.
        
        Measures how close driver follows optimal line.
        This is a simplified calculation.
        
        Args:
            telemetry: DataFrame with GPS telemetry
            
        Returns:
            Dictionary with efficiency metrics
        """
        if telemetry is None or telemetry.empty:
            return {
                'efficiency': 0.0,
                'confidence': 'low',
                'note': 'No telemetry data available'
            }
        
        # Simplified efficiency based on speed consistency
        if 'Speed' in telemetry.columns:
            speed_std = telemetry['Speed'].std()
            speed_mean = telemetry['Speed'].mean()
            
            if speed_mean > 0:
                # Lower variation = more efficient
                coefficient_of_variation = speed_std / speed_mean
                efficiency = max(0, min(100, 100 - (coefficient_of_variation * 50)))
            else:
                efficiency = 0.0
            
            return {
                'efficiency': float(efficiency),
                'speed_consistency': float(1 - coefficient_of_variation) if speed_mean > 0 else 0.0,
                'confidence': 'medium',
                'note': 'Based on speed consistency'
            }
        
        return {
            'efficiency': 0.0,
            'confidence': 'low',
            'note': 'Speed data not available'
        }
    
    @staticmethod
    def compare_drivers(driver1_data: pd.DataFrame, driver2_data: pd.DataFrame) -> Dict:
        """
        Compare performance between two drivers.
        
        Args:
            driver1_data: Lap data for driver 1
            driver2_data: Lap data for driver 2
            
        Returns:
            Dictionary with comparison metrics
        """
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in driver1_data.columns else 'LAP_TIME'
        
        if lap_time_col not in driver1_data.columns or lap_time_col not in driver2_data.columns:
            return {'error': 'Lap time data not available'}
        
        # Exclude pit laps
        d1_laps = driver1_data[~driver1_data.get('is_pit_lap', False)][lap_time_col]
        d2_laps = driver2_data[~driver2_data.get('is_pit_lap', False)][lap_time_col]
        
        if d1_laps.empty or d2_laps.empty:
            return {'error': 'Insufficient lap data'}
        
        comparison = {
            'driver1': {
                'best_lap': float(d1_laps.min()),
                'average_lap': float(d1_laps.mean()),
                'worst_lap': float(d1_laps.max()),
                'consistency': float(d1_laps.std())
            },
            'driver2': {
                'best_lap': float(d2_laps.min()),
                'average_lap': float(d2_laps.mean()),
                'worst_lap': float(d2_laps.max()),
                'consistency': float(d2_laps.std())
            },
            'deltas': {
                'best_lap': float(d1_laps.min() - d2_laps.min()),
                'average_lap': float(d1_laps.mean() - d2_laps.mean()),
                'consistency': float(d1_laps.std() - d2_laps.std())
            }
        }
        
        # Determine who is faster
        if comparison['deltas']['average_lap'] < 0:
            comparison['faster_driver'] = 'driver1'
            comparison['pace_advantage'] = abs(comparison['deltas']['average_lap'])
        else:
            comparison['faster_driver'] = 'driver2'
            comparison['pace_advantage'] = abs(comparison['deltas']['average_lap'])
        
        return comparison
    
    @staticmethod
    def calculate_sector_performance(lap_data: pd.DataFrame) -> Dict:
        """
        Calculate sector-specific performance metrics.
        
        Args:
            lap_data: DataFrame with sector times
            
        Returns:
            Dictionary with sector performance
        """
        sector_performance = {}
        
        for i in range(1, 4):
            s_col = f' S{i}_SECONDS' if f' S{i}_SECONDS' in lap_data.columns else f'S{i}_SECONDS'
            
            if s_col in lap_data.columns:
                sector_times = lap_data[s_col].dropna()
                
                if not sector_times.empty:
                    sector_performance[f'sector_{i}'] = {
                        'best': float(sector_times.min()),
                        'average': float(sector_times.mean()),
                        'worst': float(sector_times.max()),
                        'consistency': float(sector_times.std()),
                        'improvement_potential': float(sector_times.mean() - sector_times.min())
                    }
        
        return sector_performance
    
    @staticmethod
    def generate_performance_summary(lap_data: pd.DataFrame, field_data: pd.DataFrame) -> Dict:
        """
        Generate comprehensive performance summary for a driver.
        
        Args:
            lap_data: Driver's lap data
            field_data: All drivers' lap data
            
        Returns:
            Complete performance summary
        """
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in lap_data.columns else 'LAP_TIME'
        
        if lap_time_col not in lap_data.columns:
            return {'error': 'Lap time data not available'}
        
        # Exclude pit laps
        valid_laps = lap_data[~lap_data.get('is_pit_lap', False)][lap_time_col]
        
        if valid_laps.empty:
            return {'error': 'No valid laps'}
        
        # Calculate field average
        field_valid = field_data[~field_data.get('is_pit_lap', False)][lap_time_col]
        field_avg = field_valid.mean() if not field_valid.empty else valid_laps.mean()
        
        # Calculate metrics
        driver_avg = valid_laps.mean()
        pace_rating = PerformanceMetrics.calculate_pace_rating(driver_avg, field_avg)
        improvement = PerformanceMetrics.calculate_improvement_rate(valid_laps.tolist())
        sector_perf = PerformanceMetrics.calculate_sector_performance(lap_data)
        
        summary = {
            'best_lap': float(valid_laps.min()),
            'average_lap': float(driver_avg),
            'worst_lap': float(valid_laps.max()),
            'total_laps': int(len(valid_laps)),
            'pace_rating': float(pace_rating),
            'improvement': improvement,
            'sector_performance': sector_perf,
            'field_average': float(field_avg)
        }
        
        return summary
