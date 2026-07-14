import React, { useState, useEffect } from 'react';
import {
  Card, Form, Button, Row, Col, Spinner, Alert, Table, Badge, ToggleButton, ToggleButtonGroup
} from 'react-bootstrap';
import {
  FaBell, FaSave, FaHistory, FaExclamationTriangle, FaCheckCircle,
  FaThermometerHalf, FaTint, FaCloudRain, FaCog
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
      const response = await weatherAPI.getDevices();
      if (response.data && response.data.devices) {
        setDevices(response.data.devices);
        if (response.data.devices.length > 0) {
          setSelectedDevice(response.data.devices[0].device_id);
        }
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `${API_URL}/api/v1/alerts/preferences?user_id=${user.id}&device_id=${selectedDevice}`
      );
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setPreferences(data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  const fetchLogs = async () => {
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

  const handleSavePreferences = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/alerts/preferences?user_id=${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...preferences,
            device_id: selectedDevice,
          }),
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('✅ Alert preferences saved successfully!');
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('Error saving preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckAlerts = async () => {
    if (!user) return;
    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/alerts/check?device_id=${selectedDevice}&user_id=${user.id}`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (data.status === 'success') {
        if (data.alerts_sent > 0) {
          setSuccess(`✅ ${data.alerts_sent} alert(s) sent!`);
          fetchLogs();
        } else {
          setSuccess('✅ No alerts triggered. Everything is normal!');
        }
      } else {
        setError('Failed to check alerts');
      }
    } catch (err) {
      setError('Error checking alerts');
      console.error(err);
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
                  >
                    {devices.map((device) => (
                      <option key={device.device_id} value={device.device_id}>
                        {device.name || device.device_id} {device.location ? `(${device.location})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaThermometerHalf className="me-2 text-danger" />
                    High Temperature Alert (°C)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={preferences.temp_high || ''}
                    onChange={(e) =>
                      setPreferences({ ...preferences, temp_high: parseFloat(e.target.value) })
                    }
                    placeholder="e.g., 35"
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
                    value={preferences.temp_low || ''}
                    onChange={(e) =>
                      setPreferences({ ...preferences, temp_low: parseFloat(e.target.value) })
                    }
                    placeholder="e.g., 0"
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
                    value={preferences.humidity_high || ''}
                    onChange={(e) =>
                      setPreferences({ ...preferences, humidity_high: parseFloat(e.target.value) })
                    }
                    placeholder="e.g., 80"
                  />
                  <Form.Text className="text-muted">
                    Alert when humidity exceeds this value
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="☔ Rain Alert"
                    checked={preferences.rain_alert}
                    onChange={(e) =>
                      setPreferences({ ...preferences, rain_alert: e.target.checked })
                    }
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
                    disabled={saving}
                  >
                    <FaSave className="me-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleCheckAlerts}
                    disabled={checking}
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
