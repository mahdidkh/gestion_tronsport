import React, { useState, useEffect, useCallback, ErrorInfo, ReactNode } from 'react';
import { mockShipmentService } from '../../services/mockShipmentService';
import './ShipmentHistory.css';

// Error boundary component to catch errors in the ShipmentHistory component
export class ErrorBoundary extends React.Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ShipmentHistory error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

type ViewMode = 'card' | 'list';

export const ShipmentHistory = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  // Get the saved view mode from localStorage or default to 'card'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedViewMode = localStorage.getItem('shipmentHistoryViewMode');
    return (savedViewMode === 'list' || savedViewMode === 'card') ? savedViewMode as ViewMode : 'card';
  });

  // Load shipments from localStorage
  const loadShipments = useCallback(() => {
    try {
      const savedShipments = JSON.parse(localStorage.getItem('shipments') || '[]');
      setShipments(savedShipments);
    } catch (error) {
      console.error('Error loading shipments from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch shipments from our mock service
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const serviceShipments = await mockShipmentService.getAllShipments();
      if (serviceShipments && Array.isArray(serviceShipments) && serviceShipments.length > 0) {
        setShipments(serviceShipments);
      } else {
        loadShipments(); // Fall back to localStorage
      }
    } catch (error) {
      console.error('Error fetching shipments from service:', error);
      loadShipments(); // Fall back to localStorage
    } finally {
      setLoading(false);
    }
  }, [loadShipments]);

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // Increment to trigger useEffect
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('shipmentHistoryViewMode', mode);
  };

  // Handle delete button click
  const handleDelete = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setDeletingIndex(index);
      try {
        await mockShipmentService.deleteShipment(index);
        // Refresh the list after deletion
        handleRefresh();
      } catch (error) {
        console.error('Error deleting shipment:', error);
        alert('Failed to delete shipment. Please try again.');
      } finally {
        setDeletingIndex(null);
      }
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments, refreshKey]);

  if (loading) {
    return (
      <div className="shipment-history loading">
        <div className="shipment-history-header">
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('card')}
              title="Card View"
              disabled={true}
            >
              <span role="img" aria-label="Card View">🗃️</span>
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="List View"
              disabled={true}
            >
              <span role="img" aria-label="List View">📋</span>
            </button>
          </div>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={true}
          >
            Loading...
          </button>
        </div>
        <div className="loading-indicator">Loading shipment history...</div>
      </div>
    );
  }

  if (!shipments || shipments.length === 0) {
    return (
      <div className="shipment-history empty">
        <div className="shipment-history-header">
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('card')}
              title="Card View"
            >
              <span role="img" aria-label="Card View">🗃️</span>
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="List View"
            >
              <span role="img" aria-label="List View">📋</span>
            </button>
          </div>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        <div className="empty-message">No shipment history found. Save a shipment to see it here.</div>
      </div>
    );
  }

  return (
    <div className="shipment-history">
      <div className="shipment-history-header">
        <div className="view-toggle">
          <button
            className={`view-button ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('card')}
            title="Card View"
          >
            <span role="img" aria-label="Card View">🗃️</span>
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('list')}
            title="List View"
          >
            <span role="img" aria-label="List View">📋</span>
          </button>
        </div>
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {viewMode === 'card' ? (
        <div className="shipment-list card-view">
          {shipments.map((shipment, index) => (
            <div key={index} className="shipment-card">
              <div className="shipment-header">
                <div className="shipment-header-content">
                  <h3>{shipment.merchandiseName || 'Unnamed Shipment'}</h3>
                  <span className="shipment-type">{shipment.transportType} - {shipment.modeOfTransport}</span>
                  {shipment.date && (
                    <div className="shipment-date">
                      <span className="date-icon">📅</span>
                      <span className="date-text">
                        {new Date(shipment.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {' '}
                        {new Date(shipment.date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                  disabled={deletingIndex === index}
                >
                  {deletingIndex === index ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              <div className="shipment-details">
                <div className="detail-group">
                  <h4>Merchandise</h4>
                  <p><strong>Description:</strong> {shipment.description || 'N/A'}</p>
                  <p><strong>Weight:</strong> {shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                  <p><strong>Volume:</strong> {shipment.volume ? `${typeof shipment.volume === 'number' ? shipment.volume.toFixed(2) : shipment.volume} m³` : 'N/A'}</p>
                  <p><strong>Package Count:</strong> {shipment.packageCount || 1}</p>
                  <p><strong>Stackable:</strong> {shipment.isStackable === true ? 'Yes' : shipment.isStackable === false ? 'No' : 'N/A'}</p>
                  {shipment.dimensions && typeof shipment.dimensions === 'object' && (
                    <p><strong>Dimensions:</strong> {shipment.dimensions.length || 0} × {shipment.dimensions.width || 0} × {shipment.dimensions.height || 0} cm</p>
                  )}
                </div>

                <div className="detail-group">
                  <h4>Shipping</h4>
                  <p><strong>From:</strong> {shipment.shipperName || 'N/A'}</p>
                  <p><strong>To:</strong> {shipment.receiverName || 'N/A'}</p>
                  <p><strong>Country:</strong> {shipment.country || 'N/A'}</p>
                  <p><strong>Transport:</strong> {shipment.transportType || 'N/A'}</p>
                  <p><strong>Movement:</strong> {shipment.modeOfTransport || 'N/A'}</p>
                  {shipment.date && (
                    <p><strong>Date:</strong> {new Date(shipment.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  )}
                </div>

                <div className="detail-group">
                  <h4>Pricing & Terms</h4>
                  <p><strong>EUR:</strong> {(shipment.priceEUR !== undefined && shipment.priceEUR !== null) ? `${Number(shipment.priceEUR).toFixed(2)} €` :
                    (shipment.shippingCost !== undefined && shipment.shippingCost !== null) ? `${Number(shipment.shippingCost).toFixed(2)} €` : 'N/A'}</p>
                  {(shipment.priceTND !== undefined && shipment.priceTND !== null) &&
                    <p><strong>TND:</strong> {Number(shipment.priceTND).toFixed(2)} TND</p>
                  }
                  <p><strong>Incoterms:</strong> {shipment.service || (Array.isArray(shipment.incoterms) && shipment.incoterms.length > 0 ? shipment.incoterms.join(', ') : 'N/A')}</p>
                </div>

                <div className="detail-group">
                  <h4>Contact Information</h4>
                  <p><strong>Sender:</strong> {shipment.shipperName || 'N/A'}</p>
                  <p><strong>Email:</strong> {shipment.shipperEmail || 'N/A'}</p>
                  <p><strong>Phone:</strong> {shipment.shipperPhone || 'N/A'}</p>
                  <p><strong>Receiver:</strong> {shipment.receiverName || 'N/A'}</p>
                  <p><strong>Email:</strong> {shipment.receiverEmail || 'N/A'}</p>
                  <p><strong>Phone:</strong> {shipment.receiverPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="shipment-list list-view">
          <table className="shipment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Transport</th>
                <th>From</th>
                <th>To</th>
                <th>Country</th>
                <th>Weight</th>
                <th>Volume</th>
                <th>Date</th>
                <th>Price (EUR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment, index) => (
                <tr key={index} className="shipment-row">
                  <td className="shipment-name">{shipment.merchandiseName || 'Unnamed'}</td>
                  <td>{shipment.description || 'N/A'}</td>
                  <td>
                    <div>{shipment.transportType || 'N/A'}</div>
                    <div className="secondary-text">{shipment.modeOfTransport || 'N/A'}</div>
                  </td>
                  <td>{shipment.shipperName || 'N/A'}</td>
                  <td>{shipment.receiverName || 'N/A'}</td>
                  <td>{shipment.country || 'N/A'}</td>
                  <td>{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</td>
                  <td>{shipment.volume ? `${typeof shipment.volume === 'number' ? shipment.volume.toFixed(2) : shipment.volume} m³` : 'N/A'}</td>
                  <td>
                    {shipment.date ? new Date(shipment.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {(shipment.priceEUR !== undefined && shipment.priceEUR !== null) ? `${Number(shipment.priceEUR).toFixed(2)} €` :
                    (shipment.shippingCost !== undefined && shipment.shippingCost !== null) ? `${Number(shipment.shippingCost).toFixed(2)} €` : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="delete-button-small"
                      onClick={() => handleDelete(index)}
                      disabled={deletingIndex === index}
                    >
                      {deletingIndex === index ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
