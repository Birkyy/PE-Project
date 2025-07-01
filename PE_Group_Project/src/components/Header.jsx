import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

const Header = ({ onToggleSidebar, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/home', label: 'Dashboard' },
    { path: '/my-projects', label: 'My Projects' },
    { path: '/users-management', label: 'Users Management' },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b ${darkMode ? 'border-purple-500/30' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home">
              <h1 className={`text-2xl font-bold transition-all duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-cyan-300' 
                  : 'text-gray-900 hover:text-gray-700'
              }`}>
                Task.io
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? darkMode 
                      ? 'text-purple-400 bg-gray-700/50'
                      : 'text-blue-600 bg-blue-50'
                    : darkMode
                      ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-700/50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button
              className={`relative p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 group ${
                darkMode
                  ? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-purple-400'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-300/25 focus:ring-purple-400'
              }`}
              aria-label="View notifications"
            >
              <Bell className={`w-6 h-6 transition-all duration-300 ${
                darkMode 
                  ? 'group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' 
                  : 'group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]'
              }`} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                3
              </span>
            </button>

            {/* Cyberpunk Logout Button */}
            <button
              onClick={handleLogout}
              className={`relative px-6 py-2 font-medium transition-all duration-300 bg-transparent border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 group ${
                darkMode
                  ? 'text-purple-300 border-purple-500 hover:bg-purple-500/20 hover:text-white hover:shadow-lg hover:shadow-purple-500/50 focus:ring-purple-400'
                  : 'text-blue-600 border-blue-500 hover:bg-blue-500/20 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:ring-blue-400'
              }`}
              style={darkMode ? {
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              } : {}}
            >
              <span className="relative z-10">LOGOUT</span>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500'
              }`}></div>
            </button>

            {/* Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700 focus:ring-purple-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-blue-400'
              }`}
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div className={`pt-2 pb-3 space-y-1 border-t ${darkMode ? 'border-purple-500/30' : 'border-gray-200'}`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? darkMode 
                      ? 'text-purple-400 bg-gray-700/50'
                      : 'text-blue-600 bg-blue-50'
                    : darkMode
                      ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-700/50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 