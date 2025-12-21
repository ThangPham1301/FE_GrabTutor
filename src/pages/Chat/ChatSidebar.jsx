// src/pages/ChatSidebar.jsx
import React, { useState, useEffect } from 'react';
import { FaComments, FaPlus, FaSearch, FaTimes, FaSpinner, FaTrash, FaClock, FaCheckCircle } from 'react-icons/fa';
import chatApi from '../../api/chatApi';
import postApi from '../../api/postApi';

const DEBUG = true;

export default function ChatSidebar({ selectedConversation, onSelectConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [postTitles, setPostTitles] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [newRoomIds, setNewRoomIds] = useState(new Set());
  const [viewedNewRooms, setViewedNewRooms] = useState(() => {
    // Load viewed new rooms from localStorage on mount
    const stored = localStorage.getItem('viewedNewRooms');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // ✅ BỎ: Polling interval - chỉ fetch 1 lần khi mount
  // WebSocket sẽ update thay đổi real-time
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm]);

  const fetchConversations = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 2000) return;
    
    try {
      setLoading(true);
      const response = await chatApi.getConversations(0, 50);
      
      if (DEBUG) console.log('📥 ChatSidebar conversations:', response);
      
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response?.items) {
        items = response.items;
      } else if (response?.data) {
        items = Array.isArray(response.data) ? response.data : [];
      }

      // ✅ Mark newly created rooms (created within last 2 minutes)
      // But only if they haven't been viewed before
      const newRooms = new Set();
      items.forEach(conv => {
        if (conv.createdAt && !viewedNewRooms.has(conv.id)) {
          const createdAt = new Date(conv.createdAt);
          const minutesAgo = Math.floor((now - createdAt.getTime()) / 60000);
          if (minutesAgo < 2) {
            newRooms.add(conv.id);
            if (DEBUG) console.log('✨ New room detected:', conv.id);
          }
        }
      });
      setNewRoomIds(newRooms);

      setConversations(items);
      setLastFetchTime(now);
      
      await fetchPostTitles(items);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostTitles = async (convs) => {
    const titles = {};
    
    for (const conv of convs) {
      if (conv.postId && !titles[conv.postId]) {
        try {
          const postResponse = await postApi.getPostById(conv.postId);
          const post = postResponse.data?.data || postResponse.data;
          titles[conv.postId] = post?.title || 'Post';
          
          if (DEBUG) console.log(`📝 Post ${conv.postId}: ${titles[conv.postId]}`);
        } catch (err) {
          // Silently handle 404 post not found errors (post may have been deleted)
          titles[conv.postId] = 'Post';
        }
      }
    }
    
    setPostTitles(titles);
  };

  const filterConversations = () => {
    const filtered = conversations.filter(conv => {
      const roomName = getRoomName(conv);
      return roomName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredConversations(filtered);
  };

  const getRoomName = (conv) => {
    if (postTitles[conv.postId]) {
      return postTitles[conv.postId];
    }
    if (conv.postTitle) {
      return conv.postTitle;
    }
    if (conv.participantName) {
      return conv.participantName;
    }
    return conv.postId ? `Post: ${conv.postId.slice(0, 8)}...` : 'Unknown';
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        setDeletingId(conversationId);
        await chatApi.deleteConversation(conversationId);
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setLastFetchTime(0);
      } catch (error) {
        alert('Failed to delete conversation');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN_PROGRESS': { icon: FaClock, color: 'bg-blue-100 text-blue-700', label: 'Active', bgColor: 'bg-blue-50' },
      'SUBMITTED': { icon: FaClock, color: 'bg-amber-100 text-amber-700', label: 'Waiting', bgColor: 'bg-amber-50' },
      'CONFIRMED': { icon: FaCheckCircle, color: 'bg-green-100 text-green-700', label: 'Confirmed', bgColor: 'bg-green-50' },
      'RESOLVED_NORMAL': { icon: FaCheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Completed', bgColor: 'bg-emerald-50' },
    };
    
    const config = statusConfig[status] || statusConfig['IN_PROGRESS'];
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </div>
    );
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ✅ Check if room is newly created (within last 2 minutes)
  const isNewRoom = (conv) => {
    if (!newRoomIds.has(conv.id)) return false;
    const createdAt = new Date(conv.createdAt);
    const now = new Date();
    const minutesAgo = Math.floor((now - createdAt) / 60000);
    return minutesAgo < 2;
  };

  // ✅ Handle room selection - mark as not new and save to localStorage
  const handleSelectConversation = (conv) => {
    onSelectConversation(conv);
    // Remove from new rooms set
    setNewRoomIds(prev => {
      const updated = new Set(prev);
      updated.delete(conv.id);
      return updated;
    });
    // Add to viewed new rooms and save to localStorage
    setViewedNewRooms(prev => {
      const updated = new Set(prev);
      updated.add(conv.id);
      localStorage.setItem('viewedNewRooms', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col shadow-sm">
      
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-teal-500 to-[#02b5a5] text-white p-4 md:p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FaComments size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Messages</h2>
              <p className="text-teal-100 text-xs font-medium">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onNewChat}
            className="p-2 md:p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm flex-shrink-0"
            title="Start new conversation"
          >
            <FaPlus size={16} className="text-teal-600" />
          </button>
        </div>

        {/* ==================== SEARCH BOX ==================== */}
        <div className="relative group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-opacity-60 text-sm" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white bg-opacity-90 text-gray-900 placeholder-gray-500 rounded-lg focus:bg-opacity-100 focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all duration-200 shadow-sm font-medium text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ==================== CONVERSATIONS LIST ==================== */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-[#03ccba] mx-auto mb-3" />
            <p className="text-gray-600 font-semibold text-sm">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-gray-900 font-bold text-base mb-1">
              {searchTerm ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600 text-xs">
              {searchTerm 
                ? 'Try a different search term'
                : 'Your conversations will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {filteredConversations.map(conv => {
              const roomName = getRoomName(conv);
              const isSelected = selectedConversation?.id === conv.id;
              const isNew = isNewRoom(conv);
              
              return (
                <div
                  key={conv.id}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
                    ${isNew && !isSelected
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 ring-2 ring-amber-300 ring-opacity-60 shadow-md'
                      : isSelected 
                      ? 'bg-white shadow-lg ring-2 ring-[#03ccba] ring-opacity-50' 
                      : 'bg-white hover:shadow-md hover:bg-gradient-to-r hover:from-white hover:to-teal-50'
                    }
                  `}
                >
                  <div className="p-3 md:p-4">
                    {/* Conversation Item */}
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0 shadow-md
                        ${isSelected 
                          ? 'bg-gradient-to-br from-[#03ccba] to-[#02b5a5]' 
                          : 'bg-gradient-to-br from-blue-400 to-cyan-400'
                        } group-hover:shadow-lg transition-shadow
                      `}>
                        {(roomName || 'U').charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title with NEW badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm md:text-base font-bold truncate line-clamp-1 md:line-clamp-2 ${isSelected ? 'text-[#03ccba]' : 'text-gray-900'}`}>
                            {roomName}
                          </h3>
                          {isNew && (
                            <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-2">
                          {getStatusBadge(conv.status)}
                        </div>

                        {/* Participant & Time */}
                        <div className="flex items-center justify-between text-xs gap-2">
                          {conv.participantName && (
                            <span className="text-gray-600 truncate">
                              with <strong>{conv.participantName}</strong>
                            </span>
                          )}
                          <p className="text-gray-500 whitespace-nowrap flex-shrink-0">
                            {getTimeAgo(conv.updatedAt)}
                          </p>
                        </div>
                      </div>


                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs font-bold text-[#03ccba] flex items-center gap-1.5">
                          <FaCheckCircle size={12} />
                          SELECTED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover Border */}
                  {!isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== FOOTER STATS ==================== */}
      {conversations.length > 0 && filteredConversations.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-3 md:p-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
            <span className="font-semibold">
              {filteredConversations.length}/{conversations.length}
            </span>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {conversations.filter(c => c.status === 'IN_PROGRESS').length} Active
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                {conversations.filter(c => c.status === 'CONFIRMED').length} Done
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}