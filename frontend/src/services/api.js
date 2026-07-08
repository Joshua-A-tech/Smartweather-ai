import axios from 'axios';

// Use the deployed backend URL in production
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
  getCurrent: (deviceId = 'ESP32-001') => 
    api.get(`/weather/current?device_id=${deviceId}`),
  
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
  
  ingest: (deviceId, limit = 100) =>
    api.post(`/ai/ingest?device_id=${deviceId}&limit=${limit}`),
  
  predict: (deviceId, hoursAhead = 24) =>
    api.post('/ai/predict', { device_id: deviceId, hours_ahead: hoursAhead }),
  
  test: () => api.get('/ai/test'),
  stats: () => api.get('/ai/stats'),
};

// Health API
const healthApi = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const healthAPI = {
  check: () => healthApi.get('/health'),
  root: () => healthApi.get('/'),
};

export default api;
