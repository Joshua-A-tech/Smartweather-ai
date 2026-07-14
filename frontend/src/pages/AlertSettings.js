import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Row, Col, Spinner, Alert, Table, Badge
} from 'react-bootstrap';
import {
  FaBell, FaSave, FaHistory, FaExclamationTriangle, FaCheckCircle,
  FaThermometerHalf, FaTint, FaCloudRain, FaCog, FaSync
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { weatherAPI } from '../services/api';

function AlertSettings() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [preferences, setPreferences] = useState({
    temp_high: 35,
    temp_low: 0,
    humidity_high: 80,
    rain_alert: true,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchPreferences();
      fetchLogs();
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await weatherAPI.getDevices();
      console.log('Devices response:', response.data);
      if (response.data && response.data.devices && response.data.devices.length > 0) {
        setDevices(response.data.devices);
        setSelectedDevice(response.data.devices[0].device_id);
      } else {
        setDevices([{ device_id: 'ESP32-001', name: 'Garden Sensor' }]);
        setSelectedDevice('ESP32-001');
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setDevices([{ device_id: 'ESP32-001', name: 'Garden Sensor' }]);
      setSelectedDevice('ESP32-001');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!user || !selectedDevice) return;
    try {
      console.log('Fetching preferences for user:', user.id, 'device:', selectedDevice);
      const response = await fetch(
        `${API_URL}/api/v1/alerts/preferences?user_id=${user.id}&device_id=${selectedDevice}`
      );
      const data = await response.json();
      console.log('Preferences response:', data);
      if (data.data && data.data.length > 0) {
        setPreferences(data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  const fetchLogs = async () => {
    if (!selectedDevice) return;
    try {
      const response = await fetch(
        `${API_URL}/api/v1/alerts/logs?device_id=${selectedDevice}&limit=20`
      );
      const data = await response.json();
      if (data.data) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // FIX: Ensure numeric values are sent as numbers, not strings
  const handleSavePreferences = async () => {
    if (!user) {
      setError('Please log in to save preferences');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert to proper number types
      const payload = {
        device_id: selectedDevice,
        device_name: preferences.device_name || null,
        device_location: preferences.device_location || null,
        temp_high: preferences.temp_high ? parseFloat(preferences.temp_high) : null,
        temp_low: preferences.temp_low ? parseFloat(preferences.temp_low) : null,
        humidity_high: preferences.humidity_high ? parseFloat(preferences.humidity_high) : null,
        rain_alert: Boolean(preferences.rain_alert),
      };

      console.log('Saving preferences (converted to numbers):', payload);
      console.log('User ID:', user.id);

      const response = await fetch(
        `${API_URL}/api/v1/alerts/preferences?user_id=${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('Save response:', data);

      if (response.ok && data.status === 'success') {
        setSuccess('✅ Alert preferences saved successfully!');
        fetchPreferences();
      } else {
        setError(data.detail || data.message || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Error saving preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckAlerts = async () => {
    if (!user) {
      setError('Please log in to check alerts');
      return;
    }

    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/alerts/check?device_id=${selectedDevice}&user_id=${user.id}`,
        { method: 'POST' }
      );
      const data = await response.json();
      console.log('Check alerts response:', data);

      if (response.ok && data.status === 'success') {
        if (data.alerts_sent > 0) {
          setSuccess(`✅ ${data.alerts_sent} alert(s) sent!`);
          fetchLogs();
        } else {
          setSuccess('✅ No alerts triggered. Everything is normal!');
        }
      } else {
        setError(data.detail || data.message || 'Failed to check alerts');
      }
    } catch (err) {
      console.error('Error checking alerts:', err);
      setError('Error checking alerts: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      warning: 'warning',
      info: 'info',
      danger: 'danger',
      success: 'success'
    };
    return <Badge bg={variants[severity] || 'secondary'}>{severity || 'info'}</Badge>;
  };

  const getAlertIcon = (type) => {
    const icons = {
      heatwave: <FaThermometerHalf className="text-danger" />,
      frost: <FaThermometerHalf className="text-info" />,
      rain: <FaCloudRain className="text-primary" />,
      humidity: <FaTint className="text-info" />
    };
    return icons[type] || <FaExclamationTriangle />;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading alert settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">
        <FaBell className="me-2" /> Alert Settings
      </h1>

      {!user && (
        <Alert variant="warning">
          Please log in to configure alert preferences.
        </Alert>
      )}

      <Row>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>
                <FaCog className="me-2" /> Alert Preferences
              </Card.Title>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Device</Form.Label>
                  <Form.Select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    disabled={!user}
                  >
                    {devices.length === 0 ? (
                      <option value="">No devices found</option>
                    ) : (
                      devices.map((device) => (
                        <option key={device.device_id} value={device.device_id}>
                          {device.name || device.device_id} {device.location ? `(${device.location})` : ''}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  {devices.length === 0 && (
                    <Form.Text className="text-warning">
                      No devices found. Make sure your ESP32 is connected.
                    </Form.Text>
                  )}
                </Form.Group>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaThermometerHalf className="me-2 text-danger" />
                    High Temperature Alert (°C)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={preferences.temp_high !== null && preferences.temp_high !== undefined ? preferences.temp_high : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setPreferences({ ...preferences, temp_high: val });
                    }}
                    placeholder="e.g., 35"
                    disabled={!user}
                  />
                  <Form.Text className="text-muted">
                    Alert when temperature exceeds this value
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaThermometerHalf className="me-2 text-info" />
                    Low Temperature Alert (°C)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={preferences.temp_low !== null && preferences.temp_low !== undefined ? preferences.temp_low : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setPreferences({ ...preferences, temp_low: val });
                    }}
                    placeholder="e.g., 0"
                    disabled={!user}
                  />
                  <Form.Text className="text-muted">
                    Alert when temperature drops below this value
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaTint className="me-2 text-primary" />
                    High Humidity Alert (%)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={preferences.humidity_high !== null && preferences.humidity_high !== undefined ? preferences.humidity_high : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setPreferences({ ...preferences, humidity_high: val });
                    }}
                    placeholder="e.g., 80"
                    disabled={!user}
                  />
                  <Form.Text className="text-muted">
                    Alert when humidity exceeds this value
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="☔ Rain Alert"
                    checked={preferences.rain_alert || false}
                    onChange={(e) =>
                      setPreferences({ ...preferences, rain_alert: e.target.checked })
                    }
                    disabled={!user}
                  />
                  <Form.Text className="text-muted">
                    Get alerts when rain is detected
                  </Form.Text>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSavePreferences}
                    disabled={saving || !user}
                  >
                    <FaSave className="me-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleCheckAlerts}
                    disabled={checking || !user}
                  >
                    <FaBell className="me-2" />
                    {checking ? 'Checking...' : 'Check Alerts Now'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <Card.Title>
                <FaHistory className="me-2" /> Alert History
              </Card.Title>

              {logs.length === 0 ? (
                <Alert variant="info">
                  <FaCheckCircle className="me-2" />
                  No alerts triggered yet. Everything is normal! ✅
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Message</th>
                      <th>Severity</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx}>
                        <td>
                          {getAlertIcon(log.alert_type)} {log.alert_type}
                        </td>
                        <td>{log.message}</td>
                        <td>{getSeverityBadge(log.severity)}</td>
                        <td>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AlertSettings;
