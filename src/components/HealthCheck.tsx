import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '../services/api';

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkApiHealth();
        setHealthStatus(health.status);
        setError(null);
      } catch (err) {
        setHealthStatus('DOWN');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-check" style={{ padding: '10px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor:
              healthStatus === 'UP'
                ? 'green'
                : healthStatus === 'DOWN'
                ? 'red'
                : 'orange',
          }}
        />
        <span>
          API Status: {healthStatus}{' '}
          {error && <span style={{ color: 'red' }}>(Error: {error})</span>}
        </span>
      </div>
    </div>
  );
};

export default HealthCheck;
