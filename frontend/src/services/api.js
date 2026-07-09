import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const weatherAPI = {
  // Get all devices
  getDevices: () => api.get('/devices'),
  
  // Get current weather for a specific device
  getCurrent: (deviceId = 'ESP32-001') => 
    api.get(`/weather/current?device_id=${deviceId}`),
  
  // Get history for a specific device
  getHistory: (deviceId, limit = 100) =>
    api.get(`/weather/history?device_id=${deviceId}&limit=${limit}`),
};

export const aiAPI = {
  query: (question, deviceId = null) =>
    api.post('/ai/query', { question, device_id: deviceId }),
  
  getForecast: (deviceId, hours = 24) =>
    api.get(`/ai/forecast?device_id=${deviceId}&hours=${hours}`),
  
  getAnomalies: (deviceId, hours = 24) =>
    api.get(`/ai/anomalies?device_id=${deviceId}&hours=${hours}`),
  
  test: () => api.get('/ai/test'),
  stats: () => api.get('/ai/stats'),
};

const healthApi = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const healthAPI = {
  check: () => healthApi.get('/health'),
  root: () => healthApi.get('/'),
};

export default api;
