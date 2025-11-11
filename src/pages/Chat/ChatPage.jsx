import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import chatApi from '../../api/chatApi';

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login-role');
      return;
    }

    const roomId = searchParams.get('roomId');
    if (roomId) {
      joinRoomByUrl(roomId);
    }

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user, navigate, searchParams]);

  // ✅ Cleanup WebSocket when leaving chat
  useEffect(() => {
    return () => {
      chatApi.disconnectWebSocket();
    };
  }, []);

  const joinRoomByUrl = async (roomId) => {
    try {
      setLoading(true);
      console.log('Joining room from URL:', roomId);

      const room = await chatApi.getRoomById(roomId);
      console.log('Room found:', room);

      setSelectedConversation(room);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('❌ Không thể tham gia phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#03ccba] mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tham gia phòng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hide on mobile when conversation selected */}
        {(!selectedConversation || !isMobileView) && (
          <div className={isMobileView && selectedConversation ? 'hidden' : 'w-full md:w-80'}>
            <ChatSidebar
              key={refreshKey}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onNewChat={() => setSelectedConversation(null)}
            />
          </div>
        )}

        {/* Chat Window - Show when conversation selected or on desktop */}
        {selectedConversation ? (
          <div className="flex-1">
            <ChatWindow
              conversation={selectedConversation}
              onClose={() => setSelectedConversation(null)}
              onRefresh={handleRefresh}
            />
          </div>
        ) : (
          !isMobileView && (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chưa chọn cuộc trò chuyện</h2>
                <p className="text-gray-600 text-lg">
                  Chọn cuộc trò chuyện hoặc chờ thông báo mới
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}