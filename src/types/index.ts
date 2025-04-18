export interface Merchandise {
  id: string;
  name: string;
  reference: string;
  description: string;
  dimensions: {
    height: number;
    length: number;
    width: number;
  };
  volume: number;
  weight: number;
  type: string;
  isStackable: boolean;
  packageCount: number;
}

export type TransportType = 'MARITIME' | 'AIR' | 'ROAD';

export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'CFR' | 'DAP' | 'DDP';

export interface Contact {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface ShipmentDetails {
  transportType: TransportType;
  shipper: Contact;
  consignee: Contact;
  incoterm: Incoterm;
  merchandise: Merchandise;
  cbm: number;
  price: {
    amount: number;
    currency: string;
  };
}



