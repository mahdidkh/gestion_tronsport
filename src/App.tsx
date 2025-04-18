import React, { useState } from 'react';
import { NavBar } from './components/navbar/NavBar';
import { MerchandiseForm } from './components/merchandise/MerchandiseForm';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ShipmentHistory, ErrorBoundary } from './components/merchandise/ShipmentHistory';
import HealthCheck from './components/HealthCheck';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      {currentPage !== 'login' && currentPage !== 'register' && (
        <>
          <NavBar onNavigate={handleNavigate} currentPage={currentPage} />
          <div style={{ padding: '0 20px' }}>
            <HealthCheck />
          </div>
        </>
      )}

      <main className="app-main">
        {currentPage === 'login' && (
          <Login
            onNavigateToRegister={handleNavigateToRegister}
            onLoginSuccess={() => handleNavigate('home')}
          />
        )}
        {currentPage === 'register' && (
          <Register onNavigateToLogin={handleNavigateToLogin} />
        )}
        {currentPage === 'home' && (
          <section className="merchandise-section">
            <MerchandiseForm onNavigateToHistorique={() => handleNavigate('historique')} />
          </section>
        )}
        {currentPage === 'historique' && (
          <section className="historique-section">
            <h2>Historique</h2>
            <React.Suspense fallback={<div>Loading history...</div>}>
              <ErrorBoundary
                fallback={
                  <div className="shipment-history error">
                    <div className="shipment-history-header"></div>
                    <div className="error-message">
                      An error occurred while loading the shipment history.
                      Please refresh the page and try again.
                    </div>
                  </div>
                }
              >
                <ShipmentHistory />
              </ErrorBoundary>
            </React.Suspense>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;




