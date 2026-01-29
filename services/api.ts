import { DUMMY_PRODUCTS } from '../constants';
import { Product } from '../types';

export const DEBUG_MODE = false; 
const API_URL = 'https://10d1bcdc1a71.ngrok-free.app/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'ngrok-skip-browser-warning': 'true'
  };
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

export const getProducts = async (): Promise<Product[]> => {
  if (DEBUG_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return DUMMY_PRODUCTS;
  }

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
    
    const result = await response.json();
    
    // Map API response to internal Product type
    // Assuming API returns { data: [...] } based on description
    const apiProducts = Array.isArray(result.data) ? result.data : [];
    
    return apiProducts.map((p: any) => ({
      id: p.id ? String(p.id) : String(Math.random()),
      name: p.name || 'Unknown Product',
      price: typeof p.price === 'number' ? p.price : 0,
      category: p.category || 'Uncategorized',
      image: p.image || `https://picsum.photos/400/400?random=${p.id || Math.random()}` // Fallback image
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Return empty array or DUMMY_PRODUCTS on failure depending on preference.
    // Returning empty array allows the UI to handle "No products" or we can fallback to dummy.
    // For now, let's fallback to dummy if it's a network error for smoother demo if API is down
    return DUMMY_PRODUCTS; 
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