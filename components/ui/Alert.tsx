import React from 'react';
import { AlertMessage } from '../../types';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useStore();

  return (
    <div className="absolute top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border w-full
            transform transition-all duration-300 animate-[slideUp_0.3s_ease-out]
            ${alert.type === 'success' ? 'bg-white border-green-100 text-green-800 shadow-green-100/50' : ''}
            ${alert.type === 'error' ? 'bg-white border-red-100 text-red-800 shadow-red-100/50' : ''}
            ${alert.type === 'info' ? 'bg-white border-blue-100 text-blue-800 shadow-blue-100/50' : ''}
          `}
        >
          {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
          {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          {alert.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}
          
          <span className="flex-1 text-sm font-semibold">{alert.message}</span>
          
          <button onClick={() => removeAlert(alert.id)} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertContainer;