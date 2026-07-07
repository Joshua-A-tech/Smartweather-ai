import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { 
  FaThermometerHalf, FaTint, FaCompress, FaWind, 
  FaCloudRain, FaCloudSun, FaChartLine, FaRobot 
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
  Legend
} from 'chart.js';
import { weatherAPI, healthAPI, aiAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from backend
      const [weatherRes, forecastRes, healthRes] = await Promise.all([
        weatherAPI.getCurrent('ESP32-001'),
        aiAPI.getForecast('ESP32-001', 24),
        healthAPI.check()
      ]);
      
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setHealth(healthRes.data);
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load data from server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
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

  // Prepare chart data from real forecast
  const chartData = {
    labels: forecastData.map(f => `+${f.hour}h`),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: forecastData.map(f => f.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        data: forecastData.map(f => f.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '24-Hour Weather Forecast (LSTM Model)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Determine if it's raining
  const isRaining = weatherData.is_raining || weatherData.rainfall > 0;
  const rainIcon = isRaining ? <FaCloudRain size={30} className="text-primary mb-2" /> : <FaCloudSun size={30} className="text-warning mb-2" />;
  const rainText = isRaining ? "Raining" : "Dry";

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Health Status */}
      <Alert variant={health?.status === 'operational' ? 'success' : 'warning'} className="mb-4">
        <strong>System Status:</strong> {health?.status || 'Unknown'} 
        {health?.services && (
          <span className="ms-3">
            API: {health.services.api} | MQTT: {health.services.mqtt}
          </span>
        )}
      </Alert>

      {/* Weather Cards - Now showing REAL data */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaThermometerHalf size={30} className="text-danger mb-2" />
              <Card.Title>{weatherData.temperature || '--'}°C</Card.Title>
              <Card.Text className="text-muted">Temperature</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaCompress size={30} className="text-success mb-2" />
              <Card.Title>{weatherData.pressure || '--'} hPa</Card.Title>
              <Card.Text className="text-muted">Pressure</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              {rainIcon}
              <Card.Title>{rainText}</Card.Title>
              <Card.Text className="text-muted">Rain Status</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaChartLine size={30} className="text-info mb-2" />
              <Card.Title>{weatherData.altitude || '--'} m</Card.Title>
              <Card.Text className="text-muted">Altitude</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
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
                  <FaCloudRain className="me-2" />
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
                Last updated: {weatherData.timestamp ? new Date(weatherData.timestamp).toLocaleString() : 'N/A'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
