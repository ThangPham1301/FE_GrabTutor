// src/pages/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chatApi from '../../api/chatApi';
import reportApi from '../../api/reportApi';
import { 
  FaArrowLeft, FaSpinner, FaTrash, FaPaperPlane, FaEllipsisV, FaPaperclip, 
  FaTimes, FaFileAlt, FaImage, FaDownload, FaCheckCircle, FaClock, FaCheck,
  FaPhone, FaEnvelope, FaUser, FaFlag, FaStar, FaSmile, FaChevronDown,
  FaExclamationCircle, FaComments  // ✅ THÊM FaComments ở đây
} from 'react-icons/fa';
import ReviewFormModal from '../../components/ReviewFormModal';

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
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [roomStatus, setRoomStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [room, setRoom] = useState(null);
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDetail, setReportDetail] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!conversation?.id) return;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Check room status
        await checkRoomStatus();
        
        if (!chatApi.isConnected()) {
          setError('Connecting to chat...');
          return;
        }
        
        // ✅ Lấy message history từ server
        const historyMessages = await chatApi.getMessages(conversation.id, 0, 100);
        if (DEBUG) {
          console.log('📩 [Init] Loaded message history:', historyMessages.length);
          console.log('📩 [Init] Messages with isDeleted:', historyMessages.filter(m => m.isDeleted));
          console.log('📩 [Init] All messages:', historyMessages);
          console.log('📩 [Init] Check if backend returned deleted messages:');
          historyMessages.forEach(msg => {
            if (msg.message === '(tin nhắn đã gỡ)' || msg.isDeleted) {
              console.log(`   ✓ Found deleted message: id=${msg.id}, isDeleted=${msg.isDeleted}, message=${msg.message}`);
            }
          });
        }
        if (historyMessages && historyMessages.length > 0) {
          setMessages(historyMessages);
        }
        
        // ✅ Join room để receive real-time messages
        await chatApi.joinRoom(conversation.id);
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

  // WebSocket listener
  useEffect(() => {
    if (!conversation?.id || !wsConnected) return;

    const handleNewMessage = (event) => {
      const msgData = event?.data || event;
      
      if (msgData?.roomId !== conversation.id) return;

      // ✅ Handle message deleted event (check both 'isDeleted' and 'deleted')
      if (msgData?.type === 'MESSAGE_DELETED' || msgData?.isDeleted || msgData?.deleted) {
        if (DEBUG) console.log('🗑️ [WS] Message deleted:', msgData.id, { isDeleted: msgData.isDeleted, deleted: msgData.deleted });
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === msgData.id
              ? {
                  ...msg,
                  message: '(tin nhắn đã gỡ)',
                  fileUrl: null,
                  fileName: null,
                  isDeleted: true
                }
              : msg
          )
        );
        return;
      }

      // ✅ Handle message updated event
      if (msgData?.type === 'MESSAGE_UPDATED') {
        if (DEBUG) console.log('✏️ [WS] Message updated:', msgData.id);
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === msgData.id
              ? {
                  ...msg,
                  message: msgData.message,
                  isEdited: true
                }
              : msg
          )
        );
        return;
      }

      if (DEBUG) console.log('✅ [WS] New message:', msgData);

      setMessages(prev => {
        const exists = prev.some(m => m.id === msgData.id);
        if (exists) return prev;
        
        const newMsg = {
          id: msgData.id,
          userId: msgData.userId,
          email: msgData.email,
          message: msgData.message || msgData.content,
          fileName: msgData.fileName,
          fileUrl: msgData.fileUrl,
          isDeleted: msgData.isDeleted || false,
          isEdited: msgData.isEdited || false,
          createdAt: msgData.createdAt || new Date().toISOString()
        };
        
        if (DEBUG) console.log('➕ Adding message to state:', newMsg);
        return [...prev, newMsg];
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    if (chatApi.onMessage) {
      chatApi.onMessage(handleNewMessage);
    }

    return () => {};
  }, [conversation?.id, wsConnected]);

  // ✅ BỎ: Polling interval - chỉ dùng WebSocket real-time

  useEffect(() => {
    if (!room) return;

    const calculateRemainingTime = () => {
      let referenceTime = null;

      if (room.status === 'IN_PROGRESS' && room.createdAt) {
        referenceTime = new Date(room.createdAt).getTime();
        const elapsedTime = Date.now() - referenceTime;
        const remainingMs = (15 * 60 * 1000) - elapsedTime;
        
        if (remainingMs > 0) {
          setRemainingTime(Math.ceil(remainingMs / 1000));
        } else {
          setRemainingTime(0);
        }
      }
      
      if (room.status === 'SUBMITTED' && room.updatedAt) {
        referenceTime = new Date(room.updatedAt).getTime();
        const elapsedTime = Date.now() - referenceTime;
        const remainingMs = (15 * 60 * 1000) - elapsedTime;
        
        if (remainingMs > 0) {
          setRemainingTime(Math.ceil(remainingMs / 1000));
        } else {
          setRemainingTime(0);
        }
      }
      
      if (room.status === 'CONFIRMED') {
        setRemainingTime(null);
      }
    };

    calculateRemainingTime();

    const timerInterval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(timerInterval);
  }, [room?.status, room?.createdAt, room?.updatedAt, room?.id]);

  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0 && (roomStatus === 'IN_PROGRESS' || roomStatus === 'SUBMITTED')) {
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
      const roomData = await chatApi.getRoomById(conversation.id);
      if (DEBUG) console.log('📊 Room status:', roomData?.status);
      
      setRoom(roomData);
      setRoomStatus(roomData?.status || 'IN_PROGRESS');
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
          return prev;
        }
        if (prev.length > 0 && messageList.length > 0) {
          const prevLast = prev[prev.length - 1];
          const currLast = messageList[messageList.length - 1];
          if (prevLast.id === currLast.id) {
            return prev;
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
    if (!window.confirm('Are you sure you want to submit this lesson?')) return;

    try {
      setIsSubmitting(true);
      await chatApi.submitSolution(conversation.id);
      alert('✅ Submitted successfully!');
      
      setRoomStatus('SUBMITTED');
      setRemainingTime(15 * 60);
      
      await checkRoomStatus();
    } catch (err) {
      console.error('Submit error:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this lesson is completed?')) return;

    try {
      setIsConfirming(true);
      await chatApi.confirmSolution(conversation.id);
      alert('✅ Confirmed!');
      
      setRoomStatus('CONFIRMED');
      setRemainingTime(null);
      
      await checkRoomStatus();
      onRefresh?.();
    } catch (err) {
      console.error('Confirm error:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!reportDetail.trim()) {
      setReportError('Please enter report details');
      return;
    }

    try {
      setReportSubmitting(true);
      setReportError(null);

      await reportApi.createReport(conversation.postId, {
        detail: reportDetail
      });

      alert('✅ Report submitted!');
      
      setShowReportForm(false);
      setReportDetail('');
      onRefresh?.();
    } catch (err) {
      console.error('Error submitting report:', err);
      setReportError('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setReportSubmitting(false);
    }
  };

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
      onRefresh?.();

    } catch (error) {
      console.error('Send message error:', error);
      setError('❌ Failed to send message');
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
      alert('File must be smaller than 5MB');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? It will show as "tin nhắn đã gỡ" for both users.')) {
      return;
    }

    try {
      setDeletingMessageId(messageId);
      if (DEBUG) console.log('🗑️ [Frontend] Deleting message:', messageId);

      const deleteResponse = await chatApi.deleteMessage(conversation.id, messageId);
      if (DEBUG) {
        console.log('✅ [Frontend] Delete API response:', deleteResponse);
        console.log('📊 [Frontend] Check if message was deleted on backend:');
        console.log('   - Has isDeleted in response?', 'isDeleted' in deleteResponse);
        console.log('   - Response keys:', Object.keys(deleteResponse || {}));
      }

      // ✅ Update local state to show "tin nhắn đã gỡ"
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                message: '(tin nhắn đã gỡ)',
                fileUrl: null,
                fileName: null,
                isDeleted: true
              }
            : msg
        )
      );

      if (DEBUG) console.log('✅ [Frontend] Message marked as deleted in local state');
      alert('✅ Tin nhắn đã bị gỡ');
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('❌ Error deleting message: ' + (err?.message || 'Please try again'));
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setHoveredMessageId(null);
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim()) {
      alert('Message cannot be empty');
      return;
    }

    if (editingText === messages.find(m => m.id === messageId)?.message) {
      setEditingMessageId(null);
      return;
    }

    try {
      setEditingSubmitting(true);
      if (DEBUG) console.log('✏️ Editing message:', messageId);

      // ✅ Call API to update message
      await chatApi.updateMessage(messageId, editingText);

      // ✅ Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, message: editingText, isEdited: true }
            : msg
        )
      );

      if (DEBUG) console.log('✅ Message edited successfully');
      setEditingMessageId(null);
      setEditingText('');
      alert('✅ Tin nhắn đã được sửa');
    } catch (err) {
      console.error('Error editing message:', err);
      alert('❌ Lỗi khi sửa: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  if (!conversation) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading chat...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 h-full overflow-hidden">
      
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4 md:p-5 flex items-center justify-between shadow-lg sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={onClose} 
            className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
          >
            <FaArrowLeft size={20} />
          </button>
          
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0">
            {(conversation.participantName || 'U').charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base md:text-lg truncate">
              {conversation.participantName || 'Tutor'}
            </h2>
            <p className="text-xs text-teal-100 flex items-center gap-1 truncate">
              <FaEnvelope size={12} />
              {conversation.participantEmail || 'N/A'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${
          roomStatus === 'CONFIRMED' ? 'bg-green-500 text-white' :
          roomStatus === 'SUBMITTED' ? 'bg-blue-500 text-white' :
          roomStatus === 'IN_PROGRESS' ? 'bg-yellow-500 text-white' :
          'bg-gray-500 text-white'
        }`}>
          {roomStatus === 'CONFIRMED' && <FaCheckCircle size={14} />}
          {roomStatus === 'SUBMITTED' && <FaClock size={14} />}
          {roomStatus === 'IN_PROGRESS' && <FaClock size={14} />}
          <span className="hidden sm:inline">{roomStatus || 'Loading'}</span>
        </div>

        {/* More Options */}
        <div className="relative ml-2 md:ml-3 flex-shrink-0">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FaEllipsisV size={16} />
          </button>

          {showMoreOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <button
                onClick={() => {
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100 text-sm"
              >
                <FaTrash size={14} className="text-red-600" />
                <span className="font-semibold">Delete Chat</span>
              </button>
              <button
                onClick={() => {
                  setShowReportForm(true);
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
              >
                <FaFlag size={14} className="text-red-600" />
                <span className="font-semibold">Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-red-100 border-b-2 border-red-500 text-red-700 text-sm font-semibold flex items-center gap-2 flex-shrink-0">
          <FaExclamationCircle size={16} />
          {error}
        </div>
      )}

      {/* ============ STATUS BAR ============ */}
      {roomStatus && roomStatus !== 'CONFIRMED' && (
        <div className={`px-4 py-3 text-sm font-semibold flex items-center justify-between border-b ${
          roomStatus === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          roomStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
          'bg-gray-50 text-gray-800 border-gray-200'
        }`}>
          <span>
            {roomStatus === 'IN_PROGRESS' 
              ? '⏳ Tutor is preparing the lesson' 
              : roomStatus === 'SUBMITTED' 
              ? '⏳ Please approve the tutor to start chat'
              : ''}
          </span>

          {remainingTime !== null && (
            <span className="text-xs font-bold text-red-600">
              {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      )}

      {/* ============ TUTOR SUBMIT BUTTON ============ */}
      {roomStatus === 'IN_PROGRESS' && user?.role === 'TUTOR' && remainingTime !== null && (
        <div className="px-4 py-3 bg-teal-50 border-b border-teal-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaClock className="text-teal-600 text-lg" />
            <span className="text-sm font-semibold text-teal-800">
              ⏱️ You have {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')} to submit
            </span>
          </div>

          <button
            onClick={handleTutorSubmit}
            disabled={isSubmitting || remainingTime <= 0}
            className={`ml-4 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              remainingTime > 0 
                ? 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50' 
                : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" size={14} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FaCheckCircle size={14} />
                <span>✅ Submit</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ============ CONFIRM + REPORT BUTTONS ============ */}
      {roomStatus === 'SUBMITTED' && user?.role === 'USER' && remainingTime !== null && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 text-lg" />
            <span className="text-sm font-semibold text-blue-800">
              ✅ Tutor is ready! Approve to start chatting.
            </span>
          </div>

          <div className="ml-4 flex gap-2">
            <button
              onClick={handleStudentConfirm}
              disabled={isConfirming || remainingTime <= 0}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                remainingTime > 0
                  ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              {isConfirming ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle size={14} />
                  <span>✅ Confirm</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowReportForm(true)}
              disabled={remainingTime <= 0}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                remainingTime > 0
                  ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              <FaFlag size={14} />
              <span>🚩 Report</span>
            </button>
          </div>
        </div>
      )}

      {/* CHAT ENDED - Student can review */}
      {(roomStatus === 'CONFIRMED' || roomStatus === 'RESOLVED_NORMAL') && user?.role === 'USER' && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800 font-semibold">
            <FaCheckCircle size={18} />
            🔒 Chat has ended
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg font-semibold transition-all flex items-center gap-2"
          >
            <FaStar size={16} />
            ⭐ Review
          </button>
        </div>
      )}

      {/* CHAT ENDED - No review button for TUTOR */}
      {(roomStatus === 'CONFIRMED' || roomStatus === 'RESOLVED_NORMAL') && user?.role === 'TUTOR' && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200 text-green-800 font-semibold flex items-center gap-2">
          <FaCheckCircle size={18} />
          🔒 Chat has ended
        </div>
      )}

      {/* ==================== MESSAGES ==================== */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FaComments className="text-5xl md:text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base md:text-lg font-semibold">No messages yet</p>
              <p className="text-gray-400 text-xs md:text-sm mt-2">Start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {DEBUG && (
              <div className="text-xs text-gray-500 mb-2">
                📊 Total messages: {messages.length}
              </div>
            )}
            {messages.map((msg, idx) => {
            const isOwnMessage = msg.userId === user?.userId;
            const isImage = msg.fileUrl && isImageFile(msg.fileName);
            const isEditingThis = editingMessageId === msg.id;

            return (
              <div 
                key={idx} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`flex gap-2 md:gap-3 max-w-xs md:max-w-sm ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {(conversation.participantName || 'T').charAt(0).toUpperCase()
                    }</div>
                  )}

                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-600 font-semibold mb-1 px-2">
                        {msg.email || 'Tutor'}
                      </p>
                    )}

                    {/* ✅ MESSAGE BUBBLE */}
                    <div className={`relative px-3 md:px-4 py-2 md:py-3 rounded-2xl text-sm ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-br-none'
                        : msg.isDeleted
                        ? 'bg-gray-200 text-gray-600 italic rounded-bl-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-md'
                    }`}>
                      {isEditingThis ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 px-2 py-1 rounded text-gray-900 text-sm border-2 border-[#03ccba]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            disabled={editingSubmitting}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-xs font-bold"
                          >
                            {editingSubmitting ? <FaSpinner className="animate-spin" size={12} /> : '✓'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          {msg.message && (
                            <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                          )}
                          {msg.isEdited && <span className="text-xs opacity-70 ml-1">(sửa)</span>}

                          {isImage && !msg.isDeleted && (
                            <div className="mt-2">
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName}
                                className="max-w-xs h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImage(msg.fileUrl)}
                              />
                            </div>
                          )}

                          {msg.fileUrl && !isImage && !msg.isDeleted && (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs mt-2 flex items-center gap-2 hover:underline ${
                                isOwnMessage ? 'text-white' : 'text-[#03ccba]'
                              }`}
                            >
                              <FaDownload size={12} />
                              📎 {msg.fileName || 'Download'}
                            </a>
                          )}
                        </>
                      )}
                    </div>

                    {/* ✅ ACTION MENU - only for own messages and not deleted */}
                    {isOwnMessage && !msg.isDeleted && hoveredMessageId === msg.id && !isEditingThis && (
                      <div className="flex gap-2 mt-1 ml-auto">
                        <button
                          onClick={() => handleEditMessage(msg.id, msg.message)}
                          disabled={editingSubmitting || deletingMessageId === msg.id}
                          className="relative group/edit"
                          title="Edit message"
                        >
                          <span className="px-2 py-1 bg-white rounded shadow-md hover:bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200 transition-all">
                            ✏️
                          </span>
                          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/edit:opacity-100 transition-opacity">
                            Sửa
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={deletingMessageId === msg.id || editingSubmitting}
                          className="relative group/delete"
                          title="Delete message"
                        >
                          <span className="px-2 py-1 bg-white rounded shadow-md hover:bg-red-50 text-red-600 text-xs font-bold border border-red-200 transition-all flex items-center gap-1">
                            {deletingMessageId === msg.id ? (
                              <FaSpinner className="animate-spin" size={12} />
                            ) : (
                              '🗑️'
                            )}
                          </span>
                          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/delete:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </button>
                      </div>
                    )}

                    {/* ✅ TIMESTAMP & EDITED INDICATOR */}
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {(user?.fullName || 'Y').charAt(0).toUpperCase()
                    }</div>
                  )}
                </div>
              </div>
            );
          })
            }
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ==================== INPUT AREA ==================== */}
      {roomStatus === 'IN_PROGRESS' || roomStatus === 'SUBMITTED' ? (
        <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-3 md:p-4 sticky bottom-0 shadow-lg flex-shrink-0">
          <div className="flex gap-2 mb-2 md:mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || !wsConnected}
              className="p-2 md:p-3 rounded-lg bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white hover:shadow-lg disabled:opacity-50 transition-all flex-shrink-0"
            >
              <FaPaperclip size={16} />
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
              placeholder="Type a message..."
              disabled={sending || !wsConnected}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 transition-all text-sm"
            />

            <button
              type="submit"
              disabled={sending || !wsConnected || (!newMessage.trim() && !selectedFile)}
              className="p-2 md:p-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all flex-shrink-0"
            >
              {sending ? <FaSpinner className="animate-spin" size={16} /> : <FaPaperPlane size={16} />}
            </button>
          </div>

          {filePreview && (
            <div className="p-2 md:p-3 bg-blue-50 rounded-lg flex items-center justify-between border-l-4 border-[#03ccba] text-sm">
              <div className="flex items-center gap-2">
                {filePreview.startsWith('data:image') ? (
                  <>
                    <FaImage className="text-[#03ccba]" />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">🖼️ Image</span>
                  </>
                ) : (
                  <>
                    <FaFileAlt className="text-[#03ccba]" />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">{selectedFile?.name}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 hover:bg-red-200 rounded transition-colors text-red-600"
              >
                <FaTimes size={14} />
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="bg-gray-200 border-t border-gray-300 p-3 md:p-4 text-center text-gray-700 font-semibold text-sm flex-shrink-0">
          🔒 Chat has ended
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      
      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaFlag className="text-red-500" />
                Report Issue
              </h2>
              <button
                onClick={() => {
                  setShowReportForm(false);
                  setReportDetail('');
                  setReportError(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {reportError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {reportError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {reportDetail.length}/500
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm(false);
                    setReportDetail('');
                    setReportError(null);
                  }}
                  disabled={reportSubmitting}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportDetail.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaFlag size={14} />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
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

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewFormModal
          isOpen={showReviewForm}
          postId={conversation.postId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            console.log('✅ Review submitted successfully');
            setShowReviewForm(false);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}