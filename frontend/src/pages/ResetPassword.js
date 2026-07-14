import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaCloudSun, FaLock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { supabase, updatePassword } from '../services/supabaseClient';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid reset token
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsValidToken(false);
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Row>
          <Col md={12}>
            <Card className="shadow-lg" style={{ width: '400px' }}>
              <Card.Body className="p-4 text-center">
                <FaCloudSun size={48} className="text-danger mb-3" />
                <h4>Invalid Reset Link</h4>
                <p className="text-muted">
                  This password reset link is invalid or has expired.
                </p>
                <Button as="a" href="/forgot-password" variant="primary" className="w-100">
                  Request New Link
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Row>
        <Col md={12}>
          <Card className="shadow-lg" style={{ width: '400px' }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaCloudSun size={48} className="text-primary" />
                <h2 className="mt-2">Create New Password</h2>
                <p className="text-muted">
                  Enter your new password below
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              
              {success ? (
                <div>
                  <Alert variant="success" className="text-center">
                    <FaCheckCircle size={30} className="mb-2" /><br />
                    <strong>Password Reset Successful!</strong><br />
                    <small>Redirecting to login...</small>
                  </Alert>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaLock className="me-2" />
                      New Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Confirm Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 mb-3"
                  >
                    {loading ? 'Updating...' : 'Reset Password'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;
