import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FaCloudSun, FaChartLine, FaRobot, FaBell } from 'react-icons/fa';

// Import pages
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import AIChat from './pages/AIChat';
import Anomalies from './pages/Anomalies';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <FaCloudSun className="me-2" />
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
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Main Content */}
        <Container fluid className="px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </Container>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-3 mt-5">
          <Container>
            <small>
              SmartWeather © 2026 - AI-Enhanced IoT Weather Monitoring System
            </small>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;
