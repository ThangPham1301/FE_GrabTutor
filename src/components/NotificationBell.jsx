import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaSpinner, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../api/notificationApi';
import chatApi from '../api/chatApi';

const DEBUG = true;

// ✅ NOTIFICATION TYPE MAPPING
const NOTIFICATION_TYPES = {
  'ACCOUNT_BALANCE': { icon: '💰', label: 'Account Balance' },
  'BID_ACCEPTED': { icon: '✅', label: 'Bid Accepted' },
  'BID_REJECTED': { icon: '❌', label: 'Bid Rejected' },
  'NEW_MESSAGE': { icon: '💬', label: 'New Message' },
  'REVIEW_SUBMITTED': { icon: '⭐', label: 'Review Submitted' },
  'REPORT_FILED': { icon: '🚩', label: 'Report Filed' },
  'NOTIFICATION': { icon: '🔔', label: 'Notification' },
  'DEFAULT': { icon: '📢', label: 'Update' }
};

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // ✅ LOAD FROM LOCALSTORAGE ON MOUNT
  useEffect(() => {
    if (user?.userId) {
      // Try to load from localStorage first
      const savedNotifications = localStorage.getItem(`notifications_${user.userId}`);
      const savedUnreadCount = localStorage.getItem(`unreadCount_${user.userId}`);
      
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
          if (DEBUG) console.log('📬 Loaded notifications from localStorage:', parsed.length);
        } catch (err) {
          console.error('Error parsing localStorage notifications:', err);
          fetchNotifications();
        }
      } else {
        fetchNotifications();
      }
      
      if (savedUnreadCount) {
        setUnreadCount(parseInt(savedUnreadCount));
        if (DEBUG) console.log('📊 Loaded unreadCount from localStorage:', savedUnreadCount);
      }
      
      // Setup WebSocket listener
      setupWebSocketListener();
    }

    return () => {};
  }, [user]);

  // ✅ SAVE TO LOCALSTORAGE WHENEVER NOTIFICATIONS CHANGE
  useEffect(() => {
    if (user?.userId && notifications.length > 0) {
      localStorage.setItem(
        `notifications_${user.userId}`,
        JSON.stringify(notifications)
      );
      if (DEBUG) console.log('💾 Saved notifications to localStorage:', notifications.length);
    }
  }, [notifications, user]);

  // ✅ SAVE UNREAD COUNT TO LOCALSTORAGE
  useEffect(() => {
    if (user?.userId) {
      localStorage.setItem(`unreadCount_${user.userId}`, unreadCount.toString());
      if (DEBUG) console.log('💾 Saved unreadCount to localStorage:', unreadCount);
    }
  }, [unreadCount, user]);

  // ✅ SETUP WEBSOCKET LISTENER
  const setupWebSocketListener = () => {
    try {
      if (DEBUG) console.log('🔔 [Notification] Setting up WebSocket listener...');
      
      setWsConnected(chatApi.isConnected());
      
      // ✅ Listen for NOTIFICATION type messages from WebSocket
      chatApi.onNotification((data) => {
        if (DEBUG) console.log('📬 [Notification] Received via WebSocket:', data);
        
        const notification = {
          id: data.id || `notif-${Date.now()}`,
          userId: data.userId,
          title: data.title || data.message || 'Notification',
          content: data.content || data.description || '',
          type: data.type || 'NOTIFICATION',
          createdAt: data.createdAt || new Date().toISOString(),
          read: false  // ✅ New notifications always unread
        };
        
        // ✅ Add to top of list (instant!)
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // ✅ Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '🔔'
          });
        }
      });
      
      if (DEBUG) console.log('✅ [Notification] WebSocket listener registered');
    } catch (error) {
      console.error('❌ [Notification] Error setting up listener:', error);
    }
  };

  // ✅ REST API - Initial load + fallback
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      if (DEBUG) console.log('📬 Fetching initial notifications for userId:', user.userId);
      
      const response = await notificationApi.getNotificationByUserId(user.userId, 0, 10);
      
      console.log('🔍 NOTIFICATION API RESPONSE:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📋 Response.data:', response?.data);
      console.log('📋 Response.items:', response?.items);
      
      let notifs = [];
      if (response?.data?.items && Array.isArray(response.data.items)) {
        notifs = response.data.items;
        if (DEBUG) console.log('✅ Found notifications in response.data.items');
      } else if (response?.data && Array.isArray(response.data)) {
        notifs = response.data;
        if (DEBUG) console.log('✅ Found notifications in response.data');
      } else if (response?.items && Array.isArray(response.items)) {
        notifs = response.items;
        if (DEBUG) console.log('✅ Found notifications in response.items');
      } else if (Array.isArray(response)) {
        notifs = response;
        if (DEBUG) console.log('✅ Response is array directly');
      }
      
      if (DEBUG) console.log('📋 Total notifications found:', notifs.length);
      console.log('🎯 Notifications:', notifs);
      
      // Log refId for each notification
      notifs.forEach((notif, idx) => {
        console.log(`📌 Notification ${idx}:`, {
          id: notif.id,
          refId: notif.refId,
          type: notif.type,
          title: notif.title,
          content: notif.content
        });
      });
      
      setNotifications(notifs);
      
      // ✅ Count unread notifications
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
      if (DEBUG) console.log('📬 Unread count:', unread);
      
    } catch (error) {
      // ⚠️ Backend API has serialization bug - silently fail and use WebSocket only
      console.error('❌ ERROR fetching notifications:', error?.response?.data || error?.message);
      console.error('📋 Full error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        data: error?.response?.data,
        url: error?.config?.url,
        userId: user.userId
      });
      if (DEBUG) console.warn('⚠️ REST API unavailable (Backend bug):', error?.response?.data?.message || error?.message);
      if (DEBUG) console.log('📡 Using WebSocket-only mode for notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK AS READ - Check if ALREADY read before decreasing count
  const markAsRead = (notificationId) => {
    // ✅ Find the notification to check current read status
    const notification = notifications.find(n => n.id === notificationId);
    
    // ✅ Only decrease count if changing from unread to read
    if (notification && !notification.read) {
      if (DEBUG) console.log('✅ Marking as read for first time:', notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else if (notification && notification.read) {
      if (DEBUG) console.log('⚠️ Notification already read:', notificationId);
    }
    
    // Update notification read status
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // ✅ MARK ALL AS READ
  const markAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      
      // ✅ Get all unread notifications
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        if (DEBUG) console.log('⚠️ No unread notifications to mark');
        setMarkingAllRead(false);
        return;
      }
      
      if (DEBUG) console.log('📋 Marking all as read. Unread count:', unreadNotifications.length);
      
      // ✅ Optimistic update - mark all as read immediately
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
      if (DEBUG) console.log('✅ All notifications marked as read');
      
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  // ✅ GET NAVIGATION HANDLER
  const handleNotificationClick = (notification) => {
    if (DEBUG) console.log('👆 Notification clicked:', notification);
    
    // ✅ Mark as read FIRST (with proper logic check)
    markAsRead(notification.id);
    
    // ✅ Use refId as priority, fallback to parsing content for Post ID
    let postId = notification.refId;
    
    // ✅ If no refId, parse content for Post ID (UUID format)
    if (!postId) {
      const postIdRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
      const postIdMatch = notification.content?.match(postIdRegex);
      postId = postIdMatch ? postIdMatch[0] : null;
    }
    
    if (DEBUG) {
      console.log('🔍 Navigation analysis:');
      console.log('  - Title:', notification.title);
      console.log('  - Type:', notification.type);
      console.log('  - Content:', notification.content);
      console.log('  - refId:', notification.refId);
      console.log('  - Detected Post ID:', postId);
      console.log('  - User role:', user?.role);
    }
    
    // ✅ ROUTING LOGIC - Keep original navigation logic
    switch (notification.title?.toUpperCase()) {
      // ✅ Wallet/Balance notifications - Dynamic based on user role
      case 'ACCOUNT BALANCE':
      case 'PAYMENT RECEIVED':
      case 'PAYMENT SENT':
        if (DEBUG) console.log('💰 Navigate to wallet');
        
        // ✅ Route based on user role
        if (user?.role === 'TUTOR') {
          navigate('/wallet/tutor'); // Tutor wallet
        } else {
          navigate('/wallet/recharge'); // Student recharge wallet
        }
        setShowDropdown(false);
        break;

      // ✅ Chat/Message notifications
      case 'NEW MESSAGE':
        if (DEBUG) console.log('💬 Navigate to chat');
        navigate('/chat');
        setShowDropdown(false);
        break;

      // ✅ Bid notifications (navigate to post using refId)
      case 'BID ACCEPTED':
      case 'BID REJECTED':
        if (postId) {
          if (DEBUG) console.log('🤝 Navigate to post:', postId);
          navigate(`/posts/${postId}`);
        } else {
          navigate('/posts/my-bids');
        }
        setShowDropdown(false);
        break;

      // ✅ Review notifications
      case 'REVIEW SUBMITTED':
        if (DEBUG) console.log('⭐ Navigate to reviews');
        
        // ✅ Route based on role
        if (user?.role === 'TUTOR') {
          navigate('/reviews/received'); // Tutor sees received reviews
        } else {
          navigate('/posts/my-reviews'); // Student sees their reviews
        }
        setShowDropdown(false);
        break;

      // ✅ Report notifications
      case 'REPORT FILED':
        if (DEBUG) console.log('🚩 Navigate to reports');
        navigate('/my-reports');
        setShowDropdown(false);
        break;

      // ✅ Post notifications (navigate to post using refId)
      case 'NOTIFICATION':
      default:
        if (postId) {
          if (DEBUG) console.log('📄 Navigate to post detail:', postId);
          navigate(`/posts/${postId}`);
        } else {
          if (DEBUG) console.log('ℹ️ Generic notification - no specific navigation');
        }
        setShowDropdown(false);
        break;
    }
  };

  const getNotificationTypeInfo = (type) => {
    return NOTIFICATION_TYPES[type?.toUpperCase()] || NOTIFICATION_TYPES['DEFAULT'];
  };

  const handleDelete = (notificationId) => {
    // ✅ If notification was unread, decrease count
    const deletedNotification = notifications.find(n => n.id === notificationId);
    if (deletedNotification && !deletedNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-[#03ccba] transition-colors"
        title={wsConnected ? 'Notifications (Live 🟢)' : 'Notifications'}
      >
        <FaBell size={20} />
        
        {/* 🟢 Live Status */}
        {wsConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 flex flex-col">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-t-lg">
              <h3 className="font-bold">
                🔔 Notifications {wsConnected && <span className="text-xs ml-2">(Live 🟢)</span>}
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-white hover:opacity-70"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <FaSpinner className="animate-spin text-[#03ccba] text-2xl" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const typeInfo = getNotificationTypeInfo(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-gray-100 transition-colors group flex items-start justify-between gap-3 cursor-pointer ${
                        notification.read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0 mt-0.5">
                          {typeInfo.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className={`text-sm line-clamp-1 ${
                              notification.read 
                                ? 'font-semibold text-gray-700' 
                                : 'font-bold text-gray-900'
                            }`}>
                              {notification.title || typeInfo.label}
                            </p>
                            {/* ✅ Unread indicator */}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {notification.content || 'No message'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* ✅ Footer - Mark All as Read Button */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg">
                <button
                  onClick={markAllAsRead}
                  disabled={markingAllRead}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {markingAllRead ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Marking...
                    </>
                  ) : (
                    <>
                      <FaCheckDouble size={14} />
                      Mark All as Read ({unreadCount})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}