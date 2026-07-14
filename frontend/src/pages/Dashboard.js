import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { 
  FaThermometerHalf, FaCompress, FaCloudRain, FaCloudSun, 
  FaRobot, FaSun, FaMoon
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { weatherAPI, healthAPI, aiAPI } from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ESP32-001');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDashboardData();
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await weatherAPI.getDevices();
      if (response.data && response.data.devices) {
        setDevices(response.data.devices);
        if (response.data.devices.length > 0) {
          setSelectedDevice(response.data.devices[0].device_id);
        }
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setDevices([{ device_id: 'ESP32-001', name: 'Garden Sensor' }]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [weatherRes, forecastRes, healthRes] = await Promise.all([
        weatherAPI.getCurrent(selectedDevice),
        aiAPI.getForecast(selectedDevice, 24),
        healthAPI.check()
      ]);
      
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setHealth(healthRes.data);
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (e) => {
    setSelectedDevice(e.target.value);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const weatherData = weather?.data || {};
  const forecastData = forecast?.forecast || [];
  
  const isRaining = weatherData.is_raining || weatherData.rainfall > 0;
  const lightValue = weatherData.light !== undefined ? weatherData.light : 0;
  const isDark = lightValue < 500;

  // Chart data
  const chartData = {
    labels: forecastData.map(f => `${f.hour}h`),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: forecastData.map(f => f.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Rain Probability (%)',
        data: forecastData.map(f => (f.rain_probability || 0) * 100),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
        fill: true,
        borderDash: [5, 5],
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '24-Hour Weather Forecast',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Rain Probability (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
  };

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Form>
            <Form.Group>
              <Form.Label>Select Device</Form.Label>
              <Form.Select value={selectedDevice} onChange={handleDeviceChange}>
                {devices.map(device => (
                  <option key={device.device_id} value={device.device_id}>
                    {device.name || device.device_id} {device.location ? `(${device.location})` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={8} className="text-end">
          <small className="text-muted">
            {devices.length} device(s) connected
          </small>
        </Col>
      </Row>

      <Alert variant={health?.status === 'operational' ? 'success' : 'warning'} className="mb-4">
        <strong>System Status:</strong> {health?.status || 'Unknown'} 
        {health?.services && (
          <span className="ms-3">
            API: {health.services.api} | MQTT: {health.services.mqtt}
          </span>
        )}
      </Alert>

      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaThermometerHalf size={30} className="text-danger mb-2" />
              <Card.Title>{weatherData.temperature ? weatherData.temperature.toFixed(1) : '--'}°C</Card.Title>
              <Card.Text className="text-muted">Temperature</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaCompress size={30} className="text-success mb-2" />
              <Card.Title>{weatherData.pressure ? weatherData.pressure.toFixed(1) : '--'} hPa</Card.Title>
              <Card.Text className="text-muted">Pressure</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              {isRaining ? (
                <FaCloudRain size={30} className="text-primary mb-2" />
              ) : (
                <FaCloudSun size={30} className="text-warning mb-2" />
              )}
              <Card.Title>{isRaining ? '🌧️ Raining' : '☀️ Dry'}</Card.Title>
              <Card.Text className="text-muted">Rain Status</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              {isDark ? (
                <FaMoon size={30} className="text-secondary mb-2" />
              ) : (
                <FaSun size={30} className="text-warning mb-2" />
              )}
              <Card.Title>{isDark ? '🌙 Dark' : '☀️ Light'}</Card.Title>
              <Card.Text className="text-muted">Light Level</Card.Text>
              <small className="text-muted">{lightValue}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Voice Assistant */}
      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <VoiceAssistant deviceId={selectedDevice} />
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Body>
              <Line data={chartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/weather'}
                >
                  <FaCloudSun className="me-2" />
                  View Full Weather
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => window.location.href = '/ai-chat'}
                >
                  <FaRobot className="me-2" />
                  Ask AI Assistant
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={fetchDashboardData}
                >
                  🔄 Refresh Data
                </button>
              </div>
              <hr />
              <small className="text-muted">
                Device: {weatherData.device_name || selectedDevice}
                <br />
                Updated: {weatherData.timestamp ? new Date(weatherData.timestamp).toLocaleString() : 'N/A'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
