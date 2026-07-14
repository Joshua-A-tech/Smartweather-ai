import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Spinner, Alert, Form, Button, Table, Badge 
} from 'react-bootstrap';
import { 
  FaChartLine, FaCalendarAlt, FaDownload, FaThermometerHalf, 
  FaTint, FaCompress, FaCloudRain, FaSun, FaMoon,
  FaExclamationTriangle, FaClock
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { weatherAPI } from '../services/api';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ESP32-001');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(7);

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
      
      // Fetch historical data
      const response = await weatherAPI.getHistory(selectedDevice, dateRange * 24);
      const data = response.data.data || [];
      setHistory(data);
      
      // Calculate statistics
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
    
    // Detect heatwave (temp > 35°C)
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
    
    // Detect frost (temp < 0°C)
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
    
    // Detect rain events
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

  // Prepare chart data
  const labels = history.map(d => format(new Date(d.created_at), 'MMM dd HH:mm'));
  const tempData = history.map(d => d.temperature);
  const humidityData = history.map(d => d.humidity);
  const pressureData = history.map(d => d.pressure);

  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      }
    ],
  };

  const barChartData = {
    labels: ['Avg Temp', 'Max Temp', 'Min Temp', 'Avg Humidity', 'Avg Pressure'],
    datasets: [
      {
        label: 'Weather Statistics',
        data: [
          stats?.avgTemp || 0,
          stats?.maxTemp || 0,
          stats?.minTemp || 0,
          stats?.avgHumidity || 0,
          stats?.avgPressure || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  };

  const lineOptions = {
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
        text: `${dateRange} Day Weather Trend`,
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
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        position: 'right',
        beginAtZero: false,
        title: {
          display: true,
          text: 'Humidity (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weather Summary Statistics',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <div>
      <h1 className="mb-4">Analytics</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Form>
            <Form.Group>
              <Form.Label>Select Device</Form.Label>
              <Form.Select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
                {devices.map(device => (
                  <option key={device.device_id} value={device.device_id}>
                    {device.name || device.device_id} {device.location ? `(${device.location})` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={3}>
          <Form>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <Form.Select value={dateRange} onChange={(e) => setDateRange(parseInt(e.target.value))}>
                <option value={1}>Last 24 Hours</option>
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={5} className="text-end d-flex align-items-end">
          <Button variant="primary" onClick={fetchAnalytics} className="me-2">
            <FaCalendarAlt className="me-2" /> Update
          </Button>
          <Button variant="success">
            <FaDownload className="me-2" /> Export Report
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <FaThermometerHalf size={30} className="text-danger mb-2" />
                <Card.Title>{stats.avgTemp.toFixed(1)}°C</Card.Title>
                <Card.Text className="text-muted">Average Temperature</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <FaTint size={30} className="text-primary mb-2" />
                <Card.Title>{stats.avgHumidity.toFixed(1)}%</Card.Title>
                <Card.Text className="text-muted">Average Humidity</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <FaCompress size={30} className="text-success mb-2" />
                <Card.Title>{stats.avgPressure.toFixed(1)} hPa</Card.Title>
                <Card.Text className="text-muted">Average Pressure</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <FaCloudRain size={30} className="text-primary mb-2" />
                <Card.Title>{stats.rainDays}</Card.Title>
                <Card.Text className="text-muted">Rainy Days</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Body>
              <Line data={lineChartData} options={lineOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <Bar data={barChartData} options={barOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Events */}
      <Card className="mb-4">
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
              No significant weather events detected in this period. Everything is normal! ✅
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Summary */}
      <Card>
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
}

export default Analytics;
