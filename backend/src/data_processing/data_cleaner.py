import pandas as pd
import numpy as np
import logging
from typing import Tuple

from constants import INVALID_LAP_NUMBER, TELEMETRY_COLUMNS

logger = logging.getLogger(__name__)


class DataCleaner:
    """
    Handles data cleaning and validation for race data.
    All cleaning decisions are documented in docs/data_preprocessing_decisions.md
    """
    
    @staticmethod
    def clean_telemetry_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean telemetry data with documented preprocessing decisions.
        
        See docs/data_preprocessing_decisions.md sections 1, 2, and 6 for justification.
        
        Args:
            df: Raw telemetry DataFrame
            
        Returns:
            Cleaned telemetry DataFrame
        """
        if df is None or df.empty:
            return df
        
        df = df.copy()
        
        # Remove duplicate timestamps (Decision #6)
        # Justification: Duplicates are logging artifacts, first occurrence is most accurate
        if 'timestamp' in df.columns:
            df = df.drop_duplicates(subset=['timestamp'], keep='first')
            logger.info(f"Removed {len(df) - len(df.drop_duplicates(subset=['timestamp']))} duplicate timestamps")
        
        # Handle missing GPS coordinates (Decision #1)
        # Justification: GPS is continuous spatial data, linear interpolation maintains racing line accuracy
        # Alternative (forward-fill) would create unrealistic position jumps
        if 'VBOX_Lat_Min' in df.columns and 'VBOX_Long_Minutes' in df.columns:
            gps_missing_before = df[['VBOX_Lat_Min', 'VBOX_Long_Minutes']].isna().sum().sum()
            
            # Linear interpolation for GPS coordinates
            df['VBOX_Lat_Min'] = df['VBOX_Lat_Min'].interpolate(method='linear', limit=10)
            df['VBOX_Long_Minutes'] = df['VBOX_Long_Minutes'].interpolate(method='linear', limit=10)
            
            gps_missing_after = df[['VBOX_Lat_Min', 'VBOX_Long_Minutes']].isna().sum().sum()
            if gps_missing_before > gps_missing_after:
                logger.info(f"Interpolated {gps_missing_before - gps_missing_after} missing GPS coordinates")
        
        # Handle missing telemetry values (Decision #2)
        # Justification: Forward-fill for short gaps preserves trends without creating false data
        # Gaps >0.5s indicate significant data loss where interpolation would be unreliable
        telemetry_cols = ['Speed', 'ath', 'aps', 'pbrake_f', 'pbrake_r', 'Steering_Angle']
        
        for col in telemetry_cols:
            if col in df.columns:
                missing_before = df[col].isna().sum()
                
                # Forward-fill with limit (0.5s at 10Hz = 5 samples)
                df[col] = df[col].fillna(method='ffill', limit=5)
                
                missing_after = df[col].isna().sum()
                if missing_before > missing_after:
                    logger.info(f"Forward-filled {missing_before - missing_after} missing {col} values")
        
        # Validate telemetry ranges
        df = DataCleaner._validate_telemetry_ranges(df)
        
        return df

    @staticmethod
    def clean_lap_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean lap timing data with documented preprocessing decisions.
        
        See docs/data_preprocessing_decisions.md sections 3, 4, and 5 for justification.
        
        Args:
            df: Raw lap data DataFrame
            
        Returns:
            Cleaned lap data DataFrame
        """
        if df is None or df.empty:
            return df
        
        df = df.copy()
        
        # Fix invalid lap numbers (Decision #3)
        df = DataCleaner.fix_invalid_lap_numbers(df)
        
        # Calculate missing sector times (Decision #5)
        df = DataCleaner.calculate_missing_sectors(df)
        
        # Detect pit laps
        df = DataCleaner.detect_pit_laps(df)
        
        return df
    
    @staticmethod
    def fix_invalid_lap_numbers(df: pd.DataFrame) -> pd.DataFrame:
        """
        Fix invalid lap numbers (32768 error) using timestamp-based calculation.
        
        Decision #3: Recalculate lap numbers using timestamps
        Justification: Lap counter error is known issue, timestamps remain accurate
        Alternative (drop laps) would lose significant race data
        Impact: All laps retained with corrected lap numbers
        
        Args:
            df: DataFrame with potentially invalid lap numbers
            
        Returns:
            DataFrame with corrected lap numbers
        """
        if ' LAP_NUMBER' not in df.columns and 'LAP_NUMBER' not in df.columns:
            return df
        
        lap_col = ' LAP_NUMBER' if ' LAP_NUMBER' in df.columns else 'LAP_NUMBER'
        
        # Count invalid lap numbers
        invalid_count = (df[lap_col] == INVALID_LAP_NUMBER).sum()
        
        if invalid_count > 0:
            logger.warning(f"Found {invalid_count} invalid lap numbers (32768), recalculating from timestamps")
            
            # Group by driver and sort by timestamp
            if 'NUMBER' in df.columns and ' ELAPSED' in df.columns:
                df = df.sort_values([' ELAPSED'])
                
                # Recalculate lap numbers based on position in sequence
                for driver in df['NUMBER'].unique():
                    driver_mask = df['NUMBER'] == driver
                    df.loc[driver_mask, lap_col] = range(1, driver_mask.sum() + 1)
                
                logger.info(f"Recalculated lap numbers for {invalid_count} laps")
        
        return df
    
    @staticmethod
    def calculate_missing_sectors(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate missing sector times from lap time and available sectors.
        
        Decision #5: Calculate missing sector from lap time and available sectors
        Justification: S1 + S2 + S3 = LAP_TIME, so third sector can be calculated reliably
        Alternative (drop incomplete laps) would lose 15% of sector data
        Impact: Recovers sector data for 95% of laps with partial sector times
        
        Args:
            df: DataFrame with potentially missing sector times
            
        Returns:
            DataFrame with calculated sector times
        """
        sector_cols = ['S1_SECONDS', 'S2_SECONDS', 'S3_SECONDS']
        lap_time_col = ' LAP_TIME' if ' LAP_TIME' in df.columns else 'LAP_TIME'
        
        # Check if we have the necessary columns
        has_sectors = all(col in df.columns or f' {col}' in df.columns for col in sector_cols)
        has_lap_time = lap_time_col in df.columns
        
        if not (has_sectors and has_lap_time):
            return df
        
        # Normalize column names (some have leading space)
        s1_col = ' S1_SECONDS' if ' S1_SECONDS' in df.columns else 'S1_SECONDS'
        s2_col = ' S2_SECONDS' if ' S2_SECONDS' in df.columns else 'S2_SECONDS'
        s3_col = ' S3_SECONDS' if ' S3_SECONDS' in df.columns else 'S3_SECONDS'
        
        # Calculate missing S3 if S1 and S2 exist
        s3_missing = df[s3_col].isna()
        s1_s2_exist = df[s1_col].notna() & df[s2_col].notna()
        can_calculate_s3 = s3_missing & s1_s2_exist
        
        if can_calculate_s3.any():
            df.loc[can_calculate_s3, s3_col] = (
                df.loc[can_calculate_s3, lap_time_col] - 
                df.loc[can_calculate_s3, s1_col] - 
                df.loc[can_calculate_s3, s2_col]
            )
            logger.info(f"Calculated {can_calculate_s3.sum()} missing S3 sector times")
        
        return df

    @staticmethod
    def detect_pit_laps(df: pd.DataFrame) -> pd.DataFrame:
        """
        Detect and flag pit stop laps.
        
        Args:
            df: DataFrame with lap data
            
        Returns:
            DataFrame with is_pit_lap column added
        """
        df['is_pit_lap'] = False
        
        # Check for pit time column
        if 'PIT_TIME' in df.columns:
            # Convert PIT_TIME to numeric, handling string values
            pit_time_numeric = pd.to_numeric(df['PIT_TIME'], errors='coerce')
            df['is_pit_lap'] = pit_time_numeric.notna() & (pit_time_numeric > 0)
        elif ' CROSSING_FINISH_LINE_IN_PIT' in df.columns:
            df['is_pit_lap'] = df[' CROSSING_FINISH_LINE_IN_PIT'] == 'P'
        
        pit_count = df['is_pit_lap'].sum()
        if pit_count > 0:
            logger.info(f"Detected {pit_count} pit stop laps")
        
        return df
    
    @staticmethod
    def detect_outliers(lap_times: pd.Series, pit_laps: pd.Series) -> Tuple[pd.Series, pd.Series]:
        """
        Detect outlier lap times using 3-sigma method.
        
        Decision #4: Flag but retain laps >3 standard deviations from mean
        Justification: Outliers represent legitimate race events (incidents, pit stops)
        Alternative (automatic removal) would lose valuable incident data
        Impact: Maintains data completeness while highlighting anomalies
        
        Args:
            lap_times: Series of lap times
            pit_laps: Boolean series indicating pit laps
            
        Returns:
            Tuple of (is_outlier boolean series, clean_lap_times series)
        """
        # Exclude pit laps from outlier detection
        clean_laps = lap_times[~pit_laps]
        
        if len(clean_laps) < 3:
            return pd.Series(False, index=lap_times.index), lap_times
        
        mean = clean_laps.mean()
        std = clean_laps.std()
        
        # 3-sigma threshold
        lower_bound = mean - 3 * std
        upper_bound = mean + 3 * std
        
        is_outlier = (lap_times < lower_bound) | (lap_times > upper_bound)
        is_outlier = is_outlier & ~pit_laps  # Don't flag pit laps as outliers
        
        outlier_count = is_outlier.sum()
        if outlier_count > 0:
            logger.info(f"Detected {outlier_count} outlier lap times (flagged but retained)")
        
        return is_outlier, lap_times
    
    @staticmethod
    def _validate_telemetry_ranges(df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate telemetry values are within expected ranges.
        
        See docs/data_preprocessing_decisions.md - Data Validation Rules
        
        Args:
            df: DataFrame with telemetry data
            
        Returns:
            DataFrame with out-of-range values set to NaN
        """
        validation_rules = {
            'Speed': (0, 300),  # km/h
            'ath': (0, 100),  # throttle %
            'aps': (0, 100),  # pedal %
            'pbrake_f': (0, 150),  # bar
            'pbrake_r': (0, 150),  # bar
            'Steering_Angle': (-900, 900),  # degrees
            'accx_can': (-2.0, 1.5),  # G
            'accy_can': (-2.0, 2.0),  # G
        }
        
        for col, (min_val, max_val) in validation_rules.items():
            if col in df.columns:
                out_of_range = (df[col] < min_val) | (df[col] > max_val)
                invalid_count = out_of_range.sum()
                
                if invalid_count > 0:
                    logger.warning(f"Found {invalid_count} out-of-range values in {col}, setting to NaN")
                    df.loc[out_of_range, col] = np.nan
        
        return df
    
    @staticmethod
    def remove_duplicate_timestamps(df: pd.DataFrame) -> pd.DataFrame:
        """
        Remove duplicate timestamps from telemetry data.
        
        Decision #6: Keep first occurrence, drop subsequent duplicates
        Justification: First occurrence is most likely accurate, duplicates are logging artifacts
        Impact: Removes <0.1% of telemetry points, ensures unique timestamps
        
        Args:
            df: DataFrame with timestamp column
            
        Returns:
            DataFrame with duplicates removed
        """
        if 'timestamp' not in df.columns:
            return df
        
        initial_len = len(df)
        df = df.drop_duplicates(subset=['timestamp'], keep='first')
        removed = initial_len - len(df)
        
        if removed > 0:
            logger.info(f"Removed {removed} duplicate timestamps ({removed/initial_len*100:.2f}%)")
        
        return df
