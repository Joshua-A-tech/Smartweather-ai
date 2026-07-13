import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { 
  FaThermometerHalf, FaCompress, FaCloudRain, FaClock, 
  FaCloudSun, FaSun, FaMoon, FaFileDownload, FaPrint
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

  // ============================================================
  // DATA EXPORT FUNCTION
  // ============================================================
  const exportData = async () => {
    try {
      setLoading(true);
      const response = await weatherAPI.getHistory(selectedDevice, 1000);
      const data = response.data.data || [];
      
      if (data.length === 0) {
        alert('📭 No data to export');
        setLoading(false);
        return;
      }
      
      // Create CSV
      const headers = [
        'Device ID', 
        'Temperature (°C)', 
        'Humidity (%)', 
        'Pressure (hPa)', 
        'Rainfall (mm)', 
        'Light', 
        'Timestamp'
      ];
      
      const rows = data.map(d => [
        d.device_id || selectedDevice,
        d.temperature || 'N/A',
        d.humidity || 'N/A',
        d.pressure || 'N/A',
        d.rainfall || 0,
        d.light || 'N/A',
        new Date(d.created_at || Date.now()).toLocaleString()
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather_data_${selectedDevice}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${data.length} records successfully!`);
      setLoading(false);
      
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to export data');
      setLoading(false);
    }
  };

  // ============================================================
  // PRINT FUNCTION
  // ============================================================
  const printReport = () => {
    window.print();
  };

  // ============================================================
  // SHARE FUNCTION
  // ============================================================
  const shareDashboard = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'SmartWeather - Weather Report',
        text: `Current weather from ${selectedDevice}: ${weather?.data?.temperature || 'N/A'}°C`,
        url: url
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('📋 URL copied to clipboard! Share it with anyone.');
    }
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
  const lightValue = data.light !== undefined ? data.light : 0;
  const isDark = lightValue < 500;

  return (
    <div>
      <h1 className="mb-4">Weather Station</h1>
      
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
        <Col md={8} className="text-end d-flex justify-content-end gap-2 flex-wrap">
          <Button variant="primary" onClick={fetchWeather}>
            <FaClock className="me-2" /> Refresh
          </Button>
          <Button variant="success" onClick={exportData}>
            <FaFileDownload className="me-2" /> Export CSV
          </Button>
          <Button variant="info" onClick={printReport}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Button variant="secondary" onClick={shareDashboard}>
            📤 Share
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
                  <h2>{data.temperature ? data.temperature.toFixed(1) : '--'}°C</h2>
                  <p className="text-muted">Temperature</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FaCompress size={40} className="text-success mb-3" />
                  <h2>{data.pressure ? data.pressure.toFixed(1) : '--'} hPa</h2>
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
                  <small className="text-muted">{lightValue}</small>
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
                      <p><strong>💧 Humidity:</strong> {data.humidity || '--'}%</p>
                      <p><strong>💨 Pressure:</strong> {data.pressure || '--'} hPa</p>
                      <p><strong>⛰️ Altitude:</strong> {data.altitude || '--'} m</p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>☔ Rainfall:</strong> {data.rainfall || 0} mm</p>
                      <p><strong>💡 Light:</strong> {lightValue}</p>
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
                      <FaSun className="me-2 text-warning" />
                      <strong>Light:</strong> {lightValue} {isDark ? '(🌙 Dark)' : '(☀️ Light)'}
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
