import pandas as pd
import numpy as np
from scipy.signal import savgol_filter
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class RacingLineGenerator:
    """
    Generates racing line visualization data from GPS telemetry.
    Converts GPS coordinates to local coordinates and applies smoothing.
    """
    
    @staticmethod
    def gps_to_local(gps_points: np.ndarray, origin: np.ndarray) -> np.ndarray:
        """
        Convert GPS coordinates to local coordinate system (meters).
        
        Args:
            gps_points: Array of [lat, long] coordinates
            origin: Origin point [lat, long]
            
        Returns:
            Array of [x, y] local coordinates in meters
        """
        # Approximate conversion (1 degree lat ~ 111km, 1 degree long varies by latitude)
        lat_to_meters = 111000
        long_to_meters = 111000 * np.cos(np.radians(origin[0]))
        
        # Calculate offsets from origin
        lat_offset = (gps_points[:, 0] - origin[0]) * lat_to_meters
        long_offset = (gps_points[:, 1] - origin[1]) * long_to_meters
        
        return np.column_stack([long_offset, lat_offset])
    
    @staticmethod
    def generate_racing_line(telemetry: pd.DataFrame) -> Dict:
        """
        Generate racing line from GPS telemetry data.
        
        Args:
            telemetry: DataFrame with GPS and speed data
            
        Returns:
            Dictionary with racing line coordinates and speed data
        """
        if telemetry is None or telemetry.empty:
            return {
                'error': 'No telemetry data available',
                'x': [],
                'y': [],
                'speed': [],
                'distance': []
            }
        
        # Check for required columns
        lat_col = 'VBOX_Lat_Min'
        long_col = 'VBOX_Long_Minutes'
        speed_col = 'Speed'
        distance_col = 'Laptrigger_lapdist_dls'
        
        required_cols = [lat_col, long_col]
        if not all(col in telemetry.columns for col in required_cols):
            logger.warning("Missing GPS columns in telemetry data")
            return {
                'error': 'Missing GPS data',
                'x': [],
                'y': [],
                'speed': [],
                'distance': []
            }
        
        # Extract GPS coordinates
        gps_data = telemetry[[lat_col, long_col]].dropna()
        
        if len(gps_data) < 10:
            logger.warning("Insufficient GPS data points")
            return {
                'error': 'Insufficient GPS data',
                'x': [],
                'y': [],
                'speed': [],
                'distance': []
            }
        
        gps_points = gps_data.values
        
        # Convert to local coordinates
        origin = gps_points[0]
        local_coords = RacingLineGenerator.gps_to_local(gps_points, origin)
        
        # Apply smoothing filter
        try:
            window = min(51, len(local_coords) // 2 * 2 + 1)  # Must be odd and <= data length
            if window < 5:
                window = 5
            
            poly_order = min(3, window - 1)
            
            x_smooth = savgol_filter(local_coords[:, 0], window, poly_order)
            y_smooth = savgol_filter(local_coords[:, 1], window, poly_order)
        except Exception as e:
            logger.warning(f"Smoothing failed, using raw coordinates: {e}")
            x_smooth = local_coords[:, 0]
            y_smooth = local_coords[:, 1]
        
        # Extract speed data (aligned with GPS points)
        speed_data = telemetry.loc[gps_data.index, speed_col].values if speed_col in telemetry.columns else np.zeros(len(gps_data))
        distance_data = telemetry.loc[gps_data.index, distance_col].values if distance_col in telemetry.columns else np.arange(len(gps_data))
        
        return {
            'x': x_smooth.tolist(),
            'y': y_smooth.tolist(),
            'speed': speed_data.tolist(),
            'distance': distance_data.tolist(),
            'origin': origin.tolist()
        }
    
    @staticmethod
    def calculate_speed_percentiles(speeds: list) -> Dict:
        """
        Calculate speed percentiles for color mapping.
        
        Args:
            speeds: List of speed values
            
        Returns:
            Dictionary with percentile values
        """
        if not speeds:
            return {'min': 0, 'max': 200, 'p25': 50, 'p50': 100, 'p75': 150}
        
        speeds_array = np.array(speeds)
        
        return {
            'min': float(np.min(speeds_array)),
            'max': float(np.max(speeds_array)),
            'p25': float(np.percentile(speeds_array, 25)),
            'p50': float(np.percentile(speeds_array, 50)),
            'p75': float(np.percentile(speeds_array, 75))
        }
    
    @staticmethod
    def compare_racing_lines(telemetry1: pd.DataFrame, telemetry2: pd.DataFrame) -> Dict:
        """
        Compare racing lines between two drivers.
        
        Args:
            telemetry1: Telemetry for driver 1
            telemetry2: Telemetry for driver 2
            
        Returns:
            Dictionary with both racing lines
        """
        line1 = RacingLineGenerator.generate_racing_line(telemetry1)
        line2 = RacingLineGenerator.generate_racing_line(telemetry2)
        
        return {
            'driver1': line1,
            'driver2': line2
        }
