import os
import pandas as pd
from pathlib import Path
from typing import Optional, List, Dict
import logging

from config import DATASET_DIR, TRACKS
from constants import TRACK_NAMES, RACE_NUMBERS

logger = logging.getLogger(__name__)


class DatasetManager:
    """
    Manages loading and indexing of race data from CSV files.
    Scans the dataset directory and provides methods to load various data types.
    """
    
    def __init__(self, dataset_path: Path = DATASET_DIR):
        self.dataset_path = Path(dataset_path)
        self.available_races = self._scan_available_races()
        logger.info(f"DatasetManager initialized with {len(self.available_races)} races")
    
    def _scan_available_races(self) -> Dict[str, List[int]]:
        """
        Scan dataset directory to find available tracks and races.
        
        Returns:
            Dictionary mapping track names to list of available race numbers
        """
        available = {}
        
        for track in TRACKS:
            track_path = self.dataset_path / track
            
            if not track_path.exists():
                logger.warning(f"Track directory not found: {track}")
                continue
            
            # Check for race data files
            races = []
            for race_num in RACE_NUMBERS:
                # Look for race-specific files
                if self._has_race_data(track, race_num):
                    races.append(race_num)
            
            if races:
                available[track] = races
                logger.info(f"Found {len(races)} races for {track}")
        
        return available
    
    def _has_race_data(self, track: str, race_num: int) -> bool:
        """Check if race data exists for given track and race number."""
        track_path = self.dataset_path / track
        
        # For barber, files are in root directory
        if track.lower() == "barber":
            race_prefix = f"R{race_num}_barber"
            files = list(track_path.glob(f"{race_prefix}*.csv"))
            return len(files) > 0
        
        # For other tracks, check Race X subdirectory
        race_dir = track_path / f"Race {race_num}"
        return race_dir.exists() and any(race_dir.glob("*.csv"))
    
    def get_available_races(self) -> Dict[str, List[int]]:
        """
        Get list of all available races.
        
        Returns:
            Dictionary mapping track names to list of race numbers
        """
        return self.available_races
    
    def load_lap_data(self, track: str, race_num: int) -> Optional[pd.DataFrame]:
        """
        Load lap timing data for specified race.
        
        Args:
            track: Track name (e.g., 'barber', 'COTA')
            race_num: Race number (1 or 2)
            
        Returns:
            DataFrame with lap timing data or None if not found
        """
        try:
            track_path = self.dataset_path / track
            
            if track.lower() == "barber":
                # Barber files are in root directory
                lap_time_file = track_path / f"R{race_num}_barber_lap_time.csv"
                analysis_file = track_path / f"23_AnalysisEnduranceWithSections_Race {race_num}_Anonymized.CSV"
                
                if lap_time_file.exists() and analysis_file.exists():
                    lap_times = pd.read_csv(lap_time_file)
                    analysis = pd.read_csv(analysis_file, sep=';')
                    
                    # Merge lap times with sector data from analysis
                    merged = self._merge_lap_data(lap_times, analysis)
                    logger.info(f"Loaded {len(merged)} laps for {track} Race {race_num}")
                    return merged
            else:
                # Other tracks have Race X subdirectory
                race_dir = track_path / f"Race {race_num}"
                analysis_file = list(race_dir.glob("*AnalysisEndurance*.CSV"))
                
                if analysis_file:
                    df = pd.read_csv(analysis_file[0], sep=';')
                    # Strip whitespace from column names for consistency
                    df.columns = df.columns.str.strip()
                    logger.info(f"Loaded {len(df)} laps for {track} Race {race_num}")
                    return df
            
            logger.warning(f"No lap data found for {track} Race {race_num}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading lap data for {track} Race {race_num}: {e}")
            return None

    def _merge_lap_data(self, lap_times: pd.DataFrame, analysis: pd.DataFrame) -> pd.DataFrame:
        """Merge lap time events with sector analysis data."""
        # Analysis data has the sector times we need
        # Strip whitespace from column names for consistency
        analysis.columns = analysis.columns.str.strip()
        return analysis
    
    def load_telemetry_data(self, track: str, race_num: int, lap: Optional[int] = None) -> Optional[pd.DataFrame]:
        """
        Load telemetry data for specified race and optionally specific lap.
        
        Args:
            track: Track name
            race_num: Race number
            lap: Optional lap number to filter by (loads all if None)
            
        Returns:
            DataFrame with telemetry data or None if not found
        """
        try:
            track_path = self.dataset_path / track
            
            if track.lower() == "barber":
                telemetry_file = track_path / f"R{race_num}_barber_telemetry_data.csv"
            else:
                race_dir = track_path / f"Race {race_num}"
                telemetry_files = list(race_dir.glob("*telemetry*.csv"))
                telemetry_file = telemetry_files[0] if telemetry_files else None
            
            if telemetry_file and Path(telemetry_file).exists():
                # If specific lap requested, filter during load for efficiency
                if lap is not None:
                    # Read in chunks to filter by lap without loading entire file
                    chunks = []
                    for chunk in pd.read_csv(telemetry_file, chunksize=10000):
                        if 'lap' in chunk.columns:
                            lap_chunk = chunk[chunk['lap'] == lap]
                            if not lap_chunk.empty:
                                chunks.append(lap_chunk)
                    
                    if chunks:
                        df = pd.concat(chunks, ignore_index=True)
                        logger.info(f"Loaded {len(df)} telemetry points for {track} Race {race_num} Lap {lap}")
                        return df
                    else:
                        logger.warning(f"No telemetry data found for lap {lap}")
                        return None
                else:
                    # Load all telemetry (use with caution - can be large)
                    df = pd.read_csv(telemetry_file)
                    logger.info(f"Loaded {len(df)} telemetry points for {track} Race {race_num}")
                    return df
            
            logger.warning(f"No telemetry file found for {track} Race {race_num}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading telemetry data: {e}")
            return None
    
    def load_weather_data(self, track: str, race_num: int) -> Optional[pd.DataFrame]:
        """
        Load weather data for specified race.
        
        Args:
            track: Track name
            race_num: Race number
            
        Returns:
            DataFrame with weather data or None if not found
        """
        try:
            track_path = self.dataset_path / track
            
            if track.lower() == "barber":
                weather_file = track_path / f"26_Weather_Race {race_num}_Anonymized.CSV"
            else:
                race_dir = track_path / f"Race {race_num}"
                weather_files = list(race_dir.glob("*Weather*.CSV"))
                weather_file = weather_files[0] if weather_files else None
            
            if weather_file and Path(weather_file).exists():
                df = pd.read_csv(weather_file, sep=';')
                logger.info(f"Loaded weather data for {track} Race {race_num}")
                return df
            
            logger.warning(f"No weather data found for {track} Race {race_num}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading weather data: {e}")
            return None
    
    def load_race_results(self, track: str, race_num: int) -> Optional[pd.DataFrame]:
        """
        Load race results for specified race.
        
        Args:
            track: Track name
            race_num: Race number
            
        Returns:
            DataFrame with race results or None if not found
        """
        try:
            track_path = self.dataset_path / track
            
            if track.lower() == "barber":
                results_file = track_path / f"03_Provisional Results_Race {race_num}_Anonymized.CSV"
            else:
                race_dir = track_path / f"Race {race_num}"
                results_files = list(race_dir.glob("*Results*.CSV"))
                results_file = results_files[0] if results_files else None
            
            if results_file and Path(results_file).exists():
                df = pd.read_csv(results_file, sep=';')
                logger.info(f"Loaded race results for {track} Race {race_num}")
                return df
            
            logger.warning(f"No race results found for {track} Race {race_num}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading race results: {e}")
            return None
    
    def get_driver_list(self, track: str, race_num: int) -> List[str]:
        """
        Get list of driver numbers for specified race.
        
        Args:
            track: Track name
            race_num: Race number
            
        Returns:
            List of driver numbers as strings
        """
        results = self.load_race_results(track, race_num)
        if results is not None and 'NUMBER' in results.columns:
            return results['NUMBER'].astype(str).tolist()
        return []
