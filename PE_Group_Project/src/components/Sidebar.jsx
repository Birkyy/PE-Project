import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  Shield,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onClose();
    navigate('/login');
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const settingsItems = [
    { icon: Shield, label: 'Privacy', action: () => {
      onClose();
      navigate('/privacy');
    }},
    { icon: HelpCircle, label: 'Help & Support', action: () => console.log('Help') }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-l ${darkMode ? 'border-purple-500/30' : 'border-gray-200'} shadow-2xl z-50 transform transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-purple-500/30' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              
              {/* Light/Dark Mode Toggle */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-gray-50 border-gray-200'} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? (
                      <Moon className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-gray-600'}`} />
                    ) : (
                      <Sun className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-yellow-500'}`} />
                    )}
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-gray-50 border-gray-200'} overflow-hidden`}>
                <button
                  onClick={handleSettingsClick}
                  className={`w-full p-4 flex items-center space-x-3 transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  <Settings className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-gray-600'}`} />
                  <span className="font-medium">Settings</span>
                  <div className="ml-auto">
                    <div className={`transform transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>
                </button>
                
                {/* Settings Submenu */}
                {showSettings && (
                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {settingsItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className={`w-full p-3 pl-12 flex items-center space-x-3 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`w-full p-4 rounded-lg border flex items-center space-x-3 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-red-500/30 hover:bg-red-900/20 hover:shadow-lg hover:shadow-red-500/20 text-white' : 'bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-900'}`}
              >
                <LogOut className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${darkMode ? 'border-purple-500/30' : 'border-gray-200'}`}>
            <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Task.io v1.0.0</p>
              <p className="mt-1">© 2024 Task Management System</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 