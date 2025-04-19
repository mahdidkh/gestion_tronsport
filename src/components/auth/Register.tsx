import { useState, FormEvent, useEffect } from 'react';
import { authService, testApiConnection } from '../../services/authService';
import { ApiHealthCheck } from '../debug/ApiHealthCheck';
import './Auth.css';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register = ({ onNavigateToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{success?: boolean, message: string}>({ message: 'Checking API connection...' });

  // Test API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const result = await testApiConnection();
        if (result.success) {
          setApiStatus({ success: true, message: 'API connected successfully' });
        } else {
          setApiStatus({ success: false, message: `API connection failed: ${result.error}` });
        }
      } catch (err) {
        setApiStatus({ success: false, message: 'API connection check failed' });
      }
    };

    checkApiConnection();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      onNavigateToLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="auth-container">
      {showDebug && <ApiHealthCheck />}
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}

        {/* API Status Indicator */}
        <div className={`api-status ${apiStatus.success === true ? 'success' : apiStatus.success === false ? 'error' : 'pending'}`}>
          {apiStatus.message}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="auth-link-button"
          >
            Login
          </button>
        </p>

        {/* Debug toggle button */}
        <div className="debug-toggle">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="debug-toggle-button"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

