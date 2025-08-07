import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorNotification from '../components/ErrorNotification';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');

    // Basic validation
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);
      
      if (result.success) {
        // Login successful, redirect will happen automatically via useEffect
        console.log('Login successful');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth is still checking
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>🔍 Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <ErrorNotification 
        error={error} 
        onClose={() => setError('')}
        position="top-center"
      />
      <div className="auth-container">
        <div className="auth-header">
          <h1>🔑 Welcome Back</h1>
          <p>Sign in to your Mini LinkedIn account and continue building your professional network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">📧 Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              📝 Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 