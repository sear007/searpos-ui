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
  chat_id?: number | string | null;
}

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
}

export interface StoreContextType {
  userPhone: string | null;
  login: (phone: string) => Promise<boolean>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateOfferPrice: (productId: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  submitOrderRequest: (orderData: any) => Promise<boolean>;
  alerts: AlertMessage[];
  addAlert: (message: string, type: AlertType) => void;
  removeAlert: (id: string) => void;
  cartTotal: number;
  totalOffer: number;
  cartCount: number;
}