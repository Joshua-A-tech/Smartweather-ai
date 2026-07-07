import axios from 'axios';

// Use localhost:8000 for the backend
const API_BASE_URL = 'http://localhost:8000';
const API_V1_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_V1_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Weather API
export const weatherAPI = {
  getCurrent: (deviceId = 'ESP32-001') => 
    api.get(`/weather/current?device_id=${deviceId}`),
  
  getHistory: (deviceId, startTime, endTime, limit = 100) =>
    api.get(`/weather/history?device_id=${deviceId}&start_time=${startTime}&end_time=${endTime}&limit=${limit}`),
};

// AI API
export const aiAPI = {
  query: (question, deviceId = null) =>
    api.post('/ai/query', { question, device_id: deviceId }),
  
  getForecast: (deviceId, hours = 24) =>
    api.get(`/ai/forecast?device_id=${deviceId}&hours=${hours}`),
  
  getAnomalies: (deviceId, hours = 24) =>
    api.get(`/ai/anomalies?device_id=${deviceId}&hours=${hours}`),
  
  ingest: (deviceId, limit = 100) =>
    api.post(`/ai/ingest?device_id=${deviceId}&limit=${limit}`),
  
  predict: (deviceId, hoursAhead = 24) =>
    api.post('/ai/predict', { device_id: deviceId, hours_ahead: hoursAhead }),
  
  test: () => api.get('/ai/test'),
  stats: () => api.get('/ai/stats'),
};

// MQTT API
export const mqttAPI = {
  getStatus: () => api.get('/mqtt/status'),
};

// Health API (uses base URL without /api/v1)
const healthApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});

export const healthAPI = {
  check: () => healthApi.get('/health'),
  root: () => healthApi.get('/'),
};

export default api;
