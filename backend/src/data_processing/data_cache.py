from collections import OrderedDict
import pandas as pd
import sys
import logging
from typing import Optional, Any

from config import CACHE_MAX_SIZE_MB

logger = logging.getLogger(__name__)


class DataCache:
    """
    In-memory LRU cache for race data.
    Implements Least Recently Used eviction policy to manage memory usage.
    """
    
    def __init__(self, max_size_mb: int = CACHE_MAX_SIZE_MB):
        self.cache = OrderedDict()
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.current_size_bytes = 0
        self.hits = 0
        self.misses = 0
        logger.info(f"DataCache initialized with max size {max_size_mb}MB")
    
    def _get_size(self, obj: Any) -> int:
        """Estimate memory size of object in bytes."""
        if isinstance(obj, pd.DataFrame):
            return obj.memory_usage(deep=True).sum()
        else:
            return sys.getsizeof(obj)
    
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve item from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached object or None if not found
        """
        if key in self.cache:
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.hits += 1
            logger.debug(f"Cache hit: {key}")
            return self.cache[key]
        
        self.misses += 1
        logger.debug(f"Cache miss: {key}")
        return None
    
    def put(self, key: str, value: Any) -> None:
        """
        Store item in cache with LRU eviction.
        
        Args:
            key: Cache key
            value: Object to cache
        """
        # If key exists, remove it first to update size
        if key in self.cache:
            old_size = self._get_size(self.cache[key])
            self.current_size_bytes -= old_size
            del self.cache[key]
        
        # Calculate size of new value
        value_size = self._get_size(value)
        
        # Evict least recently used items if necessary
        while self.current_size_bytes + value_size > self.max_size_bytes and self.cache:
            evicted_key, evicted_value = self.cache.popitem(last=False)
            evicted_size = self._get_size(evicted_value)
            self.current_size_bytes -= evicted_size
            logger.info(f"Evicted cache entry: {evicted_key} ({evicted_size / 1024 / 1024:.2f}MB)")
        
        # Add new value
        self.cache[key] = value
        self.current_size_bytes += value_size
        logger.debug(f"Cached: {key} ({value_size / 1024 / 1024:.2f}MB)")
    
    def clear(self) -> None:
        """Clear all cached data."""
        self.cache.clear()
        self.current_size_bytes = 0
        logger.info("Cache cleared")
    
    def get_stats(self) -> dict:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        total_requests = self.hits + self.misses
        hit_rate = self.hits / total_requests if total_requests > 0 else 0
        
        return {
            "size_mb": self.current_size_bytes / 1024 / 1024,
            "max_size_mb": self.max_size_bytes / 1024 / 1024,
            "entries": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": hit_rate
        }
    
    def warm_cache(self, dataset_manager) -> None:
        """
        Pre-load frequently accessed data into cache.
        
        Args:
            dataset_manager: DatasetManager instance to load data from
        """
        logger.info("Warming cache with race metadata...")
        
        available_races = dataset_manager.get_available_races()
        
        # Cache metadata for all races
        for track, races in available_races.items():
            for race_num in races:
                key = f"{track}_{race_num}_metadata"
                
                # Load race results as metadata
                results = dataset_manager.load_race_results(track, race_num)
                if results is not None:
                    self.put(key, results)
        
        stats = self.get_stats()
        logger.info(f"Cache warmed: {stats['entries']} entries, {stats['size_mb']:.2f}MB")
