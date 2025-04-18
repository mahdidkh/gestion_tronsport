import api from './api';

interface ShipmentData {
  // Merchandise Information
  merchandiseName: string;
  weight: number;
  description: string;

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

  // Payment Information
  paymentMethod?: string;
}

export const shipmentService = {
  async createShipment(data: ShipmentData) {
    try {
      console.log('Sending shipment data:', data);
      const response = await api.post('/shipments', data);
      console.log('Shipment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  },

  async getAllShipments() {
    try {
      const response = await api.get('/shipments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getShipmentById(id: number) {
    try {
      const response = await api.get(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
