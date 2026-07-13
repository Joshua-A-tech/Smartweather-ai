import React from 'react';
import {
  FaSun, FaMoon, FaCloudSun, FaCloudMoon, FaCloud,
  FaCloudRain, FaCloudShowersHeavy, FaSnowflake,
  FaWind, FaBolt, FaSmog, FaQuestionCircle
} from 'react-icons/fa';

const WeatherIcon = ({ condition, size = 40, animated = true }) => {
  const icons = {
    sunny: { icon: FaSun, color: '#f39c12', emoji: '☀️' },
    clear_night: { icon: FaMoon, color: '#bdc3c7', emoji: '🌙' },
    partly_cloudy: { icon: FaCloudSun, color: '#f39c12', emoji: '⛅' },
    partly_cloudy_night: { icon: FaCloudMoon, color: '#bdc3c7', emoji: '🌤️' },
    cloudy: { icon: FaCloud, color: '#95a5a6', emoji: '☁️' },
    rain: { icon: FaCloudRain, color: '#3498db', emoji: '🌧️' },
    heavy_rain: { icon: FaCloudShowersHeavy, color: '#2980b9', emoji: '⛈️' },
    snow: { icon: FaSnowflake, color: '#ecf0f1', emoji: '❄️' },
    windy: { icon: FaWind, color: '#95a5a6', emoji: '💨' },
    storm: { icon: FaBolt, color: '#f1c40f', emoji: '⚡' },
    foggy: { icon: FaSmog, color: '#95a5a6', emoji: '🌫️' },
    default: { icon: FaQuestionCircle, color: '#95a5a6', emoji: '❓' }
  };

  const selected = icons[condition] || icons.default;
  const IconComponent = selected.icon;

  return (
    <div className="weather-icon" style={{ textAlign: 'center', display: 'inline-block' }}>
      <div className={`weather-icon-${animated ? 'animated' : 'static'}`}>
        <IconComponent 
          size={size} 
          color={selected.color}
          className={animated ? 'pulse' : ''}
        />
      </div>
      <div style={{ fontSize: size * 0.6, marginTop: 4 }}>
        {selected.emoji}
      </div>
    </div>
  );
};

export default WeatherIcon;
