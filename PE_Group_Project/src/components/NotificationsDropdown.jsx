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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
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
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-4 transition-colors ${
                      !notification.isRead
                        ? darkMode
                          ? "bg-blue-900/20"
                          : "bg-blue-50"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? darkMode
                                ? "text-blue-300"
                                : "text-blue-900"
                              : darkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsRead(notification.notificationId)
                            }
                            className={`p-1 rounded ${
                              darkMode
                                ? "hover:bg-gray-600 text-gray-400"
                                : "hover:bg-gray-200 text-gray-600"
                            }`}
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteNotification(notification.notificationId)
                          }
                          className={`p-1 rounded ${
                            darkMode
                              ? "hover:bg-red-600/20 text-red-400"
                              : "hover:bg-red-100 text-red-500"
                          }`}
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
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
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  // Mark all as read
                  notifications.forEach((n) => {
                    if (!n.isRead) markAsRead(n.notificationId);
                  });
                }}
                className={`text-sm ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
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
