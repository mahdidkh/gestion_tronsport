import { useState, useEffect } from 'react';
import { checkApiHealth } from '../../services/api';
import api from '../../services/api';
import './Debug.css';

export const ApiHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await checkApiHealth();
      setHealthStatus(result);
    } catch (err: any) {
      setError(err.message || 'Failed to check API health');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="debug-panel">
      <h3>API Health Check</h3>
      
      <div className="debug-info">
        <p><strong>API URL:</strong> {api.defaults.baseURL}</p>
      </div>
      
      {isLoading && <div className="debug-loading">Checking API health...</div>}
      
      {error && (
        <div className="debug-error">
          <p>Error: {error}</p>
        </div>
      )}
      
      {healthStatus && (
        <div className="debug-result">
          <p><strong>Status:</strong> {healthStatus.status}</p>
          {healthStatus.timestamp && (
            <p><strong>Timestamp:</strong> {new Date(healthStatus.timestamp).toLocaleString()}</p>
          )}
          {healthStatus.environment && (
            <div>
              <p><strong>Environment:</strong></p>
              <ul>
                {Object.entries(healthStatus.environment).map(([key, value]: [string, any]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <button 
        className="debug-button"
        onClick={checkHealth}
        disabled={isLoading}
      >
        Refresh Health Status
      </button>
    </div>
  );
};
