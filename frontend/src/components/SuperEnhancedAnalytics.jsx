import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Spinner, Alert, Form, Button, Table, Badge
} from 'react-bootstrap';
import {
  FaChartLine, FaCalendarAlt, FaDownload, FaThermometerHalf,
  FaTint, FaCompress, FaCloudRain, FaSun, FaMoon,
  FaExclamationTriangle, FaClock, FaCloudSun, FaFilePdf,
  FaChartBar, FaChartArea, FaChartPie, FaSync
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import { weatherAPI } from '../services/api';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD93D', '#6C5CE7'];

const SuperEnhancedAnalytics = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ESP32-001');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(7);
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState('temperature');

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchAnalytics();
    }
  }, [selectedDevice, dateRange]);

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

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await weatherAPI.getHistory(selectedDevice, dateRange * 24);
      const data = response.data.data || [];
      setHistory(data);

      if (data.length > 0) {
        const stats = calculateStats(data);
        setStats(stats);
        setEvents(detectEvents(data));
      }

    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const temps = data.map(d => d.temperature).filter(t => t !== null && t !== undefined);
    const humidities = data.map(d => d.humidity).filter(h => h !== null && h !== undefined);
    const pressures = data.map(d => d.pressure).filter(p => p !== null && p !== undefined);
    const rains = data.filter(d => d.is_raining || d.rainfall > 0);

    return {
      avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps) : 0,
      avgHumidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0,
      avgPressure: pressures.length > 0 ? pressures.reduce((a, b) => a + b, 0) / pressures.length : 0,
      rainDays: rains.length,
      totalRecords: data.length,
      tempRange: temps.length > 0 ? Math.max(...temps) - Math.min(...temps) : 0
    };
  };

  const detectEvents = (data) => {
    const events = [];

    const heatwave = data.filter(d => d.temperature > 35);
    if (heatwave.length > 0) {
      events.push({
        type: 'heatwave',
        severity: 'warning',
        message: `Heatwave detected: ${heatwave.length} records above 35°C`,
        count: heatwave.length,
        date: heatwave[0].created_at
      });
    }

    const frost = data.filter(d => d.temperature < 0);
    if (frost.length > 0) {
      events.push({
        type: 'frost',
        severity: 'warning',
        message: `Frost detected: ${frost.length} records below 0°C`,
        count: frost.length,
        date: frost[0].created_at
      });
    }

    const rainEvents = data.filter(d => d.is_raining || d.rainfall > 2);
    if (rainEvents.length > 0) {
      events.push({
        type: 'rain',
        severity: 'info',
        message: `Rain events: ${rainEvents.length} records with significant rainfall`,
        count: rainEvents.length,
        date: rainEvents[0].created_at
      });
    }

    return events;
  };

  const getEventIcon = (type) => {
    const icons = {
      heatwave: <FaSun className="text-danger" />,
      frost: <FaMoon className="text-info" />,
      rain: <FaCloudRain className="text-primary" />
    };
    return icons[type] || <FaExclamationTriangle />;
  };

  const getEventBadge = (severity) => {
    const variants = {
      warning: 'warning',
      info: 'info',
      danger: 'danger'
    };
    return variants[severity] || 'secondary';
  };

  // Prepare data for Recharts
  const prepareChartData = () => {
    return history.map(item => ({
      time: format(new Date(item.created_at), 'MM/dd HH:mm'),
      temperature: item.temperature || 0,
      humidity: item.humidity || 0,
      pressure: item.pressure || 0,
      rainfall: item.rainfall || 0,
    }));
  };

  const chartData = prepareChartData();

  const getMetricColor = () => {
    const colors = {
      temperature: '#FF6B6B',
      humidity: '#4ECDC4',
      pressure: '#45B7D1',
      rainfall: '#96CEB4',
    };
    return colors[metric] || '#8884d8';
  };

  const getMetricLabel = () => {
    const labels = {
      temperature: 'Temperature (°C)',
      humidity: 'Humidity (%)',
      pressure: 'Pressure (hPa)',
      rainfall: 'Rainfall (mm)',
    };
    return labels[metric] || 'Value';
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const color = getMetricColor();

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
            <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={metric} fill={color} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
            <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={metric} stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
            <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={metric} fill={color} />
            <Line type="monotone" dataKey={metric} stroke="#8884d8" strokeWidth={2} />
          </ComposedChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
            <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={metric} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchAnalytics}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">📊 Advanced Analytics</h1>

      {/* Controls */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Select Device</Form.Label>
            <Form.Select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
              {devices.map(device => (
                <option key={device.device_id} value={device.device_id}>
                  {device.name || device.device_id}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Date Range</Form.Label>
            <Form.Select value={dateRange} onChange={(e) => setDateRange(parseInt(e.target.value))}>
              <option value={1}>24 Hours</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Chart Type</Form.Label>
            <Form.Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="line">📈 Line</option>
              <option value="bar">📊 Bar</option>
              <option value="area">📉 Area</option>
              <option value="composed">📊 Composed</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Metric</Form.Label>
            <Form.Select value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="temperature">🌡️ Temperature</option>
              <option value="humidity">💧 Humidity</option>
              <option value="pressure">📊 Pressure</option>
              <option value="rainfall">🌧️ Rainfall</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end gap-2">
          <Button variant="primary" onClick={fetchAnalytics}>
            <FaSync className="me-2" /> Update
          </Button>
          <Button variant="success">
            <FaFilePdf className="me-2" /> PDF
          </Button>
          <Button variant="info">
            <FaDownload className="me-2" /> CSV
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-sm">
              <Card.Body>
                <FaThermometerHalf size={30} className="text-danger mb-2" />
                <Card.Title>{stats.avgTemp.toFixed(1)}°C</Card.Title>
                <Card.Text className="text-muted">Average Temperature</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-sm">
              <Card.Body>
                <FaTint size={30} className="text-primary mb-2" />
                <Card.Title>{stats.avgHumidity.toFixed(1)}%</Card.Title>
                <Card.Text className="text-muted">Average Humidity</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-sm">
              <Card.Body>
                <FaCompress size={30} className="text-success mb-2" />
                <Card.Title>{stats.avgPressure.toFixed(1)} hPa</Card.Title>
                <Card.Text className="text-muted">Average Pressure</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-sm">
              <Card.Body>
                <FaCloudRain size={30} className="text-primary mb-2" />
                <Card.Title>{stats.rainDays}</Card.Title>
                <Card.Text className="text-muted">Rainy Days</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Chart */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">
            <FaChartLine className="me-2 text-primary" />
            {dateRange} Day Weather Trend - {getMetricLabel()}
          </h5>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      {/* Events */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">
            <FaExclamationTriangle className="me-2 text-warning" />
            Weather Events
          </h5>
          {events.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Date</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={idx}>
                    <td>
                      {getEventIcon(event.type)} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </td>
                    <td>{event.message}</td>
                    <td>
                      <Badge bg={getEventBadge(event.severity)}>
                        {event.severity}
                      </Badge>
                    </td>
                    <td>
                      <FaClock className="me-1" />
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </td>
                    <td>
                      <Badge bg="secondary">{event.count}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="success">
              <FaCloudSun className="me-2" />
              No significant weather events detected. Everything is normal! ✅
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Summary */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">
            <FaChartLine className="me-2 text-primary" />
            Summary Report
          </h5>
          <Row>
            <Col md={6}>
              <p><strong>📊 Data Points:</strong> {stats?.totalRecords || 0}</p>
              <p><strong>🌡️ Temperature Range:</strong> {stats?.minTemp?.toFixed(1) || 0}°C - {stats?.maxTemp?.toFixed(1) || 0}°C</p>
              <p><strong>📈 Temperature Variance:</strong> {stats?.tempRange?.toFixed(1) || 0}°C</p>
            </Col>
            <Col md={6}>
              <p><strong>☔ Rain Events:</strong> {stats?.rainDays || 0} days</p>
              <p><strong>💧 Humidity Range:</strong> {stats?.avgHumidity ? `${(stats.avgHumidity - 15).toFixed(1)}% - ${(stats.avgHumidity + 15).toFixed(1)}%` : 'N/A'}</p>
              <p><strong>📅 Period:</strong> {dateRange} days</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SuperEnhancedAnalytics;
