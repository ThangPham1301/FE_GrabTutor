// src/pages/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaSpinner, FaPaperPlane, FaPaperclip, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import chatApi from '../../api/chatApi';

const DEBUG = true;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ChatWindow({ conversation, onClose, onRefresh }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ================== LOAD LỊCH SỬ ==================
  const fetchMessages = async () => {
    try {
      const result = await chatApi.getMessages(conversation.id);
      const messageList = Array.isArray(result) ? result : [];
      setMessages(messageList);
    } catch (err) {
      console.error('fetchMessages ERROR:', err);
      setMessages([]);
    }
  };

  // ================== INIT ==================
  useEffect(() => {
    if (!conversation?.id) return;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!chatApi.isConnected()) {
          setError('Đang kết nối WebSocket...');
          return;
        }

        await chatApi.joinRoom(conversation.id);
        await fetchMessages();

        // ✅ DIRECT WebSocket handler - NOT through chatApi.onMessage callback
        const ws = chatApi.getGlobalConnection();
        if (ws) {
          ws.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              
              if (DEBUG) {
                console.log('📨 [ChatWindow] Received:', msg.type);
                console.log('   - RoomId match:', msg.roomId === conversation.id);
                console.log('   - Message:', msg.message?.substring(0, 30));
              }

              // ✅ Display any MESSAGE for this room
              if (msg?.type === 'MESSAGE' && msg.roomId === conversation.id) {
                setMessages(prev => {
                  // Avoid duplicates
                  if (prev.some(m => m.id === msg.id)) return prev;
                  
                  if (DEBUG) console.log('✅ [ChatWindow] Adding message to state:', msg.message);
                  return [...prev, msg];
                });
              }
            } catch (err) {
              console.error('❌ [ChatWindow] Parse error:', err);
            }
          };
        }

        setWsConnected(true);
      } catch (err) {
        setError('Không thể tham gia phòng');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      // Cleanup
    };
  }, [conversation?.id]);

  // ================== SCROLL ==================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ================== GỬI TIN NHẮN ==================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    if (!wsConnected || sending) return;

    try {
      setSending(true);
      setError(null);

      // ✅ Build message data - Match script.js format
      let messageData = { 
        userId: user?.userId,  // ✅ Add userId
        message: newMessage || '',
        content: newMessage || ''  // Keep for compatibility
      };

      if (selectedFile) {
        messageData.file = selectedFile;
      }

      if (DEBUG) {
        console.log('📤 [ChatWindow] Sending message:');
        console.log('   - UserId:', messageData.userId);
        console.log('   - Message:', messageData.message.substring(0, 30));
        console.log('   - Has file:', !!selectedFile);
      }
      
      await chatApi.sendMessage(conversation.id, messageData);
      
      if (DEBUG) console.log('✅ [ChatWindow] Message sent successfully');
      setNewMessage('');
      clearFile();
      onRefresh?.();
    } catch (error) {
      console.error('❌ [ChatWindow] Error sending message:', error);
      setError('❌ Không thể gửi tin nhắn: ' + (error.message || 'Unknown error'));
      setWsConnected(false);
    } finally {
      setSending(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File phải nhỏ hơn 5MB');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  const getInitials = (name) => {
    return (name || 'U').substring(0, 2).toUpperCase();
  };

  // ================== RENDER ==================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#c97a3a] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#faf6f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#d4c4b0] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="md:hidden text-[#c97a3a]">
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-[#3d2817]">{conversation.participantName || 'Phòng chat'}</h3>
            <p className="text-sm text-[#6b5344]">{conversation.postTitle || 'Không có tiêu đề'}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 text-sm text-center border-b border-red-200">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          // ✅ FIX: Dùng user.userId thay vì user.id
          const isOwn = msg.userId === user?.userId;
          const initials = getInitials(conversation.participantName);
          const time = formatTime(msg.createdAt);

          console.log('📊 Message Check:', {
            msgUserId: msg.userId,
            currentUserId: user?.userId,
            isOwn: isOwn,
            messageContent: msg.message?.substring(0, 20)
          });

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {/* Avatar - chỉ hiển thị khi không phải của mình */}
              {!isOwn && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c97a3a] to-[#b86a2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-xs md:max-w-md ${isOwn ? 'order-2' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isOwn
                      ? 'bg-[#c97a3a] text-white rounded-br-none'  // ← Màu của bạn
                      : 'bg-[#e8dcc8] text-[#3d2817] rounded-bl-none'  // ← Màu người khác
                  }`}
                >
                  {msg.message && (
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                  )}

                  {msg.fileUrl && (
                    <div className="mt-2">
                      {msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName}
                          className="max-w-full h-auto rounded-lg cursor-pointer shadow-sm"
                          onClick={() => window.open(msg.fileUrl, '_blank')}
                        />
                      ) : (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline text-blue-600 flex items-center gap-1"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-xs mt-1 ${isOwn ? 'text-[#ffffffaa]' : 'text-[#6b5344]'}`}>
                    {time}
                  </p>
                </div>
              </div>

              {/* Avatar - chỉ hiển thị khi là của mình */}
              {isOwn && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c97a3a] to-[#b86a2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(user?.name || 'Me')}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 pb-2">
          <div className="bg-white rounded-lg p-3 border border-[#d4c4b0] flex items-center gap-3">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">File</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3d2817] truncate">{selectedFile.name}</p>
              <p className="text-xs text-[#6b5344]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={clearFile}
              className="text-[#c97a3a] hover:text-[#b86a2a]"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#d4c4b0]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-lg border border-[#d4c4b0] flex items-center justify-center text-[#c97a3a] hover:bg-[#f0e6d8] transition"
          >
            <FaPaperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-[#d4c4b0] rounded-lg text-sm focus:outline-none focus:border-[#c97a3a] focus:ring-2 focus:ring-[#c97a3a]/20"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-10 h-10 rounded-lg bg-[#c97a3a] text-white flex items-center justify-center hover:bg-[#b86a2a] transition disabled:opacity-50"
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}