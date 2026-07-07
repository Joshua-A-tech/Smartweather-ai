import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Button, Badge, Table, Form } from 'react-bootstrap';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaBell } from 'react-icons/fa';
import { aiAPI } from '../services/api';

function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState('ESP32-001');

  useEffect(() => {
    fetchAnomalies();
  }, [deviceId]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getAnomalies(deviceId, 168);
      setAnomalies(response.data.anomalies || []);
      setError(null);
    } catch (err) {
      setError('Failed to load anomalies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: 'danger',
      warning: 'warning',
      info: 'info',
      success: 'success'
    };
    return <Badge bg={variants[severity] || 'secondary'}>{severity || 'unknown'}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading anomalies...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h1 className="mb-4">Anomaly Alerts</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form>
            <Form.Group>
              <Form.Label>Select Device</Form.Label>
              <Form.Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                <option value="ESP32-001">ESP32-001 (Garden)</option>
                <option value="ESP32-002">ESP32-002 (Roof)</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={fetchAnomalies}>
            <FaClock className="me-2" />
            Refresh
          </Button>
        </Col>
      </Row>

      {anomalies.length === 0 ? (
        <Alert variant="success">
          <FaCheckCircle className="me-2" />
          No anomalies detected. Everything is operating normally! ✅
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <h5 className="mb-3">
              <FaBell className="me-2" />
              {anomalies.length} Anomaly(ies) Detected
            </h5>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, idx) => (
                  <tr key={idx}>
                    <td>
                      <FaExclamationTriangle className="me-2 text-warning" />
                      {anomaly.type}
                    </td>
                    <td>{getSeverityBadge(anomaly.severity)}</td>
                    <td>{anomaly.message}</td>
                    <td>{new Date(anomaly.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default Anomalies;
