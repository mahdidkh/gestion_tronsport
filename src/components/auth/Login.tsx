import { useState, FormEvent, useEffect } from 'react';
import { authService, testApiConnection } from '../../services/authService';
import { ApiHealthCheck } from '../debug/ApiHealthCheck';
import './Auth.css';

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const Login = ({ onNavigateToRegister, onLoginSuccess }: LoginProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{success?: boolean, message: string}>({ message: 'Checking API connection...' });
  const [showDebug, setShowDebug] = useState(false);

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
    setIsLoading(true);

    try {
      await authService.login(formData);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showDebug && <ApiHealthCheck />}
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}

        {/* API Status Indicator */}
        <div className={`api-status ${apiStatus.success === true ? 'success' : apiStatus.success === false ? 'error' : 'pending'}`}>
          {apiStatus.message}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="auth-link-button"
          >
            Register
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


