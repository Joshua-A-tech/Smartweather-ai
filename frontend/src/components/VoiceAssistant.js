import React, { useState, useEffect } from 'react';
import { Button, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaRobot } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

const VoiceAssistant = ({ deviceId = 'ESP32-001' }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'system',
      text: '🎤 Click the microphone and ask about the weather!',
      timestamp: new Date()
    }
  ]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Process voice command when speech ends
  useEffect(() => {
    if (!listening && transcript) {
      handleVoiceCommand(transcript);
    }
  }, [listening, transcript]);

  const handleVoiceCommand = async (command) => {
    if (!command.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: command,
      timestamp: new Date()
    }]);

    setLoading(true);
    setError(null);
    resetTranscript();

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/v1/voice/voice`, {
        command: command,
        device_id: deviceId
      });

      const reply = response.data.response;
      setResponse(reply);

      // Add AI response
      setMessages(prev => [...prev, {
        type: 'ai',
        text: reply,
        timestamp: new Date()
      }]);

      // Speak the response
      speakResponse(reply);

    } catch (err) {
      setError('Failed to process voice command');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <Alert variant="warning">
        Your browser doesn't support speech recognition. Please use Chrome or Edge.
      </Alert>
    );
  }

  return (
    <Card className="voice-assistant">
      <Card.Body>
        <Card.Title className="d-flex align-items-center">
          <FaRobot className="me-2 text-primary" />
          Voice Assistant
          <Button
            variant={listening ? 'danger' : 'primary'}
            size="sm"
            onClick={listening ? stopListening : startListening}
            className="ms-auto"
          >
            {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            {listening ? ' Stop' : ' Start'}
          </Button>
        </Card.Title>

        <div className="voice-status mb-3">
          {listening ? (
            <span className="text-success">
              <Spinner animation="pulse" size="sm" className="me-2" />
              Listening... Speak now
            </span>
          ) : (
            <span className="text-muted">Click the microphone to start speaking</span>
          )}
        </div>

        {transcript && (
          <div className="transcript mb-3">
            <strong>You said:</strong> {transcript}
          </div>
        )}

        {loading && (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Processing...</span>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-2">{error}</Alert>
        )}

        <div className="messages" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message mb-2 p-2 rounded ${
                msg.type === 'user' 
                  ? 'bg-primary text-white ms-auto' 
                  : msg.type === 'ai' 
                  ? 'bg-light border' 
                  : 'bg-secondary text-white'
              }`}
              style={{ maxWidth: '80%', marginLeft: msg.type === 'user' ? 'auto' : '0' }}
            >
              <div className="message-text">{msg.text}</div>
              <div className="message-time" style={{ fontSize: '10px', opacity: 0.7 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <Form className="mt-3">
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder="Or type your question..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target.value;
                  if (input.trim()) {
                    handleVoiceCommand(input);
                    e.target.value = '';
                  }
                }
              }}
            />
            <Button
              variant="outline-primary"
              onClick={() => {
                const input = document.querySelector('.form-control');
                if (input && input.value.trim()) {
                  handleVoiceCommand(input.value);
                  input.value = '';
                }
              }}
              className="ms-2"
            >
              <FaVolumeUp />
            </Button>
          </Form.Group>
        </Form>

        <div className="quick-actions mt-3">
          <small className="text-muted">Quick questions:</small>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {['What is the temperature?', 'Is it raining?', 'What is the forecast?', 'How humid is it?'].map((q) => (
              <Button
                key={q}
                variant="outline-secondary"
                size="sm"
                onClick={() => handleVoiceCommand(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VoiceAssistant;
