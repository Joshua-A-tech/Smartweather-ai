import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { 
  FaThermometerHalf, FaCompress, FaCloudRain, FaClock, FaCloudSun, FaSun, FaMoon
} from 'react-icons/fa';
import { weatherAPI } from '../services/api';

function Weather() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ESP32-001');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchWeather();
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

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await weatherAPI.getCurrent(selectedDevice);
      setWeather(response.data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
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
        <p className="mt-2">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchWeather}>Retry</Button>
      </div>
    );
  }

  const data = weather?.data || {};
  const isRaining = data.is_raining || data.rainfall > 0;
  const isDark = data.light ? data.light < 1000 : false;

  return (
    <div>
      <h1 className="mb-4">Weather Station</h1>
      
      <Row className="mb-4">
        <Col md={6}>
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
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={fetchWeather}>
            <FaClock className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      {data.message ? (
        <Alert variant="warning">{data.message}</Alert>
      ) : (
        <>
          <Row>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FaThermometerHalf size={40} className="text-danger mb-3" />
                  <h2>{data.temperature || '--'}°C</h2>
                  <p className="text-muted">Temperature</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FaCompress size={40} className="text-success mb-3" />
                  <h2>{data.pressure || '--'} hPa</h2>
                  <p className="text-muted">Pressure</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  {isRaining ? (
                    <FaCloudRain size={40} className="text-primary mb-3" />
                  ) : (
                    <FaCloudSun size={40} className="text-warning mb-3" />
                  )}
                  <h2>{isRaining ? '🌧️ Raining' : '☀️ Dry'}</h2>
                  <p className="text-muted">Rain Status</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  {isDark ? (
                    <FaMoon size={40} className="text-secondary mb-3" />
                  ) : (
                    <FaSun size={40} className="text-warning mb-3" />
                  )}
                  <h2>{isDark ? '🌙 Dark' : '☀️ Light'}</h2>
                  <p className="text-muted">Light Level</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Sensor Details</h5>
                  <Row>
                    <Col sm={6}>
                      <p><strong>🌡️ Temperature:</strong> {data.temperature || '--'}°C</p>
                      <p><strong>💨 Pressure:</strong> {data.pressure || '--'} hPa</p>
                      <p><strong>⛰️ Altitude:</strong> {data.altitude || '--'} m</p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>☔ Rainfall:</strong> {data.rainfall || 0} mm</p>
                      <p><strong>💡 Light:</strong> {data.light || '--'}</p>
                      <p><strong>📍 Location:</strong> {data.location || 'Unknown'}</p>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col sm={6}>
                      <p><strong>📱 Device:</strong> {data.device_name || data.device_id || 'Unknown'}</p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>🕐 Updated:</strong> {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Weather Insights</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <FaThermometerHalf className="me-2 text-danger" />
                      <strong>Temperature:</strong> {data.temperature || '--'}°C
                    </li>
                    <li className="mb-2">
                      <FaCompress className="me-2 text-success" />
                      <strong>Pressure:</strong> {data.pressure || '--'} hPa
                    </li>
                    <li className="mb-2">
                      {isRaining ? (
                        <FaCloudRain className="me-2 text-primary" />
                      ) : (
                        <FaCloudSun className="me-2 text-warning" />
                      )}
                      <strong>Rain:</strong> {isRaining ? '🌧️ Raining' : '☀️ Dry'}
                    </li>
                    <li>
                      {isDark ? (
                        <FaMoon className="me-2 text-secondary" />
                      ) : (
                        <FaSun className="me-2 text-warning" />
                      )}
                      <strong>Light:</strong> {isDark ? '🌙 Dark' : '☀️ Light'} ({data.light || '--'})
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default Weather;
