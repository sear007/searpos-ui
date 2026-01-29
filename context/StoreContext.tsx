import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, AlertMessage, AlertType, StoreContextType } from '../types';
import { loginUser, submitOrder } from '../services/api';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPhone, setUserPhone] = useState<string | null>(localStorage.getItem('user_phone'));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  // Persist cart
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (phone: string): Promise<boolean> => {
    try {
      const data = await loginUser(phone);
      if (data && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_phone', phone);
        setUserPhone(phone);
        addAlert(`Welcome back, ${phone}!`, 'success');
        return true;
      } else {
        addAlert('Login failed. Please try again.', 'error');
        return false;
      }
    } catch (error) {
      addAlert('Login error. Check connection.', 'error');
      return false;
    }
  };

  const logout = () => {
    setUserPhone(null);
    setCart([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('cart');
    addAlert('Logged out successfully.', 'info');
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      // Initialize offerPrice with the product's list price
      return [...prev, { ...product, quantity: 1, offerPrice: product.price }];
    });
    addAlert(`${product.name} added to cart`, 'success');
  };

  const updateOfferPrice = (productId: string, price: number) => {
    setCart((prev) => 
      prev.map((item) => 
        item.id === productId ? { ...item, offerPrice: price } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const submitOrderRequest = async (orderData: any): Promise<boolean> => {
    const success = await submitOrder(orderData);
    if (success) {
      clearCart();
    }
    return success;
  };

  const addAlert = (message: string, type: AlertType) => {
    const id = Math.random().toString(36).substring(7);
    setAlerts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 3000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Standard total based on list price
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Total based on offer prices
  const totalOffer = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
  
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        userPhone,
        login,
        logout,
        cart,
        addToCart,
        updateOfferPrice,
        removeFromCart,
        clearCart,
        submitOrderRequest,
        alerts,
        addAlert,
        removeAlert,
        cartTotal,
        totalOffer,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};