// src/pages/ChatSidebar.jsx
import React, { useState, useEffect } from 'react';
import { FaComments, FaPlus, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import chatApi from '../../api/chatApi';

export default function ChatSidebar({ selectedConversation, onSelectConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ REMOVE THIS - onUpdate không cần
  // useEffect(() => {
  //   const handleUpdate = () => {
  //     fetchConversations();
  //   };
  //   chatApi.onUpdate(handleUpdate);
  //   return () => {};
  // }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm]);

  const fetchConversations = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 2000) return;

    try {
      setLoading(true);
      console.log('🏠 [Sidebar] Fetching conversations...');
      
      const rooms = await chatApi.getConversations();
      
      console.log('✅ [Sidebar] Conversations loaded:', rooms?.length);
      setConversations(Array.isArray(rooms) ? rooms : []);
      setLastFetchTime(now);
    } catch (error) {
      console.error('❌ [Sidebar] Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const filtered = conversations.filter(conv =>
      (conv.participantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.postTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?')) {
      try {
        await chatApi.deleteConversation(conversationId);
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setLastFetchTime(Date.now());
      } catch (error) {
        alert('Không thể xóa cuộc trò chuyện');
      }
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <FaComments className="text-[#03ccba]" /> Tin nhắn
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#03ccba]"
            title="Cuộc trò chuyện mới"
          >
            <FaPlus />
          </button>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#03ccba]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-2xl text-[#03ccba] mx-auto mb-2" />
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">Chưa có cuộc trò chuyện</p>
            <p className="text-xs mt-2">Nhận một đặt cọc để bắt đầu trò chuyện</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map(conv => (
              <div key={conv.id} className="relative">
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-50 flex items-start justify-between gap-3 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-[#03ccba]' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(conv.participantName || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.participantName || 'Không xác định'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {conv.postTitle || 'N/A'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0 z-10"
                  title="Xóa"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}