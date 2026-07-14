import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaCloudSun, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Row>
        <Col md={12}>
          <Card className="shadow-lg" style={{ width: '400px' }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaCloudSun size={48} className="text-primary" />
                <h2 className="mt-2">Reset Password</h2>
                <p className="text-muted">
                  We'll send you a link to reset your password
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              
              {success ? (
                <div>
                  <Alert variant="success">
                    ✅ Password reset email sent!<br />
                    <small>Check your email for the reset link.</small>
                  </Alert>
                  <Button 
                    variant="primary" 
                    as={Link} 
                    to="/login" 
                    className="w-100"
                  >
                    <FaArrowLeft className="me-2" />
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaEnvelope className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 mb-3"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <FaArrowLeft className="me-1" />
                      Back to Sign In
                    </Link>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
