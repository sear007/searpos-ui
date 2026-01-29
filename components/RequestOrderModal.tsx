import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerType, OrderRequest } from '../types';
import { X, Send, Loader2, Tag, MapPinOff, Navigation } from 'lucide-react';

// Hook to get Telegram Chat ID
const useTelegramChatId = () => {
  const [chatId, setChatId] = useState<number | string | null>(null);

  useEffect(() => {
    // Ensure we are inside the Telegram environment
    // Use type assertion or optional chaining to access Telegram on window safely
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();

      // Get ID from chat context or user context
      const id = tg.initDataUnsafe?.chat?.id || tg.initDataUnsafe?.user?.id;

      if (id) {
        setChatId(id);
      }
    }
  }, []);

  return chatId;
};

interface RequestOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestOrderModal: React.FC<RequestOrderModalProps> = ({ isOpen, onClose }) => {
  const { userPhone, cart, cartTotal, totalOffer, submitOrderRequest, addAlert } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const chatId = useTelegramChatId();

  const [formData, setFormData] = useState<Partial<OrderRequest>>({
    customerName: '',
    customerPhone: userPhone || '',
    customerType: CustomerType.ONLINE,
    latitude: null,
    longitude: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRetryLocation = () => {
    if (!navigator.geolocation) {
        addAlert('Geolocation is not supported by your browser.', 'error');
        return;
    }

    // Try to get location again
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({ ...prev, latitude, longitude }));
            setLocationError(false); // Go back to form on success
            addAlert('Location access granted!', 'success');
        },
        (error) => {
            console.error("Retry location error:", error);
            alert("Location access is still denied. Please enable it in your browser settings (Site Settings > Location) and try again.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      addAlert('Please fill in required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setLocationError(false);

    const processSubmission = async (lat: number | null, lng: number | null) => {
      const finalPayload = {
        ...formData,
        latitude: lat || 0, // Ensure numeric for API
        longitude: lng || 0,
        items: cart,
        total: cartTotal,
        totalOffer: totalOffer,
        chat_id: chatId // Include Telegram Chat ID
      };

      const success = await submitOrderRequest(finalPayload);

      if (success) {
        addAlert('Order request sent successfully!', 'success');
        onClose();
      } else {
        addAlert('Failed to send order. Please try again.', 'error');
      }
      setIsSubmitting(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));
          processSubmission(latitude, longitude);
        },
        (error) => {
          console.error("Location error:", error);
          // Show strict error UI if location fails
          setLocationError(true);
          setIsSubmitting(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Not supported
      setLocationError(true);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white z-10 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Request Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          
          {locationError ? (
             <div className="flex flex-col items-center justify-center h-full py-8 space-y-6 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-red-50 p-6 rounded-full shadow-sm">
                    <MapPinOff className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Cannot process order</h3>
                    <p className="text-sm text-gray-500 max-w-[260px] mx-auto leading-relaxed">
                        We need your location to deliver this order accurately. Please enable location access to continue.
                    </p>
                </div>
                
                <div className="w-full space-y-3 pt-2">
                    <button 
                        onClick={handleRetryLocation}
                        className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-4 h-4" />
                        Enable Location Access
                    </button>
                    <button 
                        onClick={() => setLocationError(false)}
                        className="text-gray-400 text-xs font-medium hover:text-gray-600 py-2"
                    >
                        Back to form
                    </button>
                </div>
            </div>
          ) : (
            <div className="space-y-6">
                {/* Order Summary Summary */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h3>
                    <div className="text-xs text-gray-600">
                    {cart.length} items selected
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>List Price Total</span>
                        <span className="line-through">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                        <Tag className="w-4 h-4 text-primary" />
                        Total Negotiation
                        </span>
                        <span className="font-bold text-primary text-xl">${totalOffer.toFixed(2)}</span>
                    </div>
                    </div>
                </div>

                <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Info */}
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                        <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                        >
                        {Object.values(CustomerType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                        </select>
                    </div>
                    </div>

                    {/* Location Info (Hidden visually but kept in state) */}
                    <div className="pt-2 hidden">
                         {/* ... */}
                    </div>
                </form>
            </div>
          )}
        </div>

        {/* Footer Actions - Only show if no error */}
        {!locationError && (
            <div className="p-4 border-t bg-gray-50 shrink-0">
            <button
                form="order-form"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Fetching Location...' : 'Send Order Request'}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RequestOrderModal;