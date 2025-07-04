import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-purple-500/30' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2024 Task.io. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
