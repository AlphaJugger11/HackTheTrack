import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class StrategyEngine:
    """
    Calculates pit stop strategy and tire degradation estimates.
    Provides recommendations for optimal pit windows and track position predictions.
    """
    
    @staticmethod
    def estimate_tire_degradation(lap_times: List[float], pit_laps: List[int]) -> float:
        """
        Estimate tire degradation rate based on lap time deltas.
        
        Uses linear regression on lap-to-lap deltas to find degradation trend.
        
        Args:
            lap_times: List of lap times
            pit_laps: List of lap numbers where pit stops occurred
            
        Returns:
            Degradation rate as percentage per lap
        """
        if len(lap_times) < 5:
            return 0.0
        
        # Split laps into stints (between pit stops)
        stints = StrategyEngine._split_by_pit_stops(lap_times, pit_laps)
        
        degradation_rates = []
        
        for stint in stints:
            if len(stint) < 3:
                continue
            
            # Calculate lap-to-lap delta
            deltas = np.diff(stint)
            
            # Linear regression to find degradation rate
            x = np.arange(len(deltas))
            if len(x) > 0 and len(deltas) > 0:
                slope, _ = np.polyfit(x, deltas, 1)
                degradation_rates.append(slope)
        
        if not degradation_rates:
            return 0.0
        
        # Average degradation rate across stints
        avg_degradation = np.mean(degradation_rates)
        
        # Convert to percentage (relative to best lap)
        best_lap = min(lap_times)
        if best_lap > 0:
            degradation_percent = (avg_degradation / best_lap) * 100
        else:
            degradation_percent = 0.0
        
        return float(max(0, degradation_percent))
    
    @staticmethod
    def _split_by_pit_stops(lap_times: List[float], pit_laps: List[int]) -> List[List[float]]:
        """Split lap times into stints based on pit stops."""
        if not pit_laps:
            return [lap_times]
        
        stints = []
        start_idx = 0
        
        for pit_lap in sorted(pit_laps):
            if pit_lap > start_idx:
                stint = lap_times[start_idx:pit_lap]
                if stint:
                    stints.append(stint)
                start_idx = pit_lap + 1
        
        # Add final stint
        if start_idx < len(lap_times):
            final_stint = lap_times[start_idx:]
            if final_stint:
                stints.append(final_stint)
        
        return stints
    
    @staticmethod
    def calculate_pit_window(
        current_lap: int,
        lap_times: List[float],
        total_laps: int,
        pit_loss_time: float = 25.0
    ) -> Dict:
        """
        Calculate optimal pit stop window.
        
        Balances tire degradation cost against pit stop time loss.
        
        Args:
            current_lap: Current lap number
            lap_times: Historical lap times
            total_laps: Total race laps
            pit_loss_time: Time lost in pit stop (seconds)
            
        Returns:
            Dictionary with pit window recommendation
        """
        if len(lap_times) < 5:
            return {
                'optimal_lap': current_lap + 10,
                'window_start': current_lap + 8,
                'window_end': current_lap + 12,
                'confidence': 'low',
                'justification': 'Insufficient data for accurate prediction'
            }
        
        # Estimate degradation rate
        degradation_rate = StrategyEngine.estimate_tire_degradation(lap_times, [])
        
        if degradation_rate <= 0:
            # No significant degradation detected
            return {
                'optimal_lap': total_laps,
                'window_start': total_laps - 5,
                'window_end': total_laps,
                'confidence': 'medium',
                'justification': 'No significant tire degradation detected, pit as late as possible'
            }
        
        # Calculate when cumulative degradation exceeds pit stop time
        laps_remaining = total_laps - current_lap
        cumulative_loss = []
        
        for future_lap in range(laps_remaining):
            time_loss = future_lap * degradation_rate * (lap_times[-1] if lap_times else 90) / 100
            cumulative_loss.append(time_loss)
        
        # Find when cumulative loss exceeds pit stop time
        optimal_offset = 0
        for i, loss in enumerate(cumulative_loss):
            if loss > pit_loss_time:
                optimal_offset = i
                break
        
        if optimal_offset == 0:
            optimal_offset = min(10, laps_remaining // 2)
        
        optimal_lap = current_lap + optimal_offset
        window_start = max(current_lap + 1, optimal_lap - 3)
        window_end = min(total_laps - 2, optimal_lap + 3)
        
        justification = f"Tire degradation at {degradation_rate:.2f}% per lap. " \
                       f"Optimal to pit around lap {optimal_lap} to minimize time loss."
        
        return {
            'optimal_lap': int(optimal_lap),
            'window_start': int(window_start),
            'window_end': int(window_end),
            'confidence': 'high',
            'degradation_rate': float(degradation_rate),
            'justification': justification
        }

    @staticmethod
    def predict_position_after_pit(
        current_position: int,
        current_lap: int,
        lap_times: pd.DataFrame,
        pit_loss_time: float = 25.0
    ) -> Dict:
        """
        Predict track position after pit stop.
        
        Args:
            current_position: Current track position
            current_lap: Current lap number
            lap_times: DataFrame with all drivers' lap times
            pit_loss_time: Time lost in pit stop
            
        Returns:
            Dictionary with position prediction
        """
        # This is a simplified prediction
        # In reality, would need to consider all drivers' positions and gaps
        
        # Estimate how many positions lost based on pit time and average lap time
        if not lap_times.empty:
            lap_time_col = 'LAP_TIME'
            avg_lap_time = lap_times[lap_time_col].mean()
            
            if avg_lap_time > 0:
                positions_lost = int(pit_loss_time / avg_lap_time) + 1
            else:
                positions_lost = 2
        else:
            positions_lost = 2
        
        predicted_position = current_position + positions_lost
        
        return {
            'predicted_position': int(predicted_position),
            'positions_lost': int(positions_lost),
            'confidence': 'medium'
        }
    
    @staticmethod
    def calculate_fuel_consumption(telemetry: pd.DataFrame) -> Dict:
        """
        Estimate fuel consumption from telemetry data.
        
        This is a simplified estimation based on throttle usage.
        
        Args:
            telemetry: DataFrame with telemetry data
            
        Returns:
            Dictionary with fuel consumption estimate
        """
        if telemetry is None or telemetry.empty:
            return {
                'estimated_consumption': 0.0,
                'confidence': 'low',
                'note': 'No telemetry data available'
            }
        
        # Simplified fuel consumption based on throttle usage
        if 'ath' in telemetry.columns:
            avg_throttle = telemetry['ath'].mean()
            
            # Rough estimate: higher throttle = more fuel
            # This is a placeholder - real calculation would be more complex
            consumption_factor = avg_throttle / 100.0
            
            return {
                'average_throttle': float(avg_throttle),
                'consumption_factor': float(consumption_factor),
                'confidence': 'low',
                'note': 'Simplified estimation based on throttle usage'
            }
        
        return {
            'estimated_consumption': 0.0,
            'confidence': 'low',
            'note': 'Throttle data not available'
        }
    
    @staticmethod
    def generate_strategy_recommendation(
        driver_number: str,
        current_lap: int,
        total_laps: int,
        lap_data: pd.DataFrame,
        position: int
    ) -> Dict:
        """
        Generate comprehensive strategy recommendation.
        
        Args:
            driver_number: Driver number
            current_lap: Current lap number
            total_laps: Total race laps
            lap_data: DataFrame with lap data for driver
            position: Current track position
            
        Returns:
            Complete strategy recommendation
        """
        # Get lap times (columns are now cleaned, no leading spaces)
        lap_time_col = 'LAP_TIME'
        lap_times = lap_data[lap_time_col].tolist() if lap_time_col in lap_data.columns else []
        
        # Identify pit laps
        pit_laps = []
        if 'is_pit_lap' in lap_data.columns:
            pit_lap_nums = lap_data[lap_data['is_pit_lap']].index.tolist()
            pit_laps = pit_lap_nums
        
        # Calculate pit window
        pit_window = StrategyEngine.calculate_pit_window(
            current_lap, lap_times, total_laps
        )
        
        # Estimate tire degradation
        degradation = StrategyEngine.estimate_tire_degradation(lap_times, pit_laps)
        
        # Predict position after pit
        position_prediction = StrategyEngine.predict_position_after_pit(
            position, current_lap, lap_data
        )
        
        # Determine recommendation
        if current_lap >= pit_window['window_start'] and current_lap <= pit_window['window_end']:
            recommendation = 'PIT_NOW'
            message = f"Within optimal pit window (laps {pit_window['window_start']}-{pit_window['window_end']})"
        elif current_lap < pit_window['window_start']:
            recommendation = 'STAY_OUT'
            laps_until_window = pit_window['window_start'] - current_lap
            message = f"Stay out for {laps_until_window} more laps"
        else:
            recommendation = 'PIT_ASAP'
            message = "Past optimal window, pit as soon as possible"
        
        return {
            'recommendation': recommendation,
            'message': message,
            'pit_window': pit_window,
            'tire_degradation_percent': float(degradation),
            'predicted_position_after_pit': position_prediction['predicted_position'],
            'current_position': int(position),
            'current_lap': int(current_lap),
            'total_laps': int(total_laps)
        }
