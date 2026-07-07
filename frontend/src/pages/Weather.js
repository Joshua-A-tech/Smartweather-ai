import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { 
  FaThermometerHalf, FaTint, FaCompress, FaWind, 
  FaCloudRain, FaSun, FaClock 
} from 'react-icons/fa';
import { weatherAPI } from '../services/api';

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState('ESP32-001');

  useEffect(() => {
    fetchWeather();
  }, [deviceId]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await weatherAPI.getCurrent(deviceId);
      setWeather(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const data = weather?.data || {};

  return (
    <div>
      <h1 className="mb-4">Weather Station</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form>
            <Form.Group>
              <Form.Label>Select Device</Form.Label>
              <Form.Select value={deviceId} onChange={handleDeviceChange}>
                <option value="ESP32-001">ESP32-001 (Garden)</option>
                <option value="ESP32-002">ESP32-002 (Roof)</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={fetchWeather}>
            <FaClock className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaThermometerHalf size={40} className="text-danger mb-3" />
              <h2>{data.temperature || '--'}°C</h2>
              <p className="text-muted">Temperature</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaTint size={40} className="text-primary mb-3" />
              <h2>{data.humidity || '--'}%</h2>
              <p className="text-muted">Humidity</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaCompress size={40} className="text-success mb-3" />
              <h2>{data.pressure || '--'} hPa</h2>
              <p className="text-muted">Barometric Pressure</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaWind size={40} className="text-info mb-3" />
              <h2>{data.wind_speed || '--'} km/h</h2>
              <p className="text-muted">Wind Speed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="text-center h-100">
            <Card.Body>
              <FaCloudRain size={40} className="text-primary mb-3" />
              <h2>{data.rainfall || '--'} mm</h2>
              <p className="text-muted">Rainfall</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-3">
        <Card.Body>
          <h5 className="mb-3">Device Information</h5>
          <Row>
            <Col md={6}>
              <p><strong>Device ID:</strong> {data.device_id || 'Unknown'}</p>
              <p><strong>Last Updated:</strong> {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Status:</strong> <span className="badge bg-success">Online</span></p>
              <p><strong>Battery:</strong> {data.battery_voltage || 'N/A'} V</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Weather;
