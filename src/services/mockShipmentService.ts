// Mock service to simulate saving shipment data without a backend

// In-memory storage for shipments
let shipments: any[] = [];

export interface MockShipmentData {
  // Merchandise Information
  merchandiseName: string;
  weight: number;
  description: string;
  packageCount?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isStackable?: boolean;
  volume?: number;

  // Shipper Information
  shipperName: string;
  shipperAddress: string;
  shipperEmail: string;
  shipperPhone: string;

  // Destination Information
  receiverName: string;
  receiverAddress: string;
  receiverEmail: string;
  receiverPhone: string;

  // Additional Information
  transportType: string;
  shippingCost: number;
  service?: string;
  modeOfTransport: string;
  country?: string;
  priceEUR?: number;
  priceTND?: number;

  // Payment Information
  paymentMethod?: string;
}

export const mockShipmentService = {
  // Create a new shipment
  createShipment: async (data: MockShipmentData) => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Generate a random ID
        const id = Math.floor(Math.random() * 10000);

        // Create a new shipment with ID and timestamp
        const newShipment = {
          id,
          ...data,
          createdAt: new Date().toISOString()
        };

        // Add to our in-memory storage
        shipments.push(newShipment);

        // Log the saved shipment
        console.log('Shipment saved to mock storage:', newShipment);

        // Return the created shipment
        resolve(newShipment);
      }, 500); // 500ms delay to simulate network
    });
  },

  // Get all shipments
  getAllShipments: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(shipments);
      }, 500);
    });
  },

  // Get a shipment by ID
  getShipmentById: async (id: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shipment = shipments.find(s => s.id === id);
        if (shipment) {
          resolve(shipment);
        } else {
          reject(new Error('Shipment not found'));
        }
      }, 500);
    });
  },

  // Clear all shipments (for testing)
  clearShipments: () => {
    shipments = [];
    localStorage.removeItem('shipments');
    return Promise.resolve(true);
  },

  // Delete a shipment by index
  deleteShipment: async (index: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Remove from in-memory storage
        if (index >= 0 && index < shipments.length) {
          shipments.splice(index, 1);
        }

        // Update localStorage
        try {
          const localStorageShipments = JSON.parse(localStorage.getItem('shipments') || '[]');
          if (index >= 0 && index < localStorageShipments.length) {
            localStorageShipments.splice(index, 1);
            localStorage.setItem('shipments', JSON.stringify(localStorageShipments));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }

        resolve(true);
      }, 300);
    });
  }
};
