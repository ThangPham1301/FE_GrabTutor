// src/pages/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chatApi from '../../api/chatApi';
import { 
  FaArrowLeft, FaSpinner, FaTrash, FaPaperPlane, FaEllipsisV, FaPaperclip, 
  FaTimes, FaFileAlt, FaImage, FaDownload, FaCheckCircle, FaClock, FaCheck,
  FaPhone, FaEnvelope, FaUser
} from 'react-icons/fa';

const DEBUG = true;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ Helper function - Check if file is image
const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export default function ChatWindow({ conversation, onClose, onRefresh }) {
  const { user } = useAuth();
  
  // ==================== STATE ====================
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // ✅ Room Status Management
  const [roomStatus, setRoomStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // ✅ Image modal
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!conversation?.id) return;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        await checkRoomStatus();
        
        if (!chatApi.isConnected()) {
          setError('Đang kết nối WebSocket...');
          return;
        }

        await chatApi.joinRoom(conversation.id);
        await fetchMessages();
        setWsConnected(true);

      } catch (err) {
        console.error('❌ Init error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [conversation?.id]);

  // ✅ WebSocket listener for instant messages
  useEffect(() => {
    if (!conversation?.id) return;

    const handleNewMessage = (event) => {
      const msgData = event?.data || event;
      
      if (msgData?.roomId !== conversation.id) return;

      if (DEBUG) console.log('✅ [WS] New message:', msgData);

      setMessages(prev => {
        const exists = prev.some(m => m.id === msgData.id);
        if (exists) return prev;
        
        return [...prev, {
          id: msgData.id,
          userId: msgData.userId,
          email: msgData.email,
          message: msgData.message || msgData.content,
          fileName: msgData.fileName,
          fileUrl: msgData.fileUrl,
          createdAt: msgData.createdAt || new Date().toISOString()
        }];
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    if (chatApi.onMessage) {
      chatApi.onMessage(handleNewMessage);
    }

    return () => {};
  }, [conversation?.id]);

  // ✅ Polling every 2 seconds
  useEffect(() => {
    if (!conversation?.id) return;

    const pollInterval = setInterval(async () => {
      await fetchMessages();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [conversation?.id]);

  // ✅ Timer countdown
  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0 && roomStatus === 'IN_PROGRESS') {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, roomStatus]);

  // ==================== API CALLS ====================
  
  const checkRoomStatus = async () => {
    try {
      const room = await chatApi.getRoomById(conversation.id);
      setRoomStatus(room?.status || 'IN_PROGRESS');

      if (room?.status === 'IN_PROGRESS' && room?.createdAt) {
        const createdTime = new Date(room.createdAt).getTime();
        const elapsedTime = Date.now() - createdTime;
        const remainingMs = (5 * 60 * 1000) - elapsedTime;

        if (remainingMs > 0) {
          setRemainingTime(Math.ceil(remainingMs / 1000));
        }
      }
    } catch (err) {
      console.error('❌ Error checking room status:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      if (DEBUG) console.log('📥 [FETCH] Fetching messages...');
      
      const result = await chatApi.getMessages(conversation.id);
      const messageList = Array.isArray(result) ? result : [];
      
      setMessages(prev => {
        if (prev.length === messageList.length) {
          if (prev.length > 0 && messageList.length > 0) {
            const prevLast = prev[prev.length - 1];
            const currLast = messageList[messageList.length - 1];
            if (prevLast.id === currLast.id) {
              return prev;
            }
          }
        }
        return messageList;
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);

    } catch (err) {
      console.error('❌ [FETCH] Error:', err);
    }
  };

  const handleTutorSubmit = async () => {
    if (!window.confirm('Bạn có chắc chắn sẵn sàng giúp học sinh này không?')) return;

    try {
      setIsSubmitting(true);
      await chatApi.submitSolution(conversation.id);
      alert('✅ Xác nhận thành công! Chờ học sinh phê duyệt...');
      
      setRoomStatus('SUBMITTED');
      await checkRoomStatus();
    } catch (err) {
      console.error('❌ Error submitting:', err);
      alert('❌ Lỗi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentConfirm = async () => {
    if (!window.confirm('Xác nhận gia sư này và cho phép bắt đầu chat?')) return;

    try {
      setIsConfirming(true);
      await chatApi.confirmSolution(conversation.id);
      alert('✅ Phê duyệt thành công! Bạn có thể chat bây giờ.');
      
      setRoomStatus('CONFIRMED');
      await checkRoomStatus();
    } catch (err) {
      console.error('❌ Error confirming:', err);
      alert('❌ Lỗi: ' + err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  // ==================== SEND MESSAGE ====================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setSending(true);
      setError(null);

      const messageData = {
        userId: user?.userId,
        message: newMessage || '',
        content: newMessage || '',
        roomId: conversation.id
      };

      if (selectedFile) {
        messageData.file = selectedFile;
      }

      await chatApi.sendMessage(conversation.id, messageData);

      setNewMessage('');
      clearFile();

      setTimeout(async () => {
        await fetchMessages();
      }, 100);

      onRefresh?.();

    } catch (error) {
      console.error('❌ [SEND] Error:', error);
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
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File phải nhỏ hơn 5MB');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  if (!conversation) return null;

  // ==================== RENDER ====================
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 h-full">
      
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <FaArrowLeft size={20} />
          </button>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
              {(conversation.participantName || 'U').charAt(0).toUpperCase()
            }</div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FaUser size={14} />
                {conversation.participantName || 'Tutor'}
              </h2>
              <p className="text-xs text-teal-100 flex items-center gap-1">
                <FaEnvelope size={12} />
                {conversation.participantEmail || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
          roomStatus === 'CONFIRMED' ? 'bg-green-500 text-white' :
          roomStatus === 'SUBMITTED' ? 'bg-blue-500 text-white' :
          roomStatus === 'IN_PROGRESS' ? 'bg-yellow-500 text-white' :
          'bg-gray-500 text-white'
        }`}>
          {roomStatus === 'CONFIRMED' && <FaCheckCircle size={14} />}
          {roomStatus === 'SUBMITTED' && <FaClock size={14} />}
          {roomStatus === 'IN_PROGRESS' && <FaClock size={14} />}
          <span>{roomStatus || 'Loading'}</span>
        </div>
      </div>

      {/* ==================== STATUS BAR ==================== */}
      {roomStatus && roomStatus !== 'CONFIRMED' && (
        <div className={`px-4 py-3 text-sm font-semibold flex items-center justify-between ${
          roomStatus === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-800 border-b border-yellow-200' :
          roomStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-800 border-b border-blue-200' :
          'bg-gray-50 text-gray-800 border-b border-gray-200'
        }`}>
          <span>
            {roomStatus === 'IN_PROGRESS' 
              ? '⏳ Vui lòng chờ gia sư xác nhận' 
              : roomStatus === 'SUBMITTED' 
              ? '⏳ Vui lòng phê duyệt gia sư để bắt đầu chat'
              : ''}
          </span>

          {roomStatus === 'IN_PROGRESS' && remainingTime !== null && (
            <span className="text-xs">
              Hết hạn trong: <span className="font-bold text-red-600">
                {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
              </span>
            </span>
          )}

          {user?.role === 'TUTOR' && roomStatus === 'IN_PROGRESS' && (
            <button
              onClick={handleTutorSubmit}
              disabled={isSubmitting}
              className="ml-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-bold flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  <span>Xác nhận...</span>
                </>
              ) : (
                <>
                  <FaCheck size={14} />
                  <span>Xác nhận sẵn sàng</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ==================== SUBMITTED STATUS ==================== */}
      {roomStatus === 'SUBMITTED' && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 text-lg" />
            <span className="text-sm font-semibold text-blue-800">
              ✅ Gia sư đã xác nhận sẵn sàng! Phê duyệt để bắt đầu chat.
            </span>
          </div>

          {user?.role === 'USER' && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleStudentConfirm}
                disabled={isConfirming}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold flex items-center gap-2 whitespace-nowrap transition-all"
              >
                {isConfirming ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Phê duyệt...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={14} />
                    <span>Phê duyệt</span>
                  </>
                )}
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 whitespace-nowrap transition-all"
              >
                <FaTimes size={14} />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== MESSAGES ==================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isOwnMessage = msg.userId === user?.userId;
          const isImage = msg.fileUrl && isImageFile(msg.fileName);

          return (
            <div key={idx} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-sm ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {!isOwnMessage && (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {(conversation.participantName || 'T').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Sender Info */}
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-600 font-semibold mb-1 px-2">
                      {msg.email || 'Tutor'}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none shadow-md'
                  }`}>
                    {/* Text Message */}
                    {msg.message && (
                      <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                    )}

                    {/* ✅ Image Display */}
                    {isImage && (
                      <div className="mt-2">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName}
                          className="max-w-xs h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage(msg.fileUrl)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* File Download */}
                    {msg.fileUrl && !isImage && (
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm mt-2 flex items-center gap-2 hover:underline ${
                          isOwnMessage ? 'text-white' : 'text-[#03ccba]'
                        }`}
                      >
                        <FaDownload size={12} />
                        📎 {msg.fileName || 'Download File'}
                      </a>
                    )}
                  </div>

                  {/* Time */}
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>

                {/* Own User Avatar */}
                {isOwnMessage && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {(user?.fullName || 'Y').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ==================== INPUT ==================== */}
      {roomStatus === 'CONFIRMED' ? (
        <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 sticky bottom-0 shadow-lg">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || !wsConnected}
              className="p-2 rounded-lg bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white hover:shadow-lg disabled:opacity-50 transition-all"
            >
              <FaPaperclip size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={sending || !wsConnected}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 transition-all"
            />

            <button
              type="submit"
              disabled={sending || !wsConnected || (!newMessage.trim() && !selectedFile)}
              className="p-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {sending ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
            </button>
          </div>

          {filePreview && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between border-l-4 border-[#03ccba]">
              <div className="flex items-center gap-2">
                {filePreview.startsWith('data:image') ? (
                  <>
                    <FaImage className="text-[#03ccba] text-lg" />
                    <span className="text-sm font-semibold text-gray-700">🖼️ Image Preview</span>
                  </>
                ) : (
                  <>
                    <FaFileAlt className="text-[#03ccba] text-lg" />
                    <span className="text-sm font-semibold text-gray-700">{selectedFile?.name}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 hover:bg-red-200 rounded transition-colors text-red-600"
              >
                <FaTimes size={16} />
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="bg-gray-200 border-t border-gray-300 p-4 text-center text-gray-700 font-semibold">
          🔒 Chat sẽ được bật khi cả hai bên xác nhận
        </div>
      )}

      {/* ==================== IMAGE MODAL ==================== */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-screen object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg"
            >
              <FaTimes size={24} className="text-gray-900" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}