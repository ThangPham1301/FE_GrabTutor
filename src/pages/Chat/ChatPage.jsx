// src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import chatApi from '../../api/chatApi';
import { useAuth } from '../../contexts/AuthContext';

const DEBUG = true;

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // State
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CHỈ CONNECT 1 LẦN Ở ĐÂY
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!user) {
          console.warn('⚠️ User not authenticated');
          navigate('/login-role');
          return;
        }

        if (DEBUG) console.log('🔌 Initializing WebSocket...');
        
        // ✅ Only connect if not already connected
        if (!chatApi.isConnected()) {
          await chatApi.connectWebSocket();
          console.log('✅ WebSocket connected');
        } else {
          console.log('✅ WebSocket already connected, reusing...');
        }
        
        setConnected(true);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to connect:', err);
        setError('Không thể kết nối đến server chat');
        setConnected(false);
      }
    };

    initializeChat();

    return () => {
      // Don't disconnect on unmount - keep connection alive
      // chatApi.disconnectWebSocket();
    };
  }, [user, navigate]);

  // ==================== HANDLERS ====================
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewChat = () => {
    alert('Start a new chat feature - Coming soon!');
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#03ccba] border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kết nối...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {error && (
        <div className="bg-red-100 border-b-2 border-red-500 p-3 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-semibold text-gray-700">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button onClick={() => navigate('/profile')} className="text-sm text-[#03ccba] hover:underline">
          Back to Profile
        </button>
      </div>

      {/* ==================== MAIN CHAT CONTAINER ==================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar - Hidden on mobile when chat is open */}
        {(!isMobileView || !selectedConversation) && (
          <div className="w-full md:w-96 border-r border-gray-200 overflow-hidden flex flex-col">
            <ChatSidebar
              key={refreshKey}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />
          </div>
        )}

        {/* Chat Window - Hidden on mobile when no chat selected */}
        {(!isMobileView || selectedConversation) && selectedConversation ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow
              key={selectedConversation.id}
              conversation={selectedConversation}
              onClose={handleCloseChat}
              onRefresh={handleRefresh}
            />
          </div>
        ) : !isMobileView && !selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-5xl">💬</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select a Conversation</h2>
              <p className="text-gray-600 text-lg">Choose a chat to get started</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}