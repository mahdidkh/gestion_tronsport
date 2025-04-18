import { useState, useEffect } from 'react';
import type { Merchandise, TransportType, Incoterm } from '../../types';
import { mockShipmentService } from '../../services/mockShipmentService';
import './ShipmentDialog.css';

interface ShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  merchandise: Partial<Merchandise>;
  transportType: TransportType;
  selectedIncoterms: Set<Incoterm>;
  movementType: 'Importation' | 'Exportation';
  sender: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  destination: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  onNavigateToHistorique?: () => void; // Optional prop to navigate to Historique
}

interface RateInfo {
  country: string;
  rate: number;
  currency: string;
  transitTime: string;
}

// Add CBM rates per country with both EUR and TND
const CBM_RATES: Record<string, { eur: number; tnd: number }> = {
  'FR': { eur: 100, tnd: 335 }, // 1 EUR ≈ 3.35 TND
  'DE': { eur: 120, tnd: 402 },
  'IT': { eur: 110, tnd: 368.5 },
  'ES': { eur: 95, tnd: 318.25 },
};

export const ShipmentDialog = ({
  isOpen,
  onClose,
  merchandise,
  transportType,
  selectedIncoterms,
  movementType,
  sender,
  destination,
  onNavigateToHistorique
}: ShipmentDialogProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [rates, setRates] = useState<RateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDate] = useState<Date>(new Date());

  const calculateTotalPrices = (volume: number, country: string) => {
    const rates = CBM_RATES[country] || { eur: 0, tnd: 0 };
    return {
      eur: volume * rates.eur,
      tnd: volume * rates.tnd
    };
  };

  useEffect(() => {
    if (isOpen && selectedCountry && merchandise.volume) {
      const totalPrice = calculateTotalPrices(merchandise.volume, selectedCountry);
      setRates([{
        country: selectedCountry,
        rate: totalPrice.eur,
        currency: '€',
        transitTime: '7-10 days', // Example transit time
      }]);
    }
  }, [isOpen, selectedCountry, merchandise.volume]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedCountry || !merchandise.volume) {
      alert('Please select a destination country');
      return;
    }

    setIsSaving(true);
    try {
      // Calculate prices based on volume and selected country
      const prices = calculateTotalPrices(merchandise.volume, selectedCountry);

      // Prepare data for storage with complete merchandise information
      const shipmentData = {
        // Merchandise Information
        merchandiseName: merchandise.name || '',
        weight: merchandise.weight || 0,
        description: merchandise.description || '',
        packageCount: merchandise.packageCount || 1,
        dimensions: merchandise.dimensions || { length: 0, width: 0, height: 0 },
        isStackable: merchandise.isStackable !== undefined ? merchandise.isStackable : true,
        volume: merchandise.volume || 0,

        // Shipper Information
        shipperName: sender.name,
        shipperAddress: sender.address,
        shipperEmail: sender.email,
        shipperPhone: sender.phone,

        // Destination Information
        receiverName: destination.name,
        receiverAddress: destination.address,
        receiverEmail: destination.email,
        receiverPhone: destination.phone,

        // Additional Information
        transportType: transportType,
        shippingCost: prices.eur, // Using EUR price as default
        modeOfTransport: movementType,
        service: Array.from(selectedIncoterms).join(', '),
        incoterms: Array.from(selectedIncoterms),

        // Payment Information
        paymentMethod: 'Not specified', // Default value

        // Additional data for display
        country: selectedCountry,
        priceEUR: prices.eur,
        priceTND: prices.tnd,
        date: currentDate.toISOString()
      };

      // Save data using our mock service
      const savedShipment = await mockShipmentService.createShipment(shipmentData);
      console.log('Shipment saved:', savedShipment);

      // Store in localStorage for persistence
      const existingShipments = JSON.parse(localStorage.getItem('shipments') || '[]');
      existingShipments.push(shipmentData);
      localStorage.setItem('shipments', JSON.stringify(existingShipments));

      // Show success message
      alert('Shipment data saved successfully!');

      // Close the dialog
      onClose();

      // Navigate to Historique if the function is provided
      if (typeof onNavigateToHistorique === 'function') {
        onNavigateToHistorique();
      }
    } catch (error) {
      console.error('Error saving shipment data:', error);
      alert('Failed to save data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Shipping Details</h2>
        <div className="current-date">
          <span className="date-label">Date: </span>
          <span className="date-value">
            {currentDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {' '}
            {currentDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="merchandise-summary">
          <h3>Merchandise Information</h3>
          <div className="info-grid">
            <div className="info-group">
              <label>Name:</label>
              <p>{merchandise.name || 'N/A'}</p>
            </div>
            <div className="info-group">
              <label>Description:</label>
              <p>{merchandise.description || 'N/A'}</p>
            </div>
            <div className="info-group">
              <label>Volume:</label>
              <p>{merchandise.volume?.toFixed(2)} m³</p>
            </div>
            <div className="info-group">
              <label>Package Count:</label>
              <p>{merchandise.packageCount}</p>
            </div>
            <div className="info-group">
              <label>Transport Type:</label>
              <p>{transportType}</p>
            </div>
            <div className="info-group">
              <label>Movement Type:</label>
              <p>{movementType}</p>
            </div>
            <div className="info-group">
              <label>Selected Incoterms:</label>
              <p>{Array.from(selectedIncoterms).join(', ')}</p>
            </div>
            <div className="info-group">
              <label>Stackable:</label>
              <p>{merchandise.isStackable ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="contact-info">
            <div className="sender-info">
              <h4>Sender Information</h4>
              <p><strong>Name:</strong> {sender.name}</p>
              <p><strong>Address:</strong> {sender.address}</p>
              <p><strong>Email:</strong> {sender.email}</p>
              <p><strong>Phone:</strong> {sender.phone}</p>
            </div>

            <div className="destination-info">
              <h4>Destination Information</h4>
              <p><strong>Name:</strong> {destination.name}</p>
              <p><strong>Address:</strong> {destination.address}</p>
              <p><strong>Email:</strong> {destination.email}</p>
              <p><strong>Phone:</strong> {destination.phone}</p>
            </div>
          </div>
        </div>

        <div className="country-selection">
          <label htmlFor="country">Select Destination Country:</label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">Select a country...</option>
            {Object.entries(CBM_RATES).map(([code, rate]) => (
              <option key={code} value={code}>
                {code} - {rate.eur}€/CBM
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading">Loading rates...</div>}
        {error && <div className="error">{error}</div>}

        {selectedCountry && merchandise.volume && (
          <>
            <div className="rates-table">
              <h3>Price Calculation (EUR)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Volume</td>
                    <td>{merchandise.volume.toFixed(2)} m³</td>
                  </tr>
                  <tr>
                    <td>Rate per CBM</td>
                    <td>{CBM_RATES[selectedCountry].eur}€</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Price</strong></td>
                    <td><strong>{calculateTotalPrices(merchandise.volume, selectedCountry).eur.toFixed(2)}€</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rates-table">
              <h3>Price Calculation (TND)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Volume</td>
                    <td>{merchandise.volume.toFixed(2)} m³</td>
                  </tr>
                  <tr>
                    <td>Rate per CBM</td>
                    <td>{CBM_RATES[selectedCountry].tnd} TND</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Price</strong></td>
                    <td><strong>{calculateTotalPrices(merchandise.volume, selectedCountry).tnd.toFixed(2)} TND</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="dialog-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className={`save-button ${isSaving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};



