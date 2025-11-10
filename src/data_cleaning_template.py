"""
data_cleaning_template.py
---------------------------------
Provides standardized data cleaning functions for Hack the Track datasets.

Focuses on:
- Lap data cleaning
- Telemetry signal normalization
- Weather interpolation
- Race results imputation
"""

import pandas as pd
import numpy as np


def clean_lap_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean lap data by handling missing times and positions.
    Strategy:
    - Interpolate missing lap times.
    - Fill forward the driver name/position.
    - Ensure data types are consistent.
    """
    if df is None:
        return None

    if 'LAP_TIME' in df.columns:
        df['LAP_TIME'] = df['LAP_TIME'].interpolate(method='linear', limit_direction='forward')

    if 'POSITION' in df.columns:
        df['POSITION'] = df['POSITION'].ffill().bfill()

    df.fillna(0, inplace=True)
    return df


def clean_telemetry_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean telemetry data (e.g., speed, throttle, brake).
    Strategy:
    - Linear interpolation for numeric telemetry channels.
    - Remove impossible values (negative speed, throttle > 100).
    """
    if df is None:
        return None

    numeric_cols = df.select_dtypes(include=np.number).columns
    df[numeric_cols] = df[numeric_cols].interpolate(method='linear', limit_direction='forward')

    if 'Speed' in df.columns:
        df.loc[df['Speed'] < 0, 'Speed'] = np.nan
        df['Speed'] = df['Speed'].interpolate()

    if 'Throttle' in df.columns:
        df['Throttle'] = np.clip(df['Throttle'], 0, 100)

    df.dropna(how='all', inplace=True)
    return df


def clean_weather_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean weather data (temperature, humidity, wind speed).
    Strategy:
    - Use forward-fill for steady metrics.
    - Interpolate time-series metrics if timestamps exist.
    """
    if df is None:
        return None

    df.fillna(method='ffill', inplace=True)
    df.interpolate(method='linear', inplace=True)
    return df


def clean_race_results(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean provisional race results.
    Strategy:
    - Fill missing LAPS or STATUS with defaults.
    - Replace missing times with median or previous values.
    """
    if df is None:
        return None

    if 'LAPS' in df.columns:
        df['LAPS'] = df['LAPS'].fillna(df['LAPS'].median())

    if 'STATUS' in df.columns:
        df['STATUS'] = df['STATUS'].fillna('FINISHED')

    df.fillna(method='ffill', inplace=True)
    return df
