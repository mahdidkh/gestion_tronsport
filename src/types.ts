export type TransportType = 'MARITIME' | 'AIR' | 'ROAD';
export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'CFR' | 'DAP' | 'DDP';

export interface Contact {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface Merchandise {
  name: string;
  description: string;
  weight: number;
  packageCount: number;
  dimensions: Dimensions;
  isStackable: boolean;
  volume: number;
}
