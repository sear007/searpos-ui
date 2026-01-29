import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Smartphone, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login, addAlert } = useStore();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 3) {
      addAlert('Invalid phone number', 'error');
      return;
    }
    
    setIsLoading(true);
    const success = await login(phone);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-full max-w-xs space-y-8">
        
        <div className="text-center space-y-2">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Smartphone className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">QuickOrder</h1>
            <p className="text-gray-500 font-medium">Enter your phone to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl text-center text-xl font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all"
            placeholder="0XX-XXX-XXX"
            autoFocus
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Start Ordering</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
            By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Login;