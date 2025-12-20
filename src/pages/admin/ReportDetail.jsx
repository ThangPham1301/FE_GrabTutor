import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaCheck,
  FaTimesCircle,
  FaComments,
  FaCalendar,
  FaUser,
  FaFileAlt,
  FaImage,
  FaEnvelope,
  FaClock,
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import reportApi from '../../api/reportApi';
import chatApi from '../../api/chatApi';
import postApi from '../../api/postApi';
import userApi from '../../api/userApi';

const DEBUG = true;

export default function ReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  // State
  const [report, setReport] = useState(null);
  const [room, setRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [post, setPost] = useState(null);
  const [reporter, setReporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const [error, setError] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  // ==================== API CALLS ====================

  // ✅ Fetch Report Detail
  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEBUG) console.log('📋 Fetching report detail...');

      // STEP 1: Get report data
      const reportData = await reportApi.getReportById(reportId);
      if (DEBUG) console.log('📋 Report data:', reportData);
      setReport(reportData);

      // STEP 2: Fetch post by postId to get imageUrl
      if (reportData?.postId) {
        try {
          if (DEBUG) console.log('📷 Fetching post for image...', reportData.postId);
          const postData = await postApi.getPostById(reportData.postId);
          const postDetail = postData?.data?.data || postData?.data || postData;
          if (DEBUG) console.log('📷 Post data:', postDetail);
          setPost(postDetail);
        } catch (postErr) {
          console.error('❌ Error fetching post:', postErr);
        }
      }

      // STEP 3: Fetch reporter info by senderId
      if (reportData?.senderId) {
        try {
          if (DEBUG) console.log('👤 Fetching reporter info...', reportData.senderId);
          const users = await userApi.getAllUsers(0, 1000);
          let usersList = [];
          if (users.data?.items && Array.isArray(users.data.items)) {
            usersList = users.data.items;
          } else if (Array.isArray(users.data)) {
            usersList = users.data;
          }
          const reporterUser = usersList.find(
            (u) => u.id === reportData.senderId || String(u.id) === String(reportData.senderId)
          );
          if (DEBUG) console.log('👤 Reporter:', reporterUser);
          setReporter(reporterUser);
        } catch (userErr) {
          console.error('❌ Error fetching reporter:', userErr);
        }
      }

      // STEP 4: Fetch chat room by chatRoomId
      if (reportData?.chatRoomId) {
        try {
          if (DEBUG) console.log('💬 Fetching room...', reportData.chatRoomId);
          const roomData = await chatApi.getRoomById(reportData.chatRoomId);
          if (DEBUG) console.log('💬 Room data:', roomData);
          setRoom(roomData);

          // STEP 5: Fetch messages from room
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
              if (DEBUG) console.log('💬 Messages loaded:', messages.length);
            } catch (msgErr) {
              console.error('❌ Error fetching messages:', msgErr);
              setChatMessages([]);
            }
          }
        } catch (roomErr) {
          console.error('❌ Error fetching room:', roomErr);
          setError('Unable to load chat room');
        }
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  // ✅ Handle Resolve - Normal
  const handleResolveNormal = async () => {
    if (!window.confirm('Confirm: Mark as Resolved (Normal)? No refund will be issued.'))
      return;

    if (!room?.id) {
      alert('❌ Error: Room ID not found');
      return;
    }

    try {
      setResolving(true);
      await reportApi.resolveReport(room.id, true);
      alert('✅ Report resolved: RESOLVED_NORMAL');
      navigate('/admin/interactions');
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolving(false);
    }
  };

  // ✅ Handle Resolve - Refund
  const handleResolveRefund = async () => {
    if (!window.confirm('Confirm: Mark as Resolved (Refund)? Student will be refunded.'))
      return;

    if (!room?.id) {
      alert('❌ Error: Room ID not found');
      return;
    }

    try {
      setResolving(true);
      await reportApi.resolveReport(room.id, false);
      alert('✅ Report resolved: RESOLVED_REFUND (refund issued)');
      navigate('/admin/interactions');
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolving(false);
    }
  };

  // ==================== HELPERS ====================

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800' },
      REVIEWED: { text: '👁️ Under Review', color: 'bg-blue-100 text-blue-800' },
      RESOLVED_NORMAL: { text: '✅ Resolved (Normal)', color: 'bg-green-100 text-green-800' },
      RESOLVED_REFUND: { text: '✅ Resolved (Refund)', color: 'bg-green-100 text-green-800' },
      RESOLVED: { text: '✅ Resolved', color: 'bg-green-100 text-green-800' },
    };
    return badges[status] || { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mb-4" />
            <p className="text-gray-600 text-lg">Loading report details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">❌ {error}</p>
            <button
              onClick={() => navigate('/admin/interactions')}
              className="px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-all"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/interactions')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Back to Reports
          </button>
          <h1 className="text-4xl md:text-5xl font-bold">📋 Report Details</h1>
          {report && (
            <p className="text-teal-100 mt-2">
              Reported on {formatDate(report.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ==================== TABS ==================== */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'detail'
                ? 'text-[#03ccba] border-b-2 border-[#03ccba]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Report Details
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'text-[#03ccba] border-b-2 border-[#03ccba]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaComments /> Chat ({chatMessages.length})
          </button>
        </div>

        {/* ==================== TAB: DETAIL ==================== */}
        {activeTab === 'detail' && report && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#03ccba]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Report Information</h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    getStatusBadge(report.status).color
                  }`}
                >
                  {getStatusBadge(report.status).text}
                </span>
              </div>
              <p className="text-gray-600">
                {report.status === 'PENDING'
                  ? 'This report is awaiting review'
                  : 'This report has been resolved'}
              </p>
            </div>

            {/* ✅ Post Image Display */}
            {post?.imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-4">
                  <FaImage size={16} /> Post Image
                </p>
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 max-w-md">
                  <img
                    src={post.imageUrl}
                    alt={post.title || 'Post image'}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  {post.title && (
                    <p className="text-sm text-gray-600 mt-3 font-semibold">
                      📄 {post.title}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reporter Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaCalendar size={14} /> Report Date
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(report.createdAt)}
                </p>
              </div>

              {/* Reporter Email */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaEnvelope size={14} /> Reporter Email
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {reporter?.email || 'Unknown Email'}
                </p>
                {reporter?.fullName && (
                  <p className="text-sm text-gray-600 mt-1">
                    {reporter.fullName}
                  </p>
                )}
              </div>

              {/* Post ID */}
              {report.postId && (
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                    <FaFileAlt size={14} /> Post ID
                  </p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {report.postId}
                  </p>
                </div>
              )}

              {/* Chat Room Status */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                <p className="text-gray-600 text-sm font-semibold flex items-center gap-2 mb-2">
                  <FaComments size={14} /> Chat Room
                </p>
                <p className={`text-lg font-bold ${room ? 'text-green-600' : 'text-red-600'}`}>
                  {room ? `✅ Found` : '❌ Not Found'}
                </p>
              </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-3 flex items-center gap-2">
                <FaFileAlt size={14} /> Report Content
              </p>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {report.detail || 'No content provided'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {report.status === 'PENDING' && room && (
              <div className="bg-white rounded-lg shadow-md p-6 border-t">
                <p className="text-gray-700 font-semibold mb-4">
                  🔧 Choose an action to resolve this report:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleResolveNormal}
                    disabled={resolving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {resolving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck size={16} />
                        Resolve (Normal)
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleResolveRefund}
                    disabled={resolving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {resolving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck size={16} />
                        Resolve (Refund)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!room && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 font-semibold">❌ Cannot Resolve</p>
                <p className="text-red-600 text-sm mt-1">
                  Chat room not found. Check postId or try refreshing the page.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: CHAT ==================== */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaComments /> Chat Messages ({chatMessages.length})
              </h2>
              <p className="text-teal-100 text-sm mt-1">
                Conversation between reporter and tutee
              </p>
            </div>

            {/* Messages Container */}
            <div className="p-6">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">No messages found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    There are no messages in this chat conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(msg.email || msg.senderEmail)?.charAt(0).toUpperCase() || 'U'}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        {/* Email & Time */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <FaEnvelope size={12} className="text-gray-500" />
                            {msg.email || msg.senderEmail || 'Unknown'}
                          </p>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FaClock size={10} />
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>

                        {/* Message Text */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700 break-words">
                            {msg.content || msg.message || 'No content'}
                          </p>
                        </div>

                        {/* Attachment */}
                        {(msg.fileUrl || msg.file) && (
                          <div className="mt-2">
                            <a
                              href={msg.fileUrl || msg.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#03ccba] hover:underline text-sm font-semibold flex items-center gap-1"
                            >
                              <FaFileAlt size={12} />
                              View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}