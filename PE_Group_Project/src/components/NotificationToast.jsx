import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const NotificationToast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return darkMode ? 'bg-green-900/30' : 'bg-green-50';
      case 'error':
        return darkMode ? 'bg-red-900/30' : 'bg-red-50';
      case 'info':
        return darkMode ? 'bg-blue-900/30' : 'bg-blue-50';
      default:
        return darkMode ? 'bg-gray-800' : 'bg-white';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return darkMode ? 'border-green-800/30' : 'border-green-200';
      case 'error':
        return darkMode ? 'border-red-800/30' : 'border-red-200';
      case 'info':
        return darkMode ? 'border-blue-800/30' : 'border-blue-200';
      default:
        return darkMode ? 'border-gray-700' : 'border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return darkMode ? 'text-green-400' : 'text-green-800';
      case 'error':
        return darkMode ? 'text-red-400' : 'text-red-800';
      case 'info':
        return darkMode ? 'text-blue-400' : 'text-blue-800';
      default:
        return darkMode ? 'text-gray-300' : 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Notification */}
      <div
        className={`relative flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border ${getBgColor()} ${getBorderColor()} transition-all duration-300 transform animate-slide-in max-w-md w-full mx-4`}
        role="alert"
      >
        <div className={`p-2 rounded-full ${
          type === 'success' 
            ? (darkMode ? 'bg-green-500/10' : 'bg-green-100') 
            : type === 'error'
            ? (darkMode ? 'bg-red-500/10' : 'bg-red-100')
            : (darkMode ? 'bg-blue-500/10' : 'bg-blue-100')
        }`}>
          {getIcon()}
        </div>
        <p className={`flex-1 text-lg font-medium ${getTextColor()}`}>{message}</p>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            darkMode
              ? 'hover:bg-gray-700/50 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast; 