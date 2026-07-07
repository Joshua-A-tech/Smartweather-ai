import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FaRobot, FaUser, FaPaperPlane, FaDatabase, FaClock } from 'react-icons/fa';
import { aiAPI } from '../services/api';

function AIChat() {
  const [question, setQuestion] = useState('');
  const [deviceId, setDeviceId] = useState('ESP32-001');
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your SmartWeather AI assistant. Ask me anything about the weather data! 🌤️',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.query(question, deviceId);
      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
        sources: response.data.sources || [],
        context: response.data.context || '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get AI response');
      console.error(err);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleIngest = async () => {
    try {
      setLoading(true);
      await aiAPI.ingest(deviceId, 50);
      const successMessage = {
        type: 'ai',
        content: `✅ Successfully ingested 50 weather records for device ${deviceId}!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (err) {
      setError('Failed to ingest data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4">AI Weather Assistant</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form>
            <Form.Group>
              <Form.Label>Device</Form.Label>
              <Form.Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                <option value="ESP32-001">ESP32-001 (Garden)</option>
                <option value="ESP32-002">ESP32-002 (Roof)</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button variant="success" onClick={handleIngest} disabled={loading}>
            <FaDatabase className="me-2" />
            Ingest Weather Data
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Chat Messages */}
      <Card className="mb-3" style={{ height: '400px', overflowY: 'auto' }}>
        <Card.Body>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-3 rounded ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                style={{ maxWidth: '70%' }}
              >
                <div className="d-flex align-items-center mb-2">
                  {msg.type === 'ai' ? (
                    <FaRobot className="me-2" />
                  ) : (
                    <FaUser className="me-2" />
                  )}
                  <strong>{msg.type === 'ai' ? 'AI Assistant' : 'You'}</strong>
                  <small className="ms-2 text-muted">
                    <FaClock className="me-1" />
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                <div>{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Sources: {msg.sources.map((s, i) => (
                        <Badge key={i} bg="secondary" className="ms-1">
                          {s.substring(0, 8)}...
                        </Badge>
                      ))}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2">AI is thinking...</span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Input */}
      <Form>
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            placeholder="Ask about the weather..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button 
            variant="primary" 
            onClick={handleSend}
            disabled={loading || !question.trim()}
            className="ms-2"
          >
            <FaPaperPlane />
          </Button>
        </Form.Group>
        <Form.Text className="text-muted">
          Ask about temperature trends, humidity, rainfall, or any weather patterns!
        </Form.Text>
      </Form>
    </div>
  );
}

export default AIChat;
