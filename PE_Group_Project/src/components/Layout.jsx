import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Header 
        onToggleSidebar={toggleSidebar} 
        darkMode={darkMode}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer darkMode={darkMode} />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </div>
  );
};

export default Layout;