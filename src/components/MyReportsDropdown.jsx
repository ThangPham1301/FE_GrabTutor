import React, { useState, useEffect } from 'react';
import { FaFlag, FaSpinner, FaExternalLinkAlt, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import reportApi from '../api/reportApi';

const DEBUG = true;

export default function MyReportsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchMyReports();
    }
  }, [user]);

  // ✅ Fetch reports
  const fetchMyReports = async () => {
    try {
      setLoading(true);
      
      let reportData = [];
      
      if (user.role === 'USER') {
        // ✅ Student: Get reports HE/SHE sent
        const response = await reportApi.getReportBySenderId(user.userId, 0, 10);
        reportData = response?.data || response || [];
      } else if (user.role === 'TUTOR') {
        // ✅ Tutor: Get reports AGAINST him/her
        const response = await reportApi.getReportByReceivedId(user.userId, 0, 10);
        reportData = response?.data || response || [];
      }
      
      if (Array.isArray(reportData)) {
        setReports(reportData);
      } else {
        setReports([]);
      }
      
      if (DEBUG) console.log('📋 My Reports loaded:', reportData.length);
    } catch (error) {
      console.error('Error fetching my reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // ✅ Format date
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

  if (!user) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <FaFlag size={16} className="text-red-600" />
          {user.role === 'USER' ? 'My Reports' : 'Reports Against Me'}
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            {reports.length}
          </span>
        </h4>
        <button
          onClick={fetchMyReports}
          disabled={loading}
          className="text-xs text-[#03ccba] hover:text-[#02b5a5] font-semibold disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {loading && reports.length === 0 ? (
          <div className="flex justify-center items-center py-6">
            <FaSpinner className="animate-spin text-[#03ccba] text-lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FaFlag size={20} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {user.role === 'USER' 
                ? 'No reports sent yet' 
                : 'No reports against you'}
            </p>
          </div>
        ) : (
          reports.map(report => (
            <div
              key={report.id}
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 border-red-400 group"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  {/* Status Badge */}
                  <div className="mb-1 flex items-center gap-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(report.reportStatus)}`}>
                      {report.reportStatus || 'PENDING'}
                    </span>
                  </div>

                  {/* Detail Preview */}
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {report.detail || 'No detail'}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FaCalendar size={10} />
                    {formatDate(report.createdAt)}
                  </p>

                  {/* User Info */}
                  {user.role === 'USER' && report.receiverEmail && (
                    <p className="text-xs text-gray-600 mt-1">
                      Against: {report.receiverEmail}
                    </p>
                  )}

                  {user.role === 'TUTOR' && report.senderEmail && (
                    <p className="text-xs text-gray-600 mt-1">
                      By: {report.senderEmail}
                    </p>
                  )}
                </div>

                {/* View Button */}
                {report.id && (
                  <button
                    onClick={() => navigate(`/admin/report/${report.id}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#03ccba] hover:text-[#02b5a5] flex-shrink-0"
                    title="View Details"
                  >
                    <FaExternalLinkAlt size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {reports.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate('/my-reports')}
            className="text-xs text-[#03ccba] hover:text-[#02b5a5] font-semibold"
          >
            View All →
          </button>
        </div>
      )}
    </div>
  );
}