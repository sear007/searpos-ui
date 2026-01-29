export enum CustomerType {
  ONLINE = 'Online',
  WHOLESALE = 'Wholesale',
  RETAIL = 'Retail',
  CORPORATE = 'Corporate'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
  offerPrice: number; // Renamed from negotiatedPrice, defaults to product.price
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  latitude: number | null;
  longitude: number | null;
  items: CartItem[];
  total: number;
  totalOffer: number; // Renamed from negotiatedTotal
}

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
}