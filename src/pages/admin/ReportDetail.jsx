import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaCheck, FaTimesCircle, FaComments, FaCalendar, FaUser, FaFileAlt } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import reportApi from '../../api/reportApi';
import chatApi from '../../api/chatApi';

const DEBUG = true;

export default function ReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [room, setRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('detail'); // detail / chat
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);

      // ✅ STEP 1: Lấy report detail
      const reportData = await reportApi.getReportById(reportId);
      if (DEBUG) console.log('Report data:', reportData);
      setReport(reportData);

      // ✅ STEP 2: Backend đã trả về chatRoomId sẵn rồi!
      // Không cần match postId nữa
      if (reportData.chatRoomId) {
        try {
          if (DEBUG) console.log('📍 Using chatRoomId from report:', reportData.chatRoomId);
          
          // ✅ Lấy room detail trực tiếp
          const roomData = await chatApi.getRoomById(reportData.chatRoomId);
          
          if (DEBUG) console.log('✅ Room found:', roomData);
          setRoom(roomData);

          // ✅ Fetch messages từ room
          if (roomData?.id) {
            try {
              const messagesData = await chatApi.getMessages(roomData.id);
              let messages = [];
              
              if (messagesData?.data && Array.isArray(messagesData.data)) {
                messages = messagesData.data;
              } else if (Array.isArray(messagesData)) {
                messages = messagesData;
              }
              
              setChatMessages(messages);
              if (DEBUG) console.log('✅ Messages loaded:', messages.length);
            } catch (msgErr) {
              console.error('Error fetching messages:', msgErr);
              setChatMessages([]);
            }
          }
        } catch (err) {
          if (DEBUG) console.error('❌ Error fetching room by chatRoomId:', err);
          setError('❌ Không tìm thấy phòng chat');
          setRoom(null);
          setChatMessages([]);
        }
      } else if (reportData.postId) {
        // ✅ Fallback: Nếu không có chatRoomId, match bằng postId
        if (DEBUG) console.log('⚠️ No chatRoomId, trying postId match...');
        
        try {
          const conversationsData = await chatApi.getConversations(0, 100);
          
          let conversations = [];
          if (conversationsData?.data?.rooms && Array.isArray(conversationsData.data.rooms)) {
            conversations = conversationsData.data.rooms;
          } else if (conversationsData?.rooms && Array.isArray(conversationsData.rooms)) {
            conversations = conversationsData.rooms;
          } else if (Array.isArray(conversationsData)) {
            conversations = conversationsData;
          }

          const matchedRoom = conversations.find(
            room => String(room.postId) === String(reportData.postId)
          );

          if (matchedRoom) {
            if (DEBUG) console.log('✅ Room matched via postId:', matchedRoom);
            setRoom(matchedRoom);

            try {
              const messagesData = await chatApi.getMessages(matchedRoom.id);
              let messages = Array.isArray(messagesData) ? messagesData : [];
              setChatMessages(messages);
            } catch (msgErr) {
              console.error('Error fetching messages:', msgErr);
              setChatMessages([]);
            }
          } else {
            if (DEBUG) console.error('❌ No room match via postId');
            setError('❌ Không tìm thấy phòng chat');
          }
        } catch (err) {
          console.error('Error fetching conversations:', err);
          setError('Không thể tải danh sách phòng chat');
        }
      } else {
        setError('❌ Report không có chatRoomId hoặc postId');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle resolve - Normal
  const handleResolveNormal = async () => {
    if (!window.confirm('Xác nhận: Bình thường (không hoàn tiền)?')) return;

    if (!room?.id) {
      alert('❌ Lỗi: Không tìm thấy roomId');
      return;
    }

    try {
      setResolving(true);
      
      // ✅ PUT /grabtutor/room/resolve?roomId={roomId}&isNormal=true
      await reportApi.resolveReport(room.id, true);
      
      alert('✅ Đã giải quyết: RESOLVED_NORMAL');
      navigate('/admin/interactions');
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolving(false);
    }
  };

  // ✅ Handle resolve - Refund
  const handleResolveRefund = async () => {
    if (!window.confirm('Xác nhận: Hoàn tiền & kết thúc?')) return;

    if (!room?.id) {
      alert('❌ Lỗi: Không tìm thấy roomId');
      return;
    }

    try {
      setResolving(true);
      
      // ✅ PUT /grabtutor/room/resolve?roomId={roomId}&isNormal=false
      await reportApi.resolveReport(room.id, false);
      
      alert('✅ Đã giải quyết: RESOLVED_REFUND (đã hoàn tiền)');
      navigate('/admin/interactions');
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mb-4" />
            <p className="text-gray-600 text-lg">Đang tải chi tiết báo cáo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-red-600 font-semibold mb-4">❌ Báo cáo không tìm thấy</p>
          {error && <p className="text-gray-600 mb-6">{error}</p>}
          <button
            onClick={() => navigate('/admin/interactions')}
            className="px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/interactions')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Quay lại
          </button>
          <h1 className="text-4xl md:text-5xl font-bold">📋 Chi tiết Báo cáo</h1>
          <p className="text-teal-100 mt-2">Report #{report.id?.slice(0, 12) || 'N/A'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'detail'
                ? 'text-[#03ccba] border-b-2 border-[#03ccba]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Chi tiết báo cáo
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'text-[#03ccba] border-b-2 border-[#03ccba]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaComments size={16} />
            💬 Đoạn chat ({chatMessages.length})
          </button>
        </div>

        {/* Tab Content - Detail */}
        {activeTab === 'detail' && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Report Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-l-4 border-[#03ccba]">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">📊 Status</p>
                <p className="text-2xl font-bold text-[#03ccba]">{report.status || 'PENDING'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">🆔 Report ID</p>
                <p className="text-lg font-mono text-gray-900">{report.id?.slice(0, 16) || 'N/A'}...</p>
              </div>
            </div>

            {/* Report Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaCalendar size={14} /> Ngày báo cáo
                </p>
                <p className="text-base font-bold text-gray-900">{formatDate(report.createdAt)}</p>
              </div>

              {/* Post ID */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaFileAlt size={14} /> Post ID
                </p>
                <p className="text-base font-mono text-gray-900">{report.postId?.slice(0, 16) || 'N/A'}...</p>
              </div>

              {/* Room Found */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaComments size={14} /> Phòng chat
                </p>
                <p className={`text-base font-bold ${room ? 'text-green-600' : 'text-red-600'}`}>
                  {room ? `✅ ${room.id?.slice(0, 12)}...` : '❌ Không tìm thấy'}
                </p>
              </div>

              {/* Sender */}
              {report.senderId && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                    <FaUser size={14} /> Người báo cáo
                  </p>
                  <p className="text-base font-mono text-gray-900">{report.senderId?.slice(0, 16) || 'N/A'}...</p>
                </div>
              )}
            </div>

            {/* Report Detail Content */}
            <div className="border-t pt-6">
              <p className="text-gray-600 text-sm font-semibold mb-3 flex items-center gap-2">
                <FaFileAlt size={14} /> Nội dung báo cáo
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-500">
                <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {report.detail || 'Không có nội dung'}
                </p>
              </div>
            </div>

            {/* Resolve Buttons */}
            {room ? (
              <div className="border-t pt-6 space-y-4">
                <p className="text-gray-700 font-semibold mb-4">
                  🔧 Chọn hành động để giải quyết báo cáo:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Normal Button */}
                  <button
                    onClick={handleResolveNormal}
                    disabled={resolving}
                    className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {resolving ? (
                      <>
                        <FaSpinner className="animate-spin" size={16} />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck size={16} />
                        <span>✅ Bình thường (Không hoàn tiền)</span>
                      </>
                    )}
                  </button>

                  {/* Refund Button */}
                  <button
                    onClick={handleResolveRefund}
                    disabled={resolving}
                    className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {resolving ? (
                      <>
                        <FaSpinner className="animate-spin" size={16} />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle size={16} />
                        <span>💰 Hoàn tiền</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-semibold">❌ Không thể giải quyết</p>
                <p className="text-red-600 text-sm mt-1">
                  Không tìm thấy phòng chat tương ứng. Kiểm tra lại postId hoặc thử tải lại trang.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Chat */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không có tin nhắn</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#03ccba] hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{msg.email || msg.senderEmail || 'User'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <p className="text-gray-700 mt-2 text-base leading-relaxed">
                      {msg.message || msg.content || 'No content'}
                    </p>

                    {/* File Attachment */}
                    {(msg.fileUrl || msg.file) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <a 
                          href={msg.fileUrl || msg.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#03ccba] text-sm font-semibold hover:underline flex items-center gap-2"
                        >
                          📎 {msg.fileName || 'File'}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}