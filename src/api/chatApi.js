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
            if (DEBUG) console.log('📨 [WS] Received:', data.type);

            // Ignore PONG
            if (data.type === 'PONG') {
              if (DEBUG) console.log('💓 [WS] Pong received');
              return;
            }

            // Trigger listeners
            if (data.type === 'MESSAGE') {
              wsListeners['message']?.(data);
            } else if (data.type === 'NOTIFICATION') {
              wsListeners['notification']?.(data);
            } else if (data.type === 'ACK') {
              wsListeners['ack']?.(data);
            } else {
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

    // Upload file nếu có - ✅ KHÔNG gửi Authorization header
    if (messageData.file) {
      try {
        const formData = new FormData();
        formData.append('file', messageData.file);

        const uploadResponse = await fetch(`${BASE_URL}/grabtutor/upload`, {
          method: 'POST',
          // ✅ KHÔNG set headers - let browser handle FormData
          body: formData
        });

        if (!uploadResponse.ok) throw new Error('Upload failed');
        const uploadData = await uploadResponse.json();
        
        // ✅ Match script.js: try 3 formats
        fileUrl = uploadData?.data?.fileUrl || uploadData?.fileUrl || uploadData?.url;
        fileName = messageData.file.name;
        
        if (DEBUG) console.log('✅ [WS] File uploaded:', fileUrl);
      } catch (error) {
        console.error('❌ [WS] File upload error:', error);
        throw error;
      }
    }

    // ✅ SEND MESSAGE - Always include all fields like script.js
    const payload = {
      userId: messageData.userId || localStorage.getItem('userId'),
      roomId: roomId,
      type: 'MESSAGE',
      message: messageData.message || messageData.content || '',
      fileName: fileName,  // ✅ Always include (even if null)
      fileUrl: fileUrl     // ✅ Always include (even if null)
    };

    if (DEBUG) {
      console.log('📤 [WS] Final payload:', payload);
      console.log('   - Message field:', payload.message);
      console.log('   - FileName:', payload.fileName);
      console.log('   - FileUrl:', payload.fileUrl);
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

  // ✅ API CALLS - Dùng FETCH thay vì AXIOS
  
  getRoomById: async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('🔍 [API] Fetching room:', roomId);

      const response = await fetch(`${BASE_URL}/grabtutor/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

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
    const messages = data?.data?.messages || data?.messages || [];
    
    // Return messages without transformation - keep backend field names
    return messages.map(msg => ({
      id: msg.id,
      userId: msg.userId,
      email: msg.email,
      message: msg.message,  // Keep as "message", not "content"
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error('getMessages ERROR:', error);
    return [];
  }
},
  getConversations: async (pageNo = 0, pageSize = 50) => {
    try {
      const token = localStorage.getItem('token');
      if (DEBUG) console.log('💬 [API] Fetching conversations...');

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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rooms = data?.data?.rooms || data?.data || data;
      if (DEBUG) console.log('✅ [API] Conversations:', rooms);
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
        method: 'POST',
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

      // ✅ FIX: Backend endpoint format
      const response = await fetch(
        `${BASE_URL}/grabtutor/room/message?messageId=${messageId}`,  // ← Đúng format
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
      if (DEBUG) console.log('✅ [API] Message deleted');
      return data;
    } catch (error) {
      console.error('❌ [API] Error deleting message:', error);
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

  // ✅ GETTERS
  getConnectionState: () => connectionState,
  isConnected: () => connectionState === 'CONNECTED',
  getGlobalConnection: () => wsConnection,
};

export default chatApi;