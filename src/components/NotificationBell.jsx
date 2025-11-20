import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaSpinner, FaTrash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import notificationApi from '../api/notificationApi';

const DEBUG = true;

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
      // Polling every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotificationByUserId(user.userId, 0, 10);
      
      let notifs = [];
      if (response?.data && Array.isArray(response.data)) {
        notifs = response.data;
      } else if (Array.isArray(response)) {
        notifs = response;
      }
      
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      if (DEBUG) console.log('📬 Notifications loaded:', notifs.length, 'Unread:', unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete notification
  const handleDelete = async (notificationId) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (DEBUG) console.log('✅ Deleted notification:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-[#03ccba] transition-colors"
        title="Notifications"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-t-lg">
            <h3 className="font-bold">🔔 Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-white hover:opacity-70"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-[#03ccba] text-2xl" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell size={32} className="mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm line-clamp-1">
                        {notification.title || notification.message}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleString('vi-VN')
                          : 'Just now'
                        }
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                onClick={fetchNotifications}
                className="text-xs text-[#03ccba] hover:text-[#02b5a5] font-semibold"
              >
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}