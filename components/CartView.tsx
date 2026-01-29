import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import RequestOrderModal from './RequestOrderModal';

interface CartViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartView: React.FC<CartViewProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateOfferPrice, cartTotal, totalOffer, addAlert } = useStore();
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      addAlert('Your cart is empty', 'error');
      return;
    }
    setRequestModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            My Cart
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2">
            Close
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Your cart is currently empty.</p>
              <button onClick={onClose} className="text-primary font-medium hover:underline">
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-white" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    
                    <div className="mt-1 flex items-center justify-between">
                       <span className="text-xs text-gray-400">List Price</span>
                       <span className="text-sm font-medium text-gray-500 line-through">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-medium text-gray-500">Qty: {item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Offer Price Input Section */}
                <div className="pt-3 border-t border-dashed border-gray-200">
                  <label className="text-[10px] uppercase font-bold text-primary flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3" />
                    Your Offer Price (Per Unit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                    <input 
                      type="number" 
                      value={item.offerPrice === 0 ? '' : item.offerPrice}
                      onChange={(e) => updateOfferPrice(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder={item.price.toFixed(2)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-white safe-area-pb space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>List Total</span>
              <span className="line-through">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-800 font-bold">Total Offer</span>
              <span className="text-2xl font-bold text-primary">${totalOffer.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Proceed to Request</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <RequestOrderModal 
        isOpen={isRequestModalOpen} 
        onClose={() => {
          setRequestModalOpen(false);
          onClose(); 
        }} 
      />
    </>
  );
};

export default CartView;