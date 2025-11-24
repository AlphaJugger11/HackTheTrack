from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class RaceSimulator:
    """
    Handles real-time race simulation via WebSocket.
    Streams lap updates to connected clients.
    """
    
    def __init__(self, dataset_manager, data_cleaner):
        self.dataset_manager = dataset_manager
        self.data_cleaner = data_cleaner
        self.active_simulations: Dict[str, Dict] = {}
    
    async def handle_websocket(self, websocket: WebSocket):
        """
        Handle WebSocket connection for race simulation.
        
        Args:
            websocket: WebSocket connection
        """
        await websocket.accept()
        logger.info("WebSocket connection established")
        
        simulation_state = {
            'is_playing': False,
            'current_lap': 0,
            'speed': 1,
            'track': None,
            'race_num': None,
            'lap_data': None
        }
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get('type')
                
                if message_type == 'start_simulation':
                    await self._start_simulation(websocket, message, simulation_state)
                
                elif message_type == 'pause_simulation':
                    simulation_state['is_playing'] = False
                    await websocket.send_json({'type': 'paused'})
                
                elif message_type == 'resume_simulation':
                    simulation_state['is_playing'] = True
                    await self._continue_simulation(websocket, simulation_state)
                
                elif message_type == 'set_speed':
                    simulation_state['speed'] = message.get('speed', 1)
                    await websocket.send_json({
                        'type': 'speed_changed',
                        'speed': simulation_state['speed']
                    })
                
                elif message_type == 'jump_to_lap':
                    lap = message.get('lap', 1)
                    simulation_state['current_lap'] = lap
                    await self._send_lap_update(websocket, simulation_state)
                
                elif message_type == 'stop_simulation':
                    simulation_state['is_playing'] = False
                    simulation_state['current_lap'] = 0
                    await websocket.send_json({'type': 'stopped'})
        
        except WebSocketDisconnect:
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            await websocket.send_json({
                'type': 'error',
                'message': str(e)
            })
    
    async def _start_simulation(self, websocket: WebSocket, message: Dict, state: Dict):
        """Start race simulation."""
        track = message.get('track')
        race_num = message.get('race_num')
        speed = message.get('speed', 1)
        
        if not track or not race_num:
            await websocket.send_json({
                'type': 'error',
                'message': 'Track and race_num required'
            })
            return
        
        # Load lap data
        lap_data = self.dataset_manager.load_lap_data(track, race_num)
        if lap_data is None:
            await websocket.send_json({
                'type': 'error',
                'message': f'Race data not found for {track} Race {race_num}'
            })
            return
        
        cleaned_data = self.data_cleaner.clean_lap_data(lap_data)
        
        # Update state
        state['track'] = track
        state['race_num'] = race_num
        state['lap_data'] = cleaned_data
        state['speed'] = speed
        state['current_lap'] = 1
        state['is_playing'] = True
        
        # Get total laps
        lap_col = 'LAP_NUMBER'
        total_laps = int(cleaned_data[lap_col].max())
        
        await websocket.send_json({
            'type': 'simulation_started',
            'track': track,
            'race_num': race_num,
            'total_laps': total_laps
        })
        
        # Start streaming laps
        await self._continue_simulation(websocket, state)
    
    async def _continue_simulation(self, websocket: WebSocket, state: Dict):
        """Continue simulation from current lap."""
        if state['lap_data'] is None:
            return
        
        lap_col = 'LAP_NUMBER'
        total_laps = int(state['lap_data'][lap_col].max())
        
        while state['is_playing'] and state['current_lap'] <= total_laps:
            await self._send_lap_update(websocket, state)
            
            # Wait based on playback speed (2 seconds per lap at 1x)
            await asyncio.sleep(2.0 / state['speed'])
            
            state['current_lap'] += 1
        
        if state['current_lap'] > total_laps:
            state['is_playing'] = False
            await websocket.send_json({'type': 'simulation_complete'})
    
    async def _send_lap_update(self, websocket: WebSocket, state: Dict):
        """Send lap update to client."""
        lap_data = state['lap_data']
        current_lap = state['current_lap']
        
        lap_col = 'LAP_NUMBER'
        
        # Get data for current lap
        lap_info = lap_data[lap_data[lap_col] == current_lap]
        
        if lap_info.empty:
            return
        
        # Convert to records
        drivers_data = lap_info.to_dict('records')
        
        # Send update
        await websocket.send_json({
            'type': 'lap_update',
            'lap': current_lap,
            'drivers': drivers_data
        })
