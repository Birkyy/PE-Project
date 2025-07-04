import { Bell } from 'lucide-react';
import { useState } from 'react';

const NotificationsDropdown = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications data - in a real app, this would come from your backend
  const notifications = [
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned to Project Alpha",
      time: "5 minutes ago",
      isRead: false
    },
    {
      id: 2,
      title: "Project Update",
      message: "Project Beta has been updated",
      time: "1 hour ago",
      isRead: false
    },
    {
      id: 3,
      title: "Deadline Reminder",
      message: "Task 'Update Documentation' is due tomorrow",
      time: "2 hours ago",
      isRead: false
    }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50 group ${
          darkMode
            ? 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 hover:shadow-lg hover:shadow-purple-500/25'
            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-300/25'
        }`}
        aria-label="View notifications"
      >
        <Bell className={`w-6 h-6 transition-all duration-300 ${
          darkMode 
            ? 'group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' 
            : 'group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]'
        }`} />
        {/* Notification badge */}
        <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold transition-transform duration-200 group-hover:scale-110 ${
          darkMode ? 'shadow-lg shadow-red-500/50' : 'shadow-md shadow-red-500/30'
        }`}>
          {notifications.length}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg ${
          darkMode 
            ? 'bg-gray-800 border border-purple-500/30' 
            : 'bg-white border border-gray-200'
        } overflow-hidden z-50`}>
          <div className={`p-4 ${darkMode ? 'border-b border-purple-500/30' : 'border-b border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 ${
                  darkMode 
                    ? 'hover:bg-purple-900/20 border-b border-purple-500/30' 
                    : 'hover:bg-gray-50 border-b border-gray-100'
                } transition-colors duration-200 cursor-pointer`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.time}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className={`h-2 w-2 rounded-full ${
                      darkMode ? 'bg-purple-400' : 'bg-purple-600'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={`p-3 text-center ${darkMode ? 'border-t border-purple-500/30' : 'border-t border-gray-200'}`}>
            <button
              className={`text-sm font-medium ${
                darkMode 
                  ? 'text-purple-400 hover:text-purple-300' 
                  : 'text-purple-600 hover:text-purple-700'
              } transition-colors duration-200`}
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown; 