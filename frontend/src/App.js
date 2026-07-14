import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Badge } from 'react-bootstrap';
import { 
  FaCloudSun, FaChartLine, FaRobot, FaBell, FaMoon, FaSun, 
  FaBellSlash, FaChartBar, FaUser, FaCog
} from 'react-icons/fa';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import AIChat from './pages/AIChat';
import Anomalies from './pages/Anomalies';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AlertSettings from './pages/AlertSettings';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function ThemedApp() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg" className="mb-4 shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/dashboard">
              <FaCloudSun className="me-2" style={{ color: darkMode ? '#ffd700' : '#f39c12' }} />
              SmartWeather
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {user ? (
                  <>
                    <Nav.Link as={Link} to="/dashboard">
                      <FaChartLine className="me-1" /> Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/weather">
                      <FaCloudSun className="me-1" /> Weather
                    </Nav.Link>
                    <Nav.Link as={Link} to="/analytics">
                      <FaChartBar className="me-1" /> Analytics
                    </Nav.Link>
                    <Nav.Link as={Link} to="/ai-chat">
                      <FaRobot className="me-1" /> AI Chat
                    </Nav.Link>
                    <Nav.Link as={Link} to="/alerts">
                      <FaBell className="me-1" /> Alerts
                    </Nav.Link>
                    <Nav.Link as={Link} to="/profile">
                      <FaUser className="me-1" /> {user.email?.split('@')[0]}
                    </Nav.Link>
                    <Button variant="outline-danger" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Nav.Link as={Link} to="/login">
                    <FaUser className="me-1" /> Sign In
                  </Nav.Link>
                )}
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
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/ai-chat" element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            } />
            <Route path="/anomalies" element={
              <ProtectedRoute>
                <Anomalies />
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <AlertSettings />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
