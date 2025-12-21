// src/api/chatApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const DEBUG = true;

// GLOBAL WebSocket
let wsConnection = null;
let connectionState = 'DISCONNECTED';
let wsListeners = {};
let reconnectAttempts = 0;
let heartbeatInterval = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 30000;

const chatApi = {
  // ✅ CONNECT WEBSOCKET
  connectWebSocket: async () => {
    return new Promise((resolve, reject) => {
      // Prevent duplicate connections
      if (wsConnection && (wsConnection.readyState === WebSocket.OPEN || wsConnection.readyState === WebSocket.CONNECTING)) {
        if (DEBUG) console.log('🔌 [WS] Already connected/connecting, reusing...');
        if (wsConnection.readyState === WebSocket.OPEN) resolve({ success: true });
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ [WS] No token found');
          reject(new Error('No token found'));
          return;
        }

        if (DEBUG) console.log('📡 [WS] Attempting to connect...');

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsurl = `${protocol}//localhost:8888/ws/chat?token=${encodeURIComponent(token)}`;

        if (DEBUG) {
          console.log('🔌 [WS] WebSocket URL:', wsurl);
          console.log('   - Protocol:', protocol);
          console.log('   - Hostname: localhost:8888');
          console.log('   - Path: /ws/chat');
          console.log('   - Token:', token.substring(0, 50) + '...');
          
          // ✅ NEW - Test if backend API is reachable
          console.log('🧪 [WS] Testing backend connectivity...');
          fetch('http://localhost:8080/grabtutor/users/myInfo', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(r => {
            if (r.ok) {
              console.log('✅ [WS] Backend API is reachable');
            } else {
              console.error('❌ [WS] Backend returned:', r.status);
            }
          })
          .catch(err => console.error('❌ [WS] Backend unreachable:', err));
        }

        wsConnection = new WebSocket(wsurl);

        const timeout = setTimeout(() => {
          if (wsConnection.readyState !== WebSocket.OPEN) {
            console.error('❌ [WS] Connection timeout (5s)');
            console.error('   - readyState:', wsConnection.readyState);
            console.error('   - Expected: 1 (OPEN)');
            console.error('   - Check: Is backend WebSocket server running on port 8888?');
            wsConnection.close();
            reject(new Error('WebSocket connection timeout - Backend server not responding'));
          }
        }, 5000);

        wsConnection.onopen = () => {
          clearTimeout(timeout);
          connectionState = 'CONNECTED';
          reconnectAttempts = 0;
          if (DEBUG) console.log('✅ [WS] Connected successfully!');
          resolve({ success: true });
        };

        wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (DEBUG) console.log('📨 [WS] Received:', data.type, '| Full data:', JSON.stringify(data));

            // Ignore PONG
            if (data.type === 'PONG') {
              if (DEBUG) console.log('💓 [WS] Pong received');
              return;
            }

            // Trigger listeners
            if (data.type === 'MESSAGE') {
              if (DEBUG) console.log('💬 [WS] MESSAGE signal - triggering onMessage listener');
              wsListeners['message']?.(data);
            } else if (data.type === 'NOTIFICATION') {
              if (DEBUG) console.log('🔔 [WS] NOTIFICATION signal - triggering onNotification listener');
              wsListeners['notification']?.(data);
            } else if (data.type === 'ACK') {
              if (DEBUG) console.log('✅ [WS] ACK signal - triggering onAck listener');
              wsListeners['ack']?.(data);
            } else if (data.type === 'UPDATE' || data.type === 'TIMEOUT') {
              // ✅ NEW - Auto fetch room status when state changes
              if (DEBUG) console.log(`\n🔄🔄🔄 [WS] *** ${data.type} SIGNAL RECEIVED *** 🔄🔄🔄`);
              if (DEBUG) console.log(`   Room ID: ${data.roomId || 'undefined'}`);
              if (DEBUG) console.log(`   Full message:`, JSON.stringify(data, null, 2));
              
              // ✅ If roomId not in signal, use stored room ID
              const targetRoomId = data.roomId || wsListeners['currentRoomId'];
              
              if (targetRoomId) {
                if (DEBUG) console.log(`   → Fetching room data for room: ${targetRoomId}`);
                chatApi.getRoomById(targetRoomId)
                  .then(updatedRoom => {
                    if (DEBUG) {
                      console.log(`✅ [WS] Room fetched successfully!`);
                      console.log(`   Room status: ${updatedRoom?.status}`);
                      console.log(`   Room data:`, JSON.stringify(updatedRoom, null, 2));
                      console.log(`   → Triggering onUpdate listener with ${data.type}`);
                    }
                    
                    // Pass both original message and updated room to listener
                    wsListeners['update']?.({
                      type: data.type,
                      roomId: targetRoomId,
                      message: data,
                      room: updatedRoom
                    });
                  })
                  .catch(err => {
                    console.error(`❌ [WS] Error fetching room after ${data.type}:`, err);
                    if (DEBUG) console.log(`   → Triggering onUpdate listener with original message (API failed)`);
                    // Still trigger listener with original message
                    wsListeners['update']?.(data);
                  });
              } else {
                if (DEBUG) console.log(`⚠️ [WS] No roomId in ${data.type} signal and no current room stored`);
                wsListeners['update']?.(data);
              }
            } else {
              if (DEBUG) console.log(`❓ [WS] Unknown signal type: ${data.type} - triggering onUpdate listener`);
              wsListeners['update']?.(data);
            }
          } catch (err) {
            console.error('❌ [WS] Parse error:', err);
          }
        };

        wsConnection.onerror = (error) => {
          clearTimeout(timeout);
          connectionState = 'ERROR';
          console.error('❌ [WS] WebSocket Error:');
          console.error('   - Type:', error.type);
          console.error('   - Message:', error.message);
          console.error('   - Check: Backend WebSocket endpoint running?');
          reject(error);
        };

        wsConnection.onclose = (event) => {
          clearTimeout(timeout);
          connectionState = 'DISCONNECTED';
          
          console.log('❌ [WS] Connection Closed');
          console.log('   - Code:', event.code);
          console.log('   - Reason:', event.reason || 'No reason provided');
          console.log('   - Was Clean:', event.wasClean);
          
          const closeCodeMeaning = {
            1000: 'Normal closure',
            1001: 'Going away',
            1002: 'Protocol error',
            1006: 'Abnormal closure (server crash?)',
            1008: 'Policy violation',
            4000: 'Custom error',
            4001: 'Authentication failed'
          };
          
          console.error(`   - Meaning: ${closeCodeMeaning[event.code] || 'Unknown'}`);

          // Auto-reconnect
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts - 1);
            console.log(`🔄 [WS] Retrying in ${Math.round(delay)}ms...`);
            setTimeout(() => chatApi.connectWebSocket().catch(console.error), delay);
          }
        };
      } catch (error) {
        console.error('❌ [WS] Exception during setup:', error);
        reject(error);
      }
    });
  },

  // ✅ HEARTBEAT - Keep connection alive
  startHeartbeat: () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    heartbeatInterval = setInterval(() => {
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        try {
          wsConnection.send(JSON.stringify({ type: 'PING' }));
          if (DEBUG) console.log('💓 [WS] Ping sent');
        } catch (err) {
          console.error('❌ [WS] Error sending PING:', err);
        }
      }
    }, HEARTBEAT_INTERVAL);
  },

  stopHeartbeat: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      if (DEBUG) console.log('⏹️ [WS] Heartbeat stopped');
    }
  },

  // ✅ DISCONNECT
  disconnectWebSocket: () => {
    chatApi.stopHeartbeat();
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
      connectionState = 'DISCONNECTED';
      if (DEBUG) console.log('✅ [WS] Disconnected manually');
    }
  },

  // ✅ JOIN ROOM
  joinRoom: async (roomId) => {
    return new Promise((resolve, reject) => {
      try {
        if (DEBUG) console.log('🚪 [WS] Joining room:', roomId);

        if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        const joinMessage = {
          type: 'JOIN',
          roomId: roomId
        };

        wsConnection.send(JSON.stringify(joinMessage));
        if (DEBUG) console.log('✅ [WS] JOIN message sent');
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  },

  // ✅ SEND MESSAGE - Match script.js exactly
  sendMessage: async (roomId, messageData) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    let fileUrl = null;
    let fileName = null;

    // ✅ Upload file TRƯỚC - giống script.js
    if (messageData.file) {
      try {
        const formData = new FormData();
        formData.append('file', messageData.file);

        // ✅ KHÔNG gửi Authorization header - giống script.js
        const response = await fetch(`${BASE_URL}/grabtutor/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        fileUrl = data?.data?.fileUrl || data?.fileUrl || data?.url;
        fileName = messageData.file.name;

        if (DEBUG) console.log('✅ [WS] File uploaded:', fileUrl);
      } catch (error) {
        console.error('❌ [WS] File upload error:', error);
        throw error;
      }
    }

    // ✅ Gửi message qua WebSocket - GIỐNG script.js
    const payload = {
      userId: messageData.userId || localStorage.getItem('userId'),
      roomId: roomId,
      type: 'MESSAGE',
      message: messageData.message || messageData.content || '',
      fileName: fileName,  // ← PHẢI gửi (có thể null)
      fileUrl: fileUrl     // ← PHẢI gửi (có thể null)
    };

    if (DEBUG) {
      console.log('📤 [WS] Final payload:', payload);
      console.log('   - userId:', payload.userId);
      console.log('   - message:', payload.message);
      console.log('   - fileName:', payload.fileName);
      console.log('   - fileUrl:', payload.fileUrl);
    }

    wsConnection.send(JSON.stringify(payload));
    if (DEBUG) console.log('✅ [WS] Message sent via WebSocket');
  },

  // ✅ REGISTER LISTENERS
  onMessage: (callback) => {
    wsListeners['message'] = callback;
  },

  onNotification: (callback) => {
    wsListeners['notification'] = callback;
  },

  onUpdate: (callback) => {
    wsListeners['update'] = callback;
  },

  onAck: (callback) => {
    wsListeners['ack'] = callback;
  },

  // ✅ NEW - Set current room ID for UPDATE/TIMEOUT signals
  setCurrentRoomId: (roomId) => {
    wsListeners['currentRoomId'] = roomId;
    if (DEBUG) console.log('💾 [chatApi] Current room ID set to:', roomId);
  },

  // ✅ API CALLS - Dùng FETCH thay vì AXIOS
  
  getRoomById: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🔍 [API] Fetching room:', roomId);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/${roomId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Room:', data);
      return data?.data || data;
    } catch (error) {
      console.error('❌ [API] Error fetching room:', error);
      throw error;
    }
  },
getMessages: async (roomId, pageNo = 0, pageSize = 100) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    const response = await fetch(
      `${BASE_URL}/grabtutor/room/message?roomId=${roomId}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (DEBUG) console.log('📨 [API] Raw response from getMessages:', data);
    
    const messages = data?.data?.messages || data?.messages || [];
    if (DEBUG) console.log('📨 [API] Messages array:', messages);
    
    // ✅ Map messages including isDeleted field (backend uses 'deleted' or 'isDeleted')
    const mappedMessages = messages.map(msg => {
      // Backend returns 'deleted' field, not 'isDeleted'
      const isMessageDeleted = msg.deleted === true || msg.deleted === 'true' || msg.isDeleted === true || msg.isDeleted === 'true' || msg.message === '(tin nhắn đã gỡ)';
      
      if (DEBUG && isMessageDeleted) {
        console.log('🗑️ [API] Found deleted message:', {
          id: msg.id,
          backend_deleted: msg.deleted,
          backend_isDeleted: msg.isDeleted,
          original_message: msg.message
        });
      }
      
      return {
        id: msg.id,
        userId: msg.userId,
        email: msg.email,
        message: isMessageDeleted ? '(message retracted)' : msg.message,
        fileUrl: isMessageDeleted ? null : msg.fileUrl,
        fileName: isMessageDeleted ? null : msg.fileName,
        isDeleted: isMessageDeleted,
        isEdited: msg.isEdited || msg.edited || false,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      };
    });
    
    if (DEBUG) {
      console.log('📨 [API] Mapped messages:', mappedMessages);
      console.log('🗑️ [API] Messages with isDeleted=true:', mappedMessages.filter(m => m.isDeleted));
      console.log('🗑️ [API] Messages with "(message retracted)" content:', mappedMessages.filter(m => m.message === '(message retracted)'));
    }
    
    return mappedMessages;
  } catch (error) {
    console.error('getMessages ERROR:', error);
    return [];
  }
},
  getConversations: async (pageNo = 0, pageSize = 50) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('💬 [API] Fetching conversations...');

      // ✅ NEW - Log request details
      console.log('🔍 === GET /grabtutor/room/myRooms REQUEST ===');
      console.log('URL:', `${BASE_URL}/grabtutor/room/myRooms?pageNo=${pageNo}&pageSize=${pageSize}`);
      console.log('Headers:', { Authorization: `Bearer ${token?.substring(0, 50)}...` });
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/myRooms?pageNo=${pageNo}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // ✅ NEW - Log full response
      console.log('✅ === GET /grabtutor/room/myRooms RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Full response data:', JSON.stringify(data, null, 2));
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'null');
      
      // ✅ NEW - Log response structure
      if (data?.data) {
        console.log('data.data type:', typeof data.data);
        console.log('data.data keys:', Object.keys(data.data || {}));
        if (Array.isArray(data.data)) {
          console.log('data.data is array, length:', data.data.length);
          console.log('First item:', data.data[0]);
        } else if (data.data?.rooms) {
          console.log('data.data.rooms type:', typeof data.data.rooms);
          console.log('data.data.rooms length:', data.data.rooms.length);
          console.log('First room:', data.data.rooms[0]);
        }
      }
      
      const rooms = data?.data?.rooms || data?.data || data;
      if (DEBUG) console.log('💬 [API] Conversations:', rooms);
      return rooms;
    } catch (error) {
      console.error('❌ [API] Error fetching conversations:', error);
      throw error;
    }
  },

  deleteConversation: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🗑️ [API] Deleting room:', roomId);

      const response = await fetch(`${BASE_URL}/grabtutor/room/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Room deleted');
      return data;
    } catch (error) {
      console.error('❌ [API] Error deleting room:', error);
      throw error;
    }
  },

  getOrCreateConversation: async (postId, tutorBidId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🏠 [API] Getting/creating conversation...');

      const response = await fetch(`${BASE_URL}/grabtutor/room/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, tutorBidId })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Conversation:', data);
      return data?.data || data;
    } catch (error) {
      console.error('❌ [API] Error getting/creating conversation:', error);
      throw error;
    }
  },

  // ✅ DELETE A SINGLE MESSAGE
  deleteMessage: async (roomId, messageId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🗑️ [API] Deleting message:', messageId);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/message?messageId=${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Server response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (DEBUG) {
        console.log('✅ [API] DELETE response:', data);
        console.log('📊 [API] Response structure:');
        console.log('   - data.message:', data?.message);
        console.log('   - data.data:', data?.data);
        console.log('   - Full data:', JSON.stringify(data, null, 2));
      }
      return data;
    } catch (error) {
      console.error('❌ [API] Error deleting message:', error);
      throw error;
    }
  },

  // ✅ UPDATE MESSAGE
  updateMessage: async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('✏️ [API] Updating message:', messageId, 'Content:', newContent);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/message`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messageId, content: newContent })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Server response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Message updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [API] Error updating message:', error);
      throw error;
    }
  },

  // ✅ NEW - Delete all messages in a room (entire conversation)
  deleteAllMessages: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🗑️ [API] Deleting all messages in room:', roomId);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/${roomId}/messages`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (DEBUG) console.log('✅ [API] All messages deleted');
      return data;
    } catch (error) {
      console.error('❌ [API] Error deleting all messages:', error);
      throw error;
    }
  },

  // ✅ NEW - Tutor submit solution (IN_PROGRESS → SUBMITTED)
  submitSolution: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('📤 [API] Tutor submitting solution for room:', roomId);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/submit?roomId=${roomId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Solution submitted:', data);
      return data?.data || data;
    } catch (error) {
      console.error('❌ [API] Error submitting solution:', error);
      throw error;
    }
  },

  // ✅ NEW - Student confirm solution (SUBMITTED → CONFIRMED)
  confirmSolution: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('✅ [API] Student confirming solution for room:', roomId);

      const response = await fetch(
        `${BASE_URL}/grabtutor/room/confirm?roomId=${roomId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (DEBUG) console.log('✅ [API] Solution confirmed:', data);
      return data?.data || data;
    } catch (error) {
      console.error('❌ [API] Error confirming solution:', error);
      throw error;
    }
  },

  // ✅ GETTERS
  getConnectionState: () => connectionState,
  isConnected: () => connectionState === 'CONNECTED',
  getGlobalConnection: () => wsConnection,
};

export default chatApi;