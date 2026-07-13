import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Badge } from 'react-bootstrap';
import { 
  FaCloudSun, FaChartLine, FaRobot, FaBell, FaMoon, FaSun, FaBellSlash 
} from 'react-icons/fa';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import AIChat from './pages/AIChat';
import Anomalies from './pages/Anomalies';

import { 
  requestNotificationPermission, 
  checkWeatherAlerts, 
  sendWeatherAlert 
} from './services/notificationService';

import './App.css';

function ThemedApp() {
  const { darkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lastWeather, setLastWeather] = useState(null);

  // Request notification permission on load
  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    };
    checkPermission();
  }, []);

  // Check for weather alerts periodically
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const response = await fetch('/api/v1/weather/current?device_id=ESP32-001');
        const data = await response.json();
        
        if (data && data.data) {
          const alerts = checkWeatherAlerts(data.data, lastWeather);
          
          alerts.forEach(alert => {
            setAlertCount(prev => prev + 1);
            if (notificationsEnabled) {
              sendWeatherAlert(alert);
            }
          });
          
          setLastWeather(data.data);
        }
      } catch (error) {
        console.log('Alert check failed:', error);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, [lastWeather, notificationsEnabled]);

  const enableNotifications = async () => {
    const enabled = await requestNotificationPermission();
    setNotificationsEnabled(enabled);
    if (enabled) {
      alert('✅ Notifications enabled! You will receive weather alerts.');
    } else {
      alert('❌ Please allow notifications in your browser settings.');
    }
  };

  const clearAlerts = () => {
    setAlertCount(0);
  };

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg" className="mb-4 shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <FaCloudSun className="me-2" style={{ color: darkMode ? '#ffd700' : '#f39c12' }} />
              SmartWeather
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">
                  <FaChartLine className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/weather">
                  <FaCloudSun className="me-1" /> Weather
                </Nav.Link>
                <Nav.Link as={Link} to="/ai-chat">
                  <FaRobot className="me-1" /> AI Chat
                </Nav.Link>
                <Nav.Link as={Link} to="/anomalies" className="position-relative">
                  <FaBell className="me-1" /> Alerts
                  {alertCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      onClick={clearAlerts}
                      style={{ cursor: 'pointer' }}
                    >
                      {alertCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Button
                  variant={notificationsEnabled ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={enableNotifications}
                  className="ms-2"
                  title={notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
                >
                  {notificationsEnabled ? <FaBell /> : <FaBellSlash />}
                </Button>
                <Button
                  variant={darkMode ? 'outline-light' : 'outline-dark'}
                  size="sm"
                  onClick={toggleTheme}
                  className="ms-2"
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container fluid className="px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </Container>

        <footer className={`text-center py-3 mt-5 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
          <Container>
            <small>SmartWeather © 2026 - AI-Enhanced IoT Weather Monitoring System</small>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
