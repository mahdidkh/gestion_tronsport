import React, { useState, ChangeEvent } from 'react';
import type { Merchandise, TransportType, Incoterm, Contact } from '../../types';
import './MerchandiseForm.css';
import { ShipmentDialog } from './ShipmentDialog';

interface MerchandiseFormProps {
  onNavigateToHistorique?: () => void;
}

export const MerchandiseForm = ({ onNavigateToHistorique }: MerchandiseFormProps) => {
  const [merchandise, setMerchandise] = useState<Partial<Merchandise>>({
    dimensions: { height: 0, length: 0, width: 0 },
    isStackable: true,
    volume: 0,
    name: '',
    description: '',
    weight: 0,
    packageCount: 1,
  });
  const [sender, setSender] = useState<Contact>({
    name: '',
    address: '',
    email: '',
    phone: '',
  });
  const [destination, setDestination] = useState<Contact>({
    name: '',
    address: '',
    email: '',
    phone: '',
  });
  const [selectedIncoterms, setSelectedIncoterms] = useState<Set<Incoterm>>(new Set(['EXW']));
  const [transportType, setTransportType] = useState<TransportType>('MARITIME');
  const [movementType, setMovementType] = useState<'Importation' | 'Exportation'>('Importation');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const incoterms: Incoterm[] = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP'];
  const transportTypes: TransportType[] = ['MARITIME', 'AIR', 'ROAD'];

  const handleIncotermChange = (incoterm: Incoterm) => {
    setSelectedIncoterms(prev => {
      const newIncoterms = new Set(prev);
      if (newIncoterms.has(incoterm)) {
        newIncoterms.delete(incoterm);
      } else {
        newIncoterms.add(incoterm);
      }
      return newIncoterms;
    });
  };

  const calculateVolume = (): void => {
    if (!merchandise.dimensions) return;

    const { length, width } = merchandise.dimensions;
    // Si non gerbable, utiliser une hauteur fixe de 220
    const height = merchandise.isStackable ? merchandise.dimensions.height : 220;

    const volumeInCbm = (height * length * width) / 1000000; // Convert cm³ to m³
    setMerchandise(prev => ({ ...prev, volume: volumeInCbm }));
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setMerchandise(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions!,
          [dimension]: value
        }
      }));
    };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate merchandise details
    if (!merchandise.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!merchandise.description?.trim()) {
      errors.description = 'Description is required';
    }
    if (!merchandise.packageCount || merchandise.packageCount < 1) {
      errors.packageCount = 'Package count must be at least 1';
    }
    if (!merchandise.weight || merchandise.weight <= 0 || isNaN(merchandise.weight)) {
      errors.weight = 'Weight must be greater than 0';
    }

    // Validate dimensions
    if (!merchandise.dimensions?.length || merchandise.dimensions.length <= 0) {
      errors.length = 'Length must be greater than 0';
    }
    if (!merchandise.dimensions?.width || merchandise.dimensions.width <= 0) {
      errors.width = 'Width must be greater than 0';
    }
    if (!merchandise.dimensions?.height || merchandise.dimensions.height <= 0) {
      errors.height = 'Height must be greater than 0';
    }

    // Validate contacts
    if (!sender.name?.trim()) errors.senderName = 'Sender name is required';
    if (!sender.address?.trim()) errors.senderAddress = 'Sender address is required';
    if (!sender.email?.trim()) errors.senderEmail = 'Sender email is required';
    if (!sender.phone?.trim()) errors.senderPhone = 'Sender phone is required';

    if (!destination.name?.trim()) errors.destName = 'Destination name is required';
    if (!destination.address?.trim()) errors.destAddress = 'Destination address is required';
    if (!destination.email?.trim()) errors.destEmail = 'Destination email is required';
    if (!destination.phone?.trim()) errors.destPhone = 'Destination phone is required';

    // Validate that at least one Incoterm is selected
    if (selectedIncoterms.size === 0) {
      errors.incoterms = 'At least one Incoterm must be selected';
    }

    // Set the errors and return validation result
    setFormErrors(errors);

    // Log the validation results for debugging
    console.log('Form Errors:', errors);
    console.log('Form Data:', {
      merchandise,
      sender,
      destination,
      selectedIncoterms,
      transportType,
      movementType
    });

    return Object.keys(errors).length === 0;
  };

  const handleCalculateClick = () => {
    if (validateForm()) {
      calculateVolume();
      setIsDialogOpen(true);
    } else {
      // Show which fields are missing
      const missingFields = Object.keys(formErrors).join(', ');
      alert(`Please fill in all required fields: ${missingFields}`);
    }
  };

  const handleSenderChange = (field: keyof Contact) => (e: ChangeEvent<HTMLInputElement>) => {
    setSender(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleDestinationChange = (field: keyof Contact) => (e: ChangeEvent<HTMLInputElement>) => {
    setDestination(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleMerchandiseChange = (field: keyof Merchandise) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'weight' || field === 'packageCount'
        ? parseFloat(e.target.value) // Use parseFloat instead of Number
        : e.target.value;

      setMerchandise(prev => ({
        ...prev,
        [field]: value
      }));
    };

  const getFormGroupClassName = (fieldName: string) => {
    return `form-group ${formErrors[fieldName] ? 'error' : ''}`;
  };

  return (
    <>
      <form className="merchandise-form" onSubmit={(e) => e.preventDefault()}>
        <h1>Transport de Marchandises</h1>

        {/* Marchandise Expédiée Section */}
        <div className="merchandise-details-section">
          <h2>Marchandise Expédiée</h2>
          <div className="form-grid">
            <div className={getFormGroupClassName('name')}>
              <input
                type="text"
                placeholder="Nom de la marchandise *"
                value={merchandise.name || ''}
                onChange={handleMerchandiseChange('name')}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>

            <div className={getFormGroupClassName('weight')}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Poids (kg) *"
                value={merchandise.weight || ''}
                onChange={handleMerchandiseChange('weight')}
              />
              {formErrors.weight && <span className="error-message">{formErrors.weight}</span>}
            </div>

            <div className={getFormGroupClassName('packageCount')}>
              <input
                type="number"
                min="1"
                placeholder="Nombre de colis *"
                value={merchandise.packageCount || ''}
                onChange={handleMerchandiseChange('packageCount')}
              />
              {formErrors.packageCount && <span className="error-message">{formErrors.packageCount}</span>}
            </div>
          </div>

          <div className="form-separator"></div>

          <div className={getFormGroupClassName('description')}>
            <textarea
              placeholder="Description de la marchandise *"
              value={merchandise.description || ''}
              onChange={handleMerchandiseChange('description')}
              rows={3}
            />
            {formErrors.description && <span className="error-message">{formErrors.description}</span>}
          </div>
        </div>

        <div className="contact-section">
          <h2>Expéditeur</h2>
          <div className={getFormGroupClassName('senderName')}>
            <input
              type="text"
              placeholder="Nom *"
              value={sender.name}
              onChange={handleSenderChange('name')}
            />
            {formErrors.senderName && <span className="error-message">{formErrors.senderName}</span>}
          </div>
          <div className={getFormGroupClassName('senderAddress')}>
            <input
              type="text"
              placeholder="Adresse *"
              value={sender.address}
              onChange={handleSenderChange('address')}
            />
            {formErrors.senderAddress && <span className="error-message">{formErrors.senderAddress}</span>}
          </div>
          <div className={getFormGroupClassName('senderEmail')}>
            <input
              type="email"
              placeholder="Email *"
              value={sender.email}
              onChange={handleSenderChange('email')}
            />
            {formErrors.senderEmail && <span className="error-message">{formErrors.senderEmail}</span>}
          </div>
          <div className={getFormGroupClassName('senderPhone')}>
            <input
              type="tel"
              placeholder="Téléphone *"
              value={sender.phone}
              onChange={handleSenderChange('phone')}
            />
            {formErrors.senderPhone && <span className="error-message">{formErrors.senderPhone}</span>}
          </div>
        </div>

        <div className="contact-section">
          <h2>Destination</h2>
          <div className={getFormGroupClassName('destName')}>
            <input
              type="text"
              placeholder="Nom *"
              value={destination.name}
              onChange={handleDestinationChange('name')}
            />
            {formErrors.destName && <span className="error-message">{formErrors.destName}</span>}
          </div>
          <div className={getFormGroupClassName('destAddress')}>
            <input
              type="text"
              placeholder="Adresse *"
              value={destination.address}
              onChange={handleDestinationChange('address')}
            />
            {formErrors.destAddress && <span className="error-message">{formErrors.destAddress}</span>}
          </div>
          <div className={getFormGroupClassName('destEmail')}>
            <input
              type="email"
              placeholder="Email *"
              value={destination.email}
              onChange={handleDestinationChange('email')}
            />
            {formErrors.destEmail && <span className="error-message">{formErrors.destEmail}</span>}
          </div>
          <div className={getFormGroupClassName('destPhone')}>
            <input
              type="tel"
              placeholder="Téléphone *"
              value={destination.phone}
              onChange={handleDestinationChange('phone')}
            />
            {formErrors.destPhone && <span className="error-message">{formErrors.destPhone}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Type de mouvement:</label>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as 'Importation' | 'Exportation')}
          >
            <option value="Importation">Importation</option>
            <option value="Exportation">Exportation</option>
          </select>
        </div>

        <div className="form-group">
          <label>Dimensions (cm) *</label>
          <div className="dimensions-inputs">
            <div className={getFormGroupClassName('length')}>
              <input
                type="number"
                min="0"
                placeholder="Longueur"
                value={merchandise.dimensions?.length || ''}
                onChange={handleDimensionChange('length')}
              />
              {formErrors.length && <span className="error-message">{formErrors.length}</span>}
            </div>
            <div className={getFormGroupClassName('width')}>
              <input
                type="number"
                min="0"
                placeholder="Largeur"
                value={merchandise.dimensions?.width || ''}
                onChange={handleDimensionChange('width')}
              />
              {formErrors.width && <span className="error-message">{formErrors.width}</span>}
            </div>
            <div className={getFormGroupClassName('height')}>
              <input
                type="number"
                min="0"
                placeholder="Hauteur"
                value={merchandise.isStackable ? (merchandise.dimensions?.height || '') : '220'}
                onChange={handleDimensionChange('height')}
                disabled={!merchandise.isStackable}
              />
              {!merchandise.isStackable && (
                <span className="info-message">Hauteur fixée à 220cm (non gerbable)</span>
              )}
              {formErrors.height && <span className="error-message">{formErrors.height}</span>}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Gerbable:</label>
          <select
            value={merchandise.isStackable ? 'Oui' : 'Non'}
            onChange={(e) => {
              const isStackable = e.target.value === 'Oui';
              setMerchandise(prev => ({
                ...prev,
                isStackable,
                dimensions: {
                  ...prev.dimensions!,
                  height: isStackable ? prev.dimensions!.height : 220
                }
              }));
            }}
          >
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mode de transport:</label>
          <select
            value={transportType}
            onChange={(e) => setTransportType(e.target.value as TransportType)}
          >
            {transportTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="incoterms-section">
          <h3>Incoterms:</h3>
          <div className="incoterms-container">
            {incoterms.map((incoterm) => (
              <div key={incoterm} className="incoterm-option">
                <label className="incoterm-label">
                  <span className="incoterm-code">{incoterm}</span>
                  <span className="incoterm-description">
                    {getIncotermDescription(incoterm)}
                  </span>
                </label>
                <input
                  type="checkbox"
                  className="incoterm-checkbox"
                  checked={selectedIncoterms.has(incoterm)}
                  onChange={() => handleIncotermChange(incoterm)}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="calculate-button"
          onClick={handleCalculateClick}
        >
          Calculer Volume
        </button>

        <div className="volume-result">
          <p>Volume total (CBM): {merchandise.volume?.toFixed(2)} m³</p>
        </div>
      </form>

      <ShipmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        merchandise={merchandise}
        transportType={transportType}
        selectedIncoterms={selectedIncoterms}
        movementType={movementType}
        sender={sender}
        destination={destination}
        onNavigateToHistorique={onNavigateToHistorique}
      />
    </>
  );
};

function getIncotermDescription(incoterm: Incoterm): string {
  const descriptions: Record<Incoterm, string> = {
    EXW: 'Ex Works (À l usine)',
    FOB: 'Free On Board (Franco à bord)',
    CIF: 'Cost, Insurance and Freight (Coût, assurance et fret)',
    CFR: 'Cost and Freight (Coût et fret)',
    DAP: 'Delivered At Place (Rendu au lieu de destination)',
    DDP: 'Delivered Duty Paid (Rendu droits acquittés)'
  };
  return descriptions[incoterm];
}















