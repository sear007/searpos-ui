import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, AlertMessage, AlertType } from '../types';

interface StoreContextType {
  userPhone: string | null;
  login: (phone: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateOfferPrice: (productId: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  alerts: AlertMessage[];
  addAlert: (message: string, type: AlertType) => void;
  removeAlert: (id: string) => void;
  cartTotal: number;
  totalOffer: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const login = (phone: string) => {
    setUserPhone(phone);
    addAlert(`Welcome back, ${phone}!`, 'success');
  };

  const logout = () => {
    setUserPhone(null);
    setCart([]);
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