"""
dataset_manager.py
---------------------------------
Central dataset manager for the Hack the Track project.
Handles loading and indexing of datasets across multiple tracks and races.

Compatible with Python 3.12.
"""

import os
import pandas as pd
from typing import Optional


class DatasetManager:
    """
    DatasetManager automatically scans and loads files from the dataset directory.
    It assumes the following structure:
        dataset/
            Barber/
                race_1/
                race_2/
                ...
            COTA/
            Road America/
            ...
    """

    def __init__(self, base_path: str = "./dataset"):
        self.base_path = base_path
        self.tracks = self._scan_tracks()

    def _scan_tracks(self) -> dict:
        """Scan all tracks and races under the base dataset directory."""
        track_map = {}
        for track_name in os.listdir(self.base_path):
            track_path = os.path.join(self.base_path, track_name)
            if os.path.isdir(track_path):
                races = [r for r in os.listdir(track_path) if os.path.isdir(os.path.join(track_path, r))]
                track_map[track_name] = sorted(races)
        return track_map

    def _get_file_path(self, track: str, race: int, file_type: str) -> Optional[str]:
        """Find a file matching the given type (lap_data, telemetry, weather, etc.)."""
        race_dir = os.path.join(self.base_path, track, f"race_{race}")
        if not os.path.exists(race_dir):
            return None
        for f in os.listdir(race_dir):
            if file_type.lower() in f.lower() and f.endswith(".csv"):
                return os.path.join(race_dir, f)
        return None

    def _load_csv(self, path: Optional[str]) -> Optional[pd.DataFrame]:
        """Load a CSV file safely into a pandas DataFrame."""
        if path and os.path.exists(path):
            return pd.read_csv(path)
        return None

    def get_lap_times(self, track: str, race: int) -> Optional[pd.DataFrame]:
        """Load lap data for the given track and race."""
        return self._load_csv(self._get_file_path(track, race, "lap"))

    def get_telemetry(self, track: str, race: int) -> Optional[pd.DataFrame]:
        """Load telemetry data for the given track and race."""
        return self._load_csv(self._get_file_path(track, race, "telemetry"))

    def get_weather(self, track: str, race: int) -> Optional[pd.DataFrame]:
        """Load weather data for the given track and race."""
        return self._load_csv(self._get_file_path(track, race, "weather"))

    def get_race_results(self, track: str, race: int) -> Optional[pd.DataFrame]:
        """Load race results (provRes) for the given track and race."""
        return self._load_csv(self._get_file_path(track, race, "provRes"))

    def summary(self):
        """Prints a quick overview of available tracks and races."""
        print("Available Tracks and Races:")
        for track, races in self.tracks.items():
            print(f"  {track}: {len(races)} races -> {', '.join(races)}")
