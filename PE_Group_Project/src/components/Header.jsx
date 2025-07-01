import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
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
    { path: '/member-home', label: 'Home' },
    { path: '/my-projects', label: 'My Projects' },
    { path: '/users-management', label: 'Users Management' },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/member-home">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-cyan-300 transition-all duration-300">
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
                    ? 'text-purple-400 bg-gray-700/50'
                    : 'text-gray-300 hover:text-purple-400 hover:bg-gray-700/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Cyberpunk Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="relative px-6 py-2 font-medium text-purple-300 transition-all duration-300 bg-transparent border-2 border-purple-500 rounded-lg hover:bg-purple-500/20 hover:text-white hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 group"
              style={{
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              }}
            >
              <span className="relative z-10">LOGOUT</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-purple-500/30">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-purple-400 bg-gray-700/50'
                    : 'text-gray-300 hover:text-purple-400 hover:bg-gray-700/50'
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