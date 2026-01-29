import { DUMMY_PRODUCTS } from '../constants';
import { Product } from '../types';

export const DEBUG_MODE = false; 
const BASE_URL = 'https://10d1bcdc1a71.ngrok-free.app';
const API_URL = `${BASE_URL}/api/telegram`;

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'ngrok-skip-browser-warning': 'true'
  };
};

const getImageUrl = (path: string | null) => {
  if (!path) return 'https://picsum.photos/400/400?random=1'; // default fallback
  if (path.startsWith('http')) return path; // already full url
  // Handle relative paths from Laravel storage
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const loginUser = async (phone: string): Promise<{ token: string } | null> => {
  if (DEBUG_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { token: 'dummy-token-123' };
  }

  try {
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return data; // Expected { token: "..." }
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export interface ProductsResponse {
  products: Product[];
  lastPage: number;
}

export const getProducts = async (page: number = 1): Promise<ProductsResponse> => {
  if (DEBUG_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { products: DUMMY_PRODUCTS, lastPage: 1 };
  }

  try {
    const response = await fetch(`${API_URL}/products?page=${page}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
    
    const result = await response.json();
    
    // API returns Laravel pagination object: { data: [...], last_page: 1, current_page: 1, ... }
    const apiProducts = Array.isArray(result.data) ? result.data : [];
    
    const mappedProducts = apiProducts.map((p: any) => ({
      id: p.id ? String(p.id) : String(Math.random()),
      name: p.name || 'Unknown Product',
      price: typeof p.price === 'number' ? p.price : 0,
      // Map nested category object { id, name } to string
      category: p.category?.name || 'Uncategorized',
      image: getImageUrl(p.image)
    }));

    return {
      products: mappedProducts,
      lastPage: result.last_page || 1
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [], lastPage: 1 }; 
  }
};

export const submitOrder = async (orderData: any): Promise<boolean> => {
  if (DEBUG_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }

  try {
    const response = await fetch(`${API_URL}/send_order_request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Order submission failed:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Order Error:", error);
    return false;
  }
};