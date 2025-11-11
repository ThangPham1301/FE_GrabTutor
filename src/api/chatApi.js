import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ✅ WebSocket Connection Manager
let wsConnection = null;
let wsListeners = {};
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const DEBUG = true;
let connectionState = 'DISCONNECTED';

const chatApi = {
  // ✅ Kết nối WebSocket với retry logic
  connectWebSocket: async () => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ [WS] No token found');
          reject(new Error('No token found'));
          return;
        }

        // ✅ Check if already connected
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          if (DEBUG) console.log('✅ [WS] Already connected, reusing connection');
          resolve(wsConnection);
          return;
        }

        connectionState = 'CONNECTING';
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//localhost:8888/ws/chat?token=${token}`;
        
        if (DEBUG) console.log('🔌 [WS] Connecting to:', wsUrl);

        wsConnection = new WebSocket(wsUrl);
        wsConnection.binaryType = 'arraybuffer';

        wsConnection.onopen = () => {
          if (DEBUG) console.log('✅ [WS] Connection opened');
          if (DEBUG) console.log('✅ [WS] Ready state:', wsConnection.readyState);
          reconnectAttempts = 0;
          connectionState = 'CONNECTED';
          resolve(wsConnection);
        };

        wsConnection.onmessage = (event) => {
          try {
            if (DEBUG) console.log('📨 [WS] Message received (length:', event.data.length, ')');
            
            const message = JSON.parse(event.data);
            
            if (DEBUG) console.log('📨 [WS] Parsed message:', {
              type: message.type,
              roomId: message.roomId,
              userId: message.userId,
            });
            
            // ✅ Add error handling for undefined message
            if (!message || !message.roomId) {
              console.warn('⚠️ [WS] Invalid message format, skipping');
              return;
            }
            
            // ✅ Trigger listeners for room
            if (wsListeners[message.roomId]) {
              if (DEBUG) console.log('📢 [WS] Triggering listener for room:', message.roomId);
              try {
                wsListeners[message.roomId](message);
              } catch (callbackError) {
                console.error('❌ [WS] Error in message callback:', callbackError);
              }
            } else {
              if (DEBUG) console.warn('⚠️ [WS] No listener for room:', message.roomId);
              if (DEBUG) console.log('📋 [WS] Available rooms:', Object.keys(wsListeners));
            }
          } catch (error) {
            console.error('❌ [WS] Error parsing message:', error);
            if (DEBUG) console.error('Raw data:', event.data);
            // ✅ Don't throw - continue accepting messages
          }
        };

        wsConnection.onerror = (error) => {
          console.error('❌ [WS] WebSocket error:', error);
          connectionState = 'DISCONNECTED';
          
          // ✅ Ignore "disconnected port object" errors from DevTools
          if (error.message?.includes('disconnected port')) {
            console.warn('⚠️ DevTools extension error - ignoring');
            return;
          }
          
          if (DEBUG) console.error('Error details:', {
            code: error.code,
            reason: error.reason,
            message: error.message,
            readyState: wsConnection?.readyState
          });
          // Don't reject - just log
        };

        wsConnection.onclose = (event) => {
          connectionState = 'DISCONNECTED';
          console.log('🔌 [WS] Connection closed');
          if (DEBUG) console.log('Close details:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            description: getCloseCodeDescription(event.code)
          });
          
          // ✅ FIX: Don't nullify wsConnection immediately
          // wsConnection = null; // ← REMOVE THIS
          
          // ✅ Auto-reconnect if closed abnormally
          if (!event.wasClean && event.code !== 1000) {
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttempts++;
              const delay = 2000 * reconnectAttempts;
              if (DEBUG) console.log(`🔄 [WS] Reconnecting in ${delay}ms (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
              setTimeout(() => {
                wsConnection = null; // Clear here instead
                chatApi.connectWebSocket().catch(err => console.error('Reconnect failed:', err));
              }, delay);
            } else {
              console.error('❌ [WS] Max reconnect attempts reached');
              wsConnection = null;
            }
          }
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (wsConnection && wsConnection.readyState !== WebSocket.OPEN) {
            console.error('❌ [WS] Connection timeout after 10s');
            wsConnection.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ [WS] connectWebSocket error:', error);
        connectionState = 'DISCONNECTED';
        reject(error);
      }
    });
  },

  // ✅ Lắng nghe messages từ một room
  onRoomMessage: (roomId, callback) => {
    if (DEBUG) console.log('📝 [WS] Setting up listener for room:', roomId);
    wsListeners[roomId] = callback;
    if (DEBUG) console.log('📝 [WS] Active listeners:', Object.keys(wsListeners));
  },

  // ✅ Gửi tin nhắn (text + file) qua WebSocket
  sendMessage: async (roomId, messageData) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (DEBUG) console.log('📤 [WS] sendMessage called for room:', roomId);
        
        // ✅ FIX: Ensure connection exists and is open before sending
        if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
          if (DEBUG) console.log('⚠️ [WS] Connection not ready, initializing...');
          
          try {
            await chatApi.connectWebSocket();
            if (DEBUG) console.log('✅ [WS] Reconnected successfully');
          } catch (error) {
            console.error('❌ [WS] Failed to reconnect:', error.message);
            reject(new Error('WebSocket connection failed'));
            return;
          }
        }

        if (DEBUG) console.log('📤 [WS] Ready state:', wsConnection.readyState, '(1=OPEN)');

        if (wsConnection.readyState !== WebSocket.OPEN) {
          console.error('❌ [WS] Connection still not OPEN (state:', wsConnection.readyState + ')');
          reject(new Error(`WebSocket not ready (state: ${wsConnection.readyState})`));
          return;
        }

        // ✅ Prepare message
        let message = {
          type: 'MESSAGE',
          roomId: roomId,
          content: messageData.content || '',
          fileName: messageData.fileName || null,
          fileType: messageData.fileType || null,
          fileSize: messageData.fileSize || null,
          fileData: messageData.fileData || null
        };

        const jsonStr = JSON.stringify(message);
        if (DEBUG) console.log('📤 [WS] Message payload:', {
          type: message.type,
          roomId: message.roomId,
          contentLength: message.content.length,
          hasFile: !!message.fileName,
          totalSize: jsonStr.length
        });

        wsConnection.send(jsonStr);
        
        if (DEBUG) console.log('✅ [WS] Message sent successfully');
        resolve({ success: true, sent: true });
        
      } catch (error) {
        console.error('❌ [WS] sendMessage error:', error.message);
        reject(error);
      }
    });
  },

  // ✅ Ngắt kết nối WebSocket
  disconnectWebSocket: () => {
    if (DEBUG) console.log('🔌 [WS] Disconnecting...');
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    wsListeners = {};
    connectionState = 'DISCONNECTED';
  },

  // ✅ Get current connection state
  getConnectionState: () => connectionState,

  // ✅ Lấy rooms của user hiện tại
  getConversations: async (pageNo = 0, pageSize = 50) => {
    try {
      if (DEBUG) console.log('=== getConversations START ===');
      
      const response = await api.get(`/grabtutor/room/myRooms`);
      
      if (DEBUG) console.log('Response:', response.data);
      
      let items = [];
      if (response.data?.data?.rooms && Array.isArray(response.data.data.rooms)) {
        items = response.data.data.rooms;
      } else if (response.data?.rooms && Array.isArray(response.data.rooms)) {
        items = response.data.rooms;
      } else if (Array.isArray(response.data?.data)) {
        items = response.data.data;
      }
      
      if (DEBUG) console.log('✅ Loaded rooms:', items.length);
      return items;
    } catch (error) {
      if (DEBUG) console.error('❌ getConversations error:', error.response?.data || error.message);
      return [];
    }
  },

  // ✅ Lấy room cụ thể bằng room ID
  getRoomById: async (roomId) => {
    try {
      if (DEBUG) console.log('=== getRoomById START ===');
      if (DEBUG) console.log('roomId:', roomId);
      
      const response = await api.get(`/grabtutor/room/myRooms`);
      
      let rooms = [];
      if (response.data?.data?.rooms && Array.isArray(response.data.data.rooms)) {
        rooms = response.data.data.rooms;
      } else if (Array.isArray(response.data?.data)) {
        rooms = response.data.data;
      }
      
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      if (DEBUG) console.log('✅ Room found:', room);
      return room;
    } catch (error) {
      if (DEBUG) console.error('❌ getRoomById error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Lấy tin nhắn từ REST API (lịch sử)
  getMessages: async (roomId, pageNo = 0, pageSize = 50) => {
    try {
      if (DEBUG) console.log('=== getMessages START ===');
      
      const response = await api.get(
        `/grabtutor/room/message?roomId=${roomId}&pageNo=${pageNo}&pageSize=${pageSize}`
      );
      
      if (DEBUG) console.log('Messages response:', response.data);
      
      let messages = [];
      if (response.data?.data?.messages && Array.isArray(response.data.data.messages)) {
        messages = response.data.data.messages;
      } else if (response.data?.messages && Array.isArray(response.data.messages)) {
        messages = response.data.messages;
      } else if (Array.isArray(response.data?.data)) {
        messages = response.data.data;
      }
      
      if (DEBUG) console.log(`✅ Loaded ${messages.length} messages`);
      return messages;
    } catch (error) {
      if (DEBUG) console.error('❌ getMessages error:', error.response?.data || error.message);
      return [];
    }
  },

  // ✅ Delete conversation
  deleteConversation: async (roomId) => {
    try {
      if (DEBUG) console.log('=== deleteConversation START ===');
      if (DEBUG) console.log('roomId:', roomId);
      
      const response = await api.delete(
        `/grabtutor/room/${roomId}`
      ).catch(err => {
        console.warn('Delete room endpoint not found, returning success');
        return { data: { success: true } };
      });
      
      if (DEBUG) console.log('✅ deleteConversation response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ deleteConversation error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ✅ Helper function to describe WebSocket close codes
function getCloseCodeDescription(code) {
  const codes = {
    1000: 'Normal closure',
    1001: 'Going away',
    1002: 'Protocol error',
    1003: 'Unsupported data',
    1006: 'Abnormal closure (connection lost)',
    1007: 'Invalid frame payload',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Mandatory extension',
    1011: 'Internal error',
    1012: 'Service restart',
    1013: 'Try again later',
    1014: 'Bad gateway',
    1015: 'TLS handshake failure'
  };
  return codes[code] || `Unknown code: ${code}`;
}

export default chatApi;