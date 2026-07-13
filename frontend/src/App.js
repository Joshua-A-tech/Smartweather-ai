import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { FaCloudSun, FaChartLine, FaRobot, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import AIChat from './pages/AIChat';
import Anomalies from './pages/Anomalies';

import './App.css';

function ThemedApp() {
  const { darkMode, toggleTheme } = useTheme();

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
                <Nav.Link as={Link} to="/anomalies">
                  <FaBell className="me-1" /> Alerts
                </Nav.Link>
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
