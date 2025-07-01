import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-purple-500/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Task.io
            </h3>
            <span className="text-gray-400 text-sm">
              © 2024 Task.io. All rights reserved.
            </span>
          </div>
          
          {/* Footer Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/help" 
              className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
            >
              Help
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
            >
              Terms
            </Link>
            <span className="text-gray-500 text-xs">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 