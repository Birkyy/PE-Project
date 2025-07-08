import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Bell, Check, Trash2, X } from "lucide-react";
import { notificationAPI } from "../API/apiService";

const NotificationsDropdown = ({ currentUser }) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser?.userId) return;

    try {
      setLoading(true);
      const fetchedNotifications = await notificationAPI.getUserNotification(
        currentUser.userId
      );
      setNotifications(fetchedNotifications || []);
      setUnreadCount(
        fetchedNotifications?.filter((n) => !n.isRead)?.length || 0
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
      setUnreadCount((prev) => {
        const deletedNotification = notifications.find(
          (n) => n.notificationId === notificationId
        );
        return deletedNotification && !deletedNotification.isRead
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.userId]);

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          darkMode
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } z-50`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <h3
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                <p
                  className={`text-sm mt-2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className={`divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}>
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-4 transition-colors ${
                      !notification.isRead
                        ? darkMode
                          ? "bg-purple-900/20"
                          : "bg-purple-50"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-medium ${
                              !notification.isRead
                                ? darkMode
                                  ? "text-purple-300"
                                  : "text-purple-900"
                                : darkMode
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              darkMode 
                                ? "bg-purple-900/30 text-purple-300"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              New
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p
                            className={`text-xs ${
                              !notification.isRead
                                ? darkMode
                                  ? "text-purple-300"
                                  : "text-purple-700"
                                : darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsRead(notification.notificationId)
                            }
                            className={`p-1.5 rounded-full transition-all duration-200 ${
                              darkMode
                                ? "hover:bg-purple-900/30 text-purple-400 bg-purple-900/20"
                                : "hover:bg-purple-100 text-purple-700 bg-purple-50"
                            }`}
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteNotification(notification.notificationId)
                          }
                          className={`p-1.5 rounded-full transition-all duration-200 ${
                            darkMode
                              ? "hover:bg-red-900/30 text-red-400 bg-red-900/20"
                              : "hover:bg-red-100 text-red-600 bg-red-50"
                          }`}
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <button
                onClick={() => {
                  // Mark all as read
                  notifications.forEach((n) => {
                    if (!n.isRead) markAsRead(n.notificationId);
                  });
                }}
                className={`text-sm font-medium flex items-center gap-2 transition-colors ${
                  darkMode
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-700 hover:text-purple-800"
                }`}
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
