import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPhone, FaVideo, FaSpinner, FaTrash, FaPaperPlane, FaEllipsisV, FaPaperclip, FaTimes, FaFileAlt, FaImage } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import chatApi from '../api/chatApi';

const DEBUG = false;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function ChatWindow({ conversation, onClose, onRefresh }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  
  // ✅ File attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const messagesEndRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const wsInitRef = useRef(false);
  const lastFetchRef = useRef(0);
  const conversationIdRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ File input ref

  // ✅ Initialize on conversation change
  useEffect(() => {
    if (conversation?.id !== conversationIdRef.current) {
      wsInitRef.current = false;
      conversationIdRef.current = conversation?.id;
      lastFetchRef.current = 0;
      setMessages([]);
      setSelectedFile(null); // ✅ Clear file when changing conversation
      setFilePreview(null);
    }

    if (conversation && !wsInitRef.current) {
      wsInitRef.current = true;
      initWebSocket();
      fetchMessages();
    }

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initWebSocket = async () => {
    try {
      setReconnecting(true);
      if (DEBUG) console.log('🔌 Initializing WebSocket...');
      
      await chatApi.connectWebSocket();
      
      setWsConnected(true);
      setReconnecting(false);
      
      if (conversation?.id) {
        chatApi.onRoomMessage(conversation.id, (msg) => {
          if (msg?.type === 'MESSAGE') {
            setMessages(prev => {
              // ✅ Add null check
              if (!msg || !msg.id) return prev;
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        });
      }
    } catch (error) {
      // ✅ Ignore DevTools errors
      if (error.message?.includes('disconnected')) {
        console.warn('⚠️ DevTools error - retrying...');
        setTimeout(() => initWebSocket(), 1000);
        return;
      }
      
      console.error('❌ WebSocket init failed:', error);
      setWsConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      if (DEBUG) console.log('⏭️ Skipping fetch (too recent)');
      return;
    }

    try {
      setLoading(true);
      if (DEBUG) console.log('📥 Fetching messages for room:', conversation?.id);
      
      const msgs = await chatApi.getMessages(conversation.id, 0, 100);
      
      if (msgs && Array.isArray(msgs)) {
        msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(msgs);
        if (DEBUG) console.log(`✅ Loaded ${msgs.length} messages`);
      } else {
        setMessages([]);
      }
      
      lastFetchRef.current = now;
    } catch (error) {
      if (DEBUG) console.error('❌ Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // ✅ Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`❌ File quá lớn. Tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    // ✅ Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('❌ Định dạng file không được hỗ trợ');
      return;
    }

    setSelectedFile(file);

    // ✅ Show preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: 'image',
          url: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({
        type: 'file',
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB'
      });
    }

    // ✅ Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Remove selected file
  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
  };

  // ✅ Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/png;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // ✅ Send message with file
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    if (!wsConnected) {
      alert('⏳ WebSocket đang kết nối, vui lòng chờ...');
      return;
    }

    try {
      setSending(true);
      if (DEBUG) console.log('📤 Sending message...');
      
      let messageData = {
        content: newMessage || '',
      };

      // ✅ If file selected, convert to Base64 and attach
      if (selectedFile) {
        setUploadProgress(30);
        const base64Data = await fileToBase64(selectedFile);
        setUploadProgress(60);

        messageData.fileName = selectedFile.name;
        messageData.fileType = selectedFile.type;
        messageData.fileSize = selectedFile.size;
        messageData.fileData = base64Data;

        if (DEBUG) console.log('📎 File attached:', selectedFile.name);
      }

      setUploadProgress(80);
      await chatApi.sendMessage(conversation.id, messageData);
      setUploadProgress(100);
      
      setNewMessage('');
      clearFile();
      onRefresh?.();

      // ✅ Reset progress after 500ms
      setTimeout(() => setUploadProgress(0), 500);
    } catch (error) {
      if (DEBUG) console.error('❌ Error sending message:', error);
      alert('❌ Không thể gửi tin nhắn');
      setWsConnected(false);
      await initWebSocket();
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?')) {
      try {
        await chatApi.deleteConversation(conversation.id);
        onClose();
        onRefresh?.();
      } catch (error) {
        alert('❌ Không thể xóa cuộc trò chuyện');
      }
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
              {(conversation.participantName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-lg">{conversation.participantName || 'Trò chuyện'}</h2>
              <p className="text-sm text-teal-100 flex items-center gap-2">
                {conversation.postTitle || 'Cuộc trò chuyện'}
                {wsConnected && !reconnecting && (
                  <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                )}
                {!wsConnected && !reconnecting && (
                  <span className="inline-block w-2 h-2 bg-red-300 rounded-full"></span>
                )}
                {reconnecting && (
                  <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 relative">
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hidden sm:block">
            <FaPhone />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hidden sm:block">
            <FaVideo />
          </button>
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FaEllipsisV />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    handleDeleteConversation();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrash size={14} /> Xóa
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <FaSpinner className="animate-spin text-[#03ccba] text-3xl mx-auto mb-2" />
              <p className="text-gray-600">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-4">👋</div>
              <p className="text-gray-600 font-semibold">Chưa có tin nhắn</p>
              <p className="text-sm text-gray-500 mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.userId === user?.userId;
            const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;

            return (
              <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-sm ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {(msg.email?.charAt(0) || 'U').toUpperCase()
                      }
                    </div>
                  )}
                  {!showAvatar && <div className="w-8 flex-shrink-0" />}

                  <div className="flex flex-col">
                    {showAvatar && (
                      <p className="text-xs text-gray-600 font-semibold mb-1 px-2">
                        {msg.email || 'Người dùng'}
                      </p>
                    )}
                    
                    {/* Message bubble with text + file */}
                    <div className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-[#03ccba] text-gray-900 rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}>
                      {/* Text message */}
                      {msg.content && (
                        <p className="text-sm break-words mb-2">{msg.content}</p>
                      )}
                      
                      {/* File attachment */}
                      {msg.fileName && (
                        <div className={`mt-2 p-3 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-white bg-opacity-30' 
                            : 'bg-white bg-opacity-50'
                        }`}>
                          {msg.fileType?.startsWith('image/') ? (
                            // ✅ Image preview
                            <div className="flex flex-col gap-2">
                              <img 
                                src={msg.fileUrl} 
                                alt={msg.fileName}
                                className="max-w-xs max-h-48 rounded-lg cursor-pointer hover:opacity-80"
                                onClick={() => window.open(msg.fileUrl, '_blank')}
                              />
                              <a
                                href={msg.fileUrl}
                                download={msg.fileName}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                              >
                                ⬇️ {msg.fileName}
                              </a>
                            </div>
                          ) : (
                            // ✅ File download link
                            <a
                              href={msg.fileUrl}
                              download={msg.fileName}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <FaFileAlt size={16} />
                              <span>{msg.fileName}</span>
                              <span className="text-xs text-gray-600">
                                ({(msg.fileSize / 1024).toFixed(2)} KB)
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="px-4 pt-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg relative">
            {filePreview.type === 'image' ? (
              <>
                <img src={filePreview.url} alt="preview" className="w-12 h-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{filePreview.name}</p>
                  <p className="text-xs text-gray-600">📷 Image</p>
                </div>
              </>
            ) : (
              <>
                <FaFileAlt size={20} className="text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{filePreview.name}</p>
                  <p className="text-xs text-gray-600">{filePreview.size}</p>
                </div>
              </>
            )}
            
            {/* Upload progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-12 h-1 bg-gray-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <button
              onClick={clearFile}
              disabled={uploading}
              className="absolute top-2 right-2 p-1 hover:bg-blue-200 rounded transition-colors"
              title="Remove file"
            >
              <FaTimes size={14} className="text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="flex gap-2">
          {/* ✅ File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || !wsConnected}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#03ccba] disabled:opacity-50 transition-colors flex-shrink-0"
            title="Đính kèm file"
          >
            <FaPaperclip size={18} />
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept={ALLOWED_FILE_TYPES.join(',')}
          />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={sending || !wsConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#03ccba] outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile) || !wsConnected || reconnecting}
            className="px-6 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg disabled:opacity-50 font-bold flex items-center gap-2"
          >
            {sending ? (
              <FaSpinner className="animate-spin" />
            ) : reconnecting ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <>
                <FaPaperPlane size={14} />
                <span className="hidden sm:inline">Gửi</span>
              </>
            )}
          </button>
        </div>
        {!wsConnected && (
          <p className="text-xs text-amber-600 mt-2">
            {reconnecting ? '🔄 Đang kết nối...' : '⚠️ WebSocket chưa kết nối'}
          </p>
        )}
      </form>
    </div>
  );
}