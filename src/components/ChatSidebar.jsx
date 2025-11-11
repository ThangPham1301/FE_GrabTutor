import React, { useState, useEffect } from 'react';
import { FaComments, FaPlus, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import chatApi from '../api/chatApi';

export default function ChatSidebar({ selectedConversation, onSelectConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0); // ✅ Track last fetch

  useEffect(() => {
    fetchConversations();
    
    // ✅ Optimize: Poll mỗi 10 giây thay vì 5 giây
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm]);

  // ✅ Optimize: Skip if last fetch was within 2 seconds
  const fetchConversations = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      return; // Skip if fetched recently
    }

    try {
      setLoading(true);
      const items = await chatApi.getConversations(0, 50);
      
      if (!items || items.length === 0) {
        setConversations([]);
        return;
      }

      // ✅ Sort by newest first
      items.sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || a.createdAt || 0);
        const dateB = new Date(b.lastMessage?.createdAt || b.createdAt || 0);
        return dateB - dateA;
      });

      setConversations(items);
      setLastFetchTime(now); // ✅ Update last fetch time
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;
    
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        (conv.participantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.postTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredConversations(filtered);
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?')) {
      try {
        await chatApi.deleteConversation(conversationId);
        
        // Remove from list
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setLastFetchTime(Date.now()); // ✅ Update fetch time
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('❌ Không thể xóa cuộc trò chuyện');
      }
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
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

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Tìm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:border-[#03ccba] outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-[#03ccba] text-2xl" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaComments className="text-3xl mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Chưa có cuộc trò chuyện</p>
            <p className="text-xs mt-2">Nhận một đặt cọc để bắt đầu trò chuyện</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map(conv => (
              <div key={conv.id} className="relative">
                {/* ✅ FIX: Separate button for selection */}
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-50 flex items-start justify-between gap-3 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-[#03ccba]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(conv.participantName || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.participantName || 'Không xác định'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {conv.postTitle || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conv.lastMessage?.createdAt 
                        ? new Date(conv.lastMessage.createdAt).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Vừa xong'
                      }
                    </p>
                  </div>
                </button>

                {/* ✅ FIX: Delete Button - OUTSIDE parent button, positioned absolutely */}
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