import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaTimes } from 'react-icons/fa';
import chatApi from '../api/chatApi';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [shownRoomIds, setShownRoomIds] = useState(new Set());

  // ✅ Lắng nghe thông báo mới
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Lấy danh sách rooms
        const rooms = await chatApi.getConversations();
        
        if (!rooms || rooms.length === 0) return;

        // Tìm room mới (vừa được tạo trong 2 phút)
        const newRooms = rooms.filter(r => {
          const createdTime = new Date(r.createdAt);
          const now = new Date();
          const diffInMs = now - createdTime;
          const diffInMinutes = diffInMs / (1000 * 60);
          
          // Chỉ show thông báo nếu room được tạo trong 2 phút gần đây
          return diffInMinutes < 2 && !shownRoomIds.has(r.id);
        });

        // Nếu có room mới, hiển thị thông báo
        if (newRooms.length > 0) {
          newRooms.forEach(room => {
            showNotification(room);
            // Mark room as shown to avoid duplicate notifications
            setShownRoomIds(prev => new Set([...prev, room.id]));
          });
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // ✅ Check mỗi 3 giây
    const interval = setInterval(checkNotifications, 3000);
    
    // Check ngay khi component mount
    checkNotifications();
    
    return () => clearInterval(interval);
  }, [shownRoomIds]);

  const showNotification = (room) => {
    console.log('🔔 New notification for room:', room.id);
    
    const notification = {
      id: room.id,
      message: `💬 Cuộc trò chuyện mới từ ${room.participantName || 'Người dùng'}`,
      roomId: room.id,
      postTitle: room.postTitle,
      participantName: room.participantName,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // ✅ Auto-remove sau 8 giây
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 8000);
  };

  const handleJoinRoom = (roomId) => {
    console.log('Joining room:', roomId);
    dismissNotification(roomId);
    // ✅ Navigate với roomId param
    navigate(`/chat?roomId=${roomId}`);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white px-6 py-4 rounded-lg shadow-2xl flex items-start justify-between gap-4 animate-slide-in"
        >
          <div className="flex items-start gap-3 flex-1">
            <FaBell className="text-lg flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{notif.message}</p>
              {notif.postTitle && (
                <p className="text-xs text-teal-100 mt-1">
                  📚 {notif.postTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleJoinRoom(notif.roomId)}
              className="bg-white text-[#03ccba] px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
            >
              Vào đây
            </button>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-white hover:text-teal-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}