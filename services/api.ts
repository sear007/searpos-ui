import { DUMMY_PRODUCTS } from '../constants';
import { Product } from '../types';

// Toggle this to false to use the real API_URL
export const DEBUG_MODE = true; 
const API_URL = 'https://api.example.com/products';

export const getProducts = async (): Promise<Product[]> => {
  // Debug Mode: Return local dummy data
  if (DEBUG_MODE) {
    // Simulate network latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return DUMMY_PRODUCTS;
  }

  // Live Mode: Fetch from API
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch products from API, falling back to dummy data:", error);
    // Fallback to dummy data in case of error, or rethrow if you want to show error UI
    return DUMMY_PRODUCTS;
  }
};
