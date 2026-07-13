/**
 * Push Notification Service for SmartWeather
 * Uses browser Notification API
 */

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Request permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    console.log('Notifications denied');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send notification
export const sendNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }
  
  const defaultOptions = {
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return new Notification(title, mergedOptions);
};

// Send weather alert notification
export const sendWeatherAlert = (data) => {
  const { type, severity, message, temperature, device } = data;
  
  const icons = {
    frost: '❄️',
    heat: '🔥',
    rain: '🌧️',
    storm: '⚡',
    wind: '💨',
    default: '🌤️'
  };
  
  const emoji = icons[type] || icons.default;
  const title = `${emoji} SmartWeather Alert!`;
  
  const body = `${device}: ${message}`;
  if (temperature) {
    body += ` (${temperature}°C)`;
  }
  
  sendNotification(title, {
    body,
    requireInteraction: true,
    tag: `alert-${Date.now()}`,
  });
  
  // Also show in console
  console.log(`[${severity.toUpperCase()}] ${title} - ${body}`);
};

// Check for weather anomalies and send alerts
export const checkWeatherAlerts = (weatherData, previousData) => {
  const alerts = [];
  
  if (!weatherData) return alerts;
  
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const pressure = weatherData.pressure;
  const isRaining = weatherData.is_raining;
  
  // Temperature alerts
  if (temp > 35) {
    alerts.push({
      type: 'heat',
      severity: 'warning',
      message: `Extreme heat detected: ${temp}°C`,
      temperature: temp,
      device: weatherData.device_name || weatherData.device_id
    });
  }
  
  if (temp < 0) {
    alerts.push({
      type: 'frost',
      severity: 'warning',
      message: `Freezing temperature detected: ${temp}°C`,
      temperature: temp,
      device: weatherData.device_name || weatherData.device_id
    });
  }
  
  // Rain alert
  if (isRaining) {
    alerts.push({
      type: 'rain',
      severity: 'info',
      message: `Rain detected!`,
      device: weatherData.device_name || weatherData.device_id
    });
  }
  
  // Sudden changes
  if (previousData && previousData.temperature) {
    const tempChange = Math.abs(temp - previousData.temperature);
    if (tempChange > 5) {
      alerts.push({
        type: 'storm',
        severity: 'warning',
        message: `Sudden temperature change: ${tempChange}°C`,
        temperature: temp,
        device: weatherData.device_name || weatherData.device_id
      });
    }
  }
  
  return alerts;
};
