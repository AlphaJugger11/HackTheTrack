import axios from 'axios';
import type {
  AvailableRaces,
  RaceMetadata,
  LapData,
  TelemetryPoint,
  StrategyRecommendation,
} from '../types/race.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const raceApi = {
  async getAvailableRaces(): Promise<AvailableRaces> {
    const response = await api.get<AvailableRaces>('/api/races');
    return response.data;
  },

  async getRaceMetadata(track: string, raceNum: number): Promise<RaceMetadata[]> {
    const response = await api.get<RaceMetadata[]>(`/api/races/${track}/${raceNum}`);
    return response.data;
  },

  async getLapData(track: string, raceNum: number): Promise<LapData[]> {
    const response = await api.get<LapData[]>(`/api/races/${track}/${raceNum}/laps`);
    return response.data;
  },

  async getTelemetry(
    track: string,
    raceNum: number,
    lap: number,
    sampleRate: number = 20,
    driver?: string
  ): Promise<TelemetryPoint[]> {
    const params: any = { sample_rate: sampleRate };
    if (driver) {
      params.driver = driver;
    }
    const response = await api.get<TelemetryPoint[]>(
      `/api/races/${track}/${raceNum}/telemetry/${lap}`,
      { params }
    );
    return response.data;
  },

  async getAnalytics(
    track: string,
    raceNum: number,
    driver: string
  ): Promise<any> {
    const response = await api.get(
      `/api/races/${track}/${raceNum}/analytics/${driver}`
    );
    return response.data;
  },

  async getStrategy(
    track: string,
    raceNum: number,
    driver: string,
    currentLap: number = 1
  ): Promise<StrategyRecommendation> {
    const response = await api.get<StrategyRecommendation>(
      `/api/races/${track}/${raceNum}/strategy`,
      { params: { driver, current_lap: currentLap } }
    );
    return response.data;
  },

  async getDrivers(track: string, raceNum: number): Promise<string[]> {
    const response = await api.get<{ drivers: string[] }>(
      `/api/races/${track}/${raceNum}/drivers`
    );
    return response.data.drivers;
  },

  async getWeather(track: string, raceNum: number): Promise<any[]> {
    const response = await api.get(`/api/races/${track}/${raceNum}/weather`);
    return response.data;
  },
};

export default api;
