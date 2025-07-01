import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-purple-500/30' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2024 Task.io. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a 
              href="#" 
              className={`text-sm transition-colors duration-300 ${
                darkMode 
                  ? 'text-gray-400 hover:text-purple-400' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className={`text-sm transition-colors duration-300 ${
                darkMode 
                  ? 'text-gray-400 hover:text-purple-400' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className={`text-sm transition-colors duration-300 ${
                darkMode 
                  ? 'text-gray-400 hover:text-purple-400' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 