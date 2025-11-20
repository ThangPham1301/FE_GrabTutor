import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaFlag, FaCalendar, FaUser, FaExternalLinkAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import reportApi from '../api/reportApi';

const DEBUG = true;

export default function MyReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user || !['USER', 'TUTOR'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [user, pageNo]);

  // ✅ Fetch Reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (user.role === 'USER') {
        // ✅ Student: Get reports sent by him/her
        response = await reportApi.getReportBySenderId(user.userId, pageNo, pageSize);
      } else if (user.role === 'TUTOR') {
        // ✅ Tutor: Get reports received (against him/her)
        response = await reportApi.getReportByReceivedId(user.userId, pageNo, pageSize);
      }

      if (DEBUG) console.log('Reports response:', response);

      let reportList = [];
      if (response?.data?.items && Array.isArray(response.data.items)) {
        reportList = response.data.items;
      } else if (response?.data && Array.isArray(response.data)) {
        reportList = response.data;
      } else if (Array.isArray(response)) {
        reportList = response;
      }

      setReports(reportList);
      setTotalPages(response?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  // ✅ Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <FaClock className="text-yellow-600" size={18} />;
      case 'RESOLVED':
        return <FaCheckCircle className="text-green-600" size={18} />;
      default:
        return <FaFlag className="text-gray-600" size={18} />;
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Back to Profile
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaFlag size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                {user?.role === 'USER' 
                  ? '📋 My Reports Sent' 
                  : '⚠️ Reports Against Me'}
              </h1>
              <p className="text-red-100 mt-2">
                {user?.role === 'USER'
                  ? 'View all reports you have submitted'
                  : 'View all reports filed against your account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <FaSpinner className="animate-spin text-5xl text-red-600 mb-4" />
              <p className="text-gray-600 text-lg">Loading reports...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
            <FaFlag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-semibold">
              {user?.role === 'USER'
                ? 'You haven\'t submitted any reports yet'
                : 'No reports have been filed against you'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {user?.role === 'USER'
                ? 'If you find any inappropriate content, you can submit a report'
                : 'Keep following community guidelines to stay safe'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reports Grid */}
            {reports.map(report => (
              <div
                key={report.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${getStatusColor(report.reportStatus)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Icon */}
                      {getStatusIcon(report.reportStatus)}
                      
                      {/* Status Badge */}
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-bold">
                        {report.reportStatus || 'PENDING'}
                      </span>
                    </div>

                    {/* Detail Content */}
                    <p className="text-gray-900 font-bold text-lg mb-2">
                      {report.detail || 'No detail provided'}
                    </p>

                    {/* Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendar size={14} />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUser size={14} />
                        <span>
                          {user?.role === 'USER'
                            ? `Against: ${report.receiverEmail || 'Unknown'}`
                            : `By: ${report.senderEmail || 'Unknown'}`}
                        </span>
                      </div>

                      {/* Post ID */}
                      {report.postId && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-semibold">Post:</span>
                          <code className="bg-black bg-opacity-10 px-2 py-1 rounded text-xs">
                            {report.postId.slice(0, 8)}...
                          </code>
                        </div>
                      )}

                      {/* Chat Room ID */}
                      {report.chatRoomId && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-semibold">Chat:</span>
                          <code className="bg-black bg-opacity-10 px-2 py-1 rounded text-xs">
                            {report.chatRoomId.slice(0, 8)}...
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - View Button */}
                  <button
                    onClick={() => navigate(`/admin/report/${report.id}`)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 flex-shrink-0"
                    title="View Full Details"
                  >
                    <FaExternalLinkAlt size={14} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {reports.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t">
            <button
              onClick={() => setPageNo(Math.max(0, pageNo - 1))}
              disabled={pageNo === 0}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            
            <span className="text-gray-600 font-semibold">
              Page {pageNo + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setPageNo(Math.min(totalPages - 1, pageNo + 1))}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}