import axios from 'axios';

// Simple function to test the API directly
export const testShipmentAPI = async () => {
  try {
    const testData = {
      // Merchandise Information
      merchandiseName: "Test Merchandise",
      weight: 100.0,
      description: "Test Description",

      // Shipper Information
      shipperName: "Test Shipper",
      shipperAddress: "Test Address",
      shipperEmail: "test@example.com",
      shipperPhone: "123456789",

      // Destination Information
      receiverName: "Test Receiver",
      receiverAddress: "Test Receiver Address",
      receiverEmail: "receiver@example.com",
      receiverPhone: "987654321",

      // Additional Information
      transportType: "MARITIME",
      shippingCost: 1000.0,
      service: "EXW, FOB",
      modeOfTransport: "Importation",

      // Payment Information
      paymentMethod: "Not specified"
    };

    console.log('Sending test shipment data:', testData);
    
    const response = await axios.post('http://localhost:8081/api/shipments', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Test shipment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in test shipment:', error);
    throw error;
  }
};
