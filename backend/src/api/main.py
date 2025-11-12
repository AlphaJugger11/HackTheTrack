from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="GR Cup Analytics Platform API",
    description="Real-time analytics and strategy platform for GR Cup Series",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add compression middleware for faster responses
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/")
async def root():
    return {
        "message": "GR Cup Analytics Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from fastapi import HTTPException, WebSocket
from data_processing.dataset_manager import DatasetManager
from data_processing.data_cleaner import DataCleaner
from data_processing.data_cache import DataCache
from analytics.lap_analyzer import LapAnalyzer
from analytics.performance_metrics import PerformanceMetrics
from analytics.racing_line import RacingLineGenerator
from strategy.strategy_engine import StrategyEngine
from api.websocket_handler import RaceSimulator

dataset_manager = DatasetManager()
data_cleaner = DataCleaner()
data_cache = DataCache()
lap_analyzer = LapAnalyzer()
performance_metrics = PerformanceMetrics()
racing_line_generator = RacingLineGenerator()
strategy_engine = StrategyEngine()
race_simulator = RaceSimulator(dataset_manager, data_cleaner)

data_cache.warm_cache(dataset_manager)

@app.get("/api/races")
async def get_available_races():
    """Get list of all available races."""
    races = dataset_manager.get_available_races()
    return {
        "tracks": races,
        "total_races": sum(len(r) for r in races.values())
    }

@app.get("/api/races/{track}/{race_num}")
async def get_race_metadata(track: str, race_num: int):
    """Get metadata for specific race."""
    cache_key = f"{track}_{race_num}_metadata"
    cached = data_cache.get(cache_key)
    
    if cached is not None:
        return cached.to_dict('records')
    
    results = dataset_manager.load_race_results(track, race_num)
    if results is None:
        raise HTTPException(status_code=404, detail=f"Race data not found for {track} Race {race_num}")
    
    data_cache.put(cache_key, results)
    return results.to_dict('records')

@app.get("/api/races/{track}/{race_num}/laps")
async def get_lap_data(track: str, race_num: int):
    """Get all lap data for specific race."""
    try:
        cache_key = f"{track}_{race_num}_laps"
        cached = data_cache.get(cache_key)
        
        if cached is not None:
            # Replace NaN with None for JSON serialization
            return cached.replace({float('nan'): None}).to_dict('records')
        
        lap_data = dataset_manager.load_lap_data(track, race_num)
        if lap_data is None:
            raise HTTPException(status_code=404, detail=f"Lap data not found for {track} Race {race_num}")
        
        cleaned_data = data_cleaner.clean_lap_data(lap_data)
        data_cache.put(cache_key, cleaned_data)
        
        # Replace NaN with None for JSON serialization
        return cleaned_data.replace({float('nan'): None}).to_dict('records')
    except Exception as e:
        logger.error(f"Error loading lap data for {track} Race {race_num}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/races/{track}/{race_num}/telemetry/{lap}")
async def get_telemetry_data(track: str, race_num: int, lap: int, sample_rate: int = 20):
    """
    Get telemetry data for specific lap.
    
    Args:
        sample_rate: Return every Nth point (default 20 for 20x reduction)
    """
    try:
        cache_key = f"{track}_{race_num}_telemetry_lap_{lap}_sample_{sample_rate}"
        cached = data_cache.get(cache_key)
        
        if cached is not None:
            # Replace NaN with None for JSON serialization
            return cached.replace({float('nan'): None}).to_dict('records')
        
        telemetry = dataset_manager.load_telemetry_data(track, race_num, lap)
        if telemetry is None or telemetry.empty:
            raise HTTPException(status_code=404, detail=f"Telemetry data not found for lap {lap}")
        
        cleaned_telemetry = data_cleaner.clean_telemetry_data(telemetry)
        
        # Sample data to reduce size (every Nth point)
        
        if len(cleaned_telemetry) > 10000:
            sampled_telemetry = cleaned_telemetry.iloc[::sample_rate].copy()
            logger.info(f"Sampled telemetry from {len(cleaned_telemetry)} to {len(sampled_telemetry)} points")
        else:
            sampled_telemetry = cleaned_telemetry
        
        data_cache.put(cache_key, sampled_telemetry)
        
        # Replace NaN with None for JSON serialization
        return sampled_telemetry.replace({float('nan'): None}).to_dict('records')
    except Exception as e:
        logger.error(f"Error loading telemetry for {track} Race {race_num} Lap {lap}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/races/{track}/{race_num}/drivers")
async def get_drivers(track: str, race_num: int):
    """Get list of drivers for specific race."""
    drivers = dataset_manager.get_driver_list(track, race_num)
    return {"drivers": drivers}

@app.get("/api/races/{track}/{race_num}/weather")
async def get_weather_data(track: str, race_num: int):
    """Get weather data for specific race."""
    weather = dataset_manager.load_weather_data(track, race_num)
    if weather is None:
        raise HTTPException(status_code=404, detail=f"Weather data not found for {track} Race {race_num}")
    
    return weather.to_dict('records')

@app.get("/api/races/{track}/{race_num}/analytics/{driver}")
async def get_driver_analytics(track: str, race_num: int, driver: str):
    """Get analytics data for specific driver."""
    try:
        lap_data = dataset_manager.load_lap_data(track, race_num)
        if lap_data is None:
            raise HTTPException(status_code=404, detail="Lap data not found")
        
        cleaned_data = data_cleaner.clean_lap_data(lap_data)
        
        # Try both string and numeric comparison for driver number
        driver_laps = cleaned_data[cleaned_data['NUMBER'].astype(str) == str(driver)]
        if driver_laps.empty:
            try:
                driver_laps = cleaned_data[cleaned_data['NUMBER'] == int(driver)]
            except:
                pass
        
        if driver_laps.empty:
            available_drivers = cleaned_data['NUMBER'].unique().tolist()
            raise HTTPException(
                status_code=404, 
                detail=f"No data found for driver {driver}. Available drivers: {available_drivers}"
            )
        
        # Analyze lap times
        analysis = lap_analyzer.analyze_lap_times(driver_laps)
        
        # Replace NaN with None for JSON serialization
        for key, value in analysis.items():
            if isinstance(value, float) and pd.isna(value):
                analysis[key] = None
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics for {track} Race {race_num} Driver {driver}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/races/{track}/{race_num}/strategy")
async def get_strategy_recommendation(track: str, race_num: int, driver: str, current_lap: int = 1):
    """Get strategy recommendation for driver."""
    try:
        lap_data = dataset_manager.load_lap_data(track, race_num)
        if lap_data is None:
            raise HTTPException(status_code=404, detail="Lap data not found")
        
        cleaned_data = data_cleaner.clean_lap_data(lap_data)
        
        # Try both string and numeric comparison for driver number
        driver_laps = cleaned_data[cleaned_data['NUMBER'].astype(str) == str(driver)]
        if driver_laps.empty:
            # Try numeric comparison
            try:
                driver_laps = cleaned_data[cleaned_data['NUMBER'] == int(driver)]
            except:
                pass
        
        if driver_laps.empty:
            available_drivers = cleaned_data['NUMBER'].unique().tolist()
            raise HTTPException(
                status_code=404, 
                detail=f"No data found for driver {driver}. Available drivers: {available_drivers}"
            )
        
        total_laps = cleaned_data[' LAP_NUMBER'].max() if ' LAP_NUMBER' in cleaned_data.columns else cleaned_data['LAP_NUMBER'].max()
        
        position = 1
        
        strategy = strategy_engine.generate_strategy_recommendation(
            driver, current_lap, int(total_laps), driver_laps, position
        )
        
        # Replace NaN with None for JSON serialization
        for key, value in strategy.items():
            if isinstance(value, float) and pd.isna(value):
                strategy[key] = None
        
        return strategy
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating strategy for {track} Race {race_num} Driver {driver}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics."""
    return data_cache.get_stats()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time race simulation."""
    await race_simulator.handle_websocket(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
