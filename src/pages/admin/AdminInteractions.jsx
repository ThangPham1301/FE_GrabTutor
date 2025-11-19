import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaEye, FaFlag, FaCalendar } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import reportApi from '../../api/reportApi';

export default function AdminInteractions() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, [pageNo]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== fetchAllReports ===');
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);
      
      const response = await reportApi.getAllReports(pageNo, pageSize);
      
      console.log('Response:', response);
      
      // Handle different response structures
      let items = [];
      let pages = 0;
      
      if (response?.data?.items) {
        items = response.data.items;
        pages = response.data.totalPages || 1;
      } else if (response?.items) {
        items = response.items;
        pages = response.totalPages || 1;
      } else if (Array.isArray(response)) {
        items = response;
        pages = 1;
      }
      
      setReports(items);
      setTotalPages(pages);
      
      console.log('Reports:', items);
      console.log('Total pages:', pages);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) {
      setPageNo(pageNo + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 0) {
      setPageNo(pageNo - 1);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/admin/report/${reportId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Quay lại Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaFlag size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">📊 Quản lý Tương tác</h1>
              <p className="text-teal-100 text-lg mt-1">Xem và xử lý các báo cáo từ người dùng</p>
            </div>
          </div>
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

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <FaSpinner className="animate-spin text-5xl text-[#03ccba] mb-4" />
              <p className="text-gray-600 text-lg">Đang tải báo cáo...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
            <FaFlag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-semibold">Không có báo cáo nào</p>
            <p className="text-gray-400 text-sm mt-2">Khi người dùng báo cáo bài viết, chúng sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reports List */}
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500 p-6"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Left Section - Report Info */}
                  <div className="flex-1 min-w-0">
                    {/* Report ID & Status */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">
                        📝 Report #{report.id?.slice(0, 8) || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(report.status || 'PENDING')}`}>
                        {report.status || 'PENDING'}
                      </span>
                    </div>

                    {/* Detail Content */}
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {report.detail || 'Không có chi tiết'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3 flex-wrap">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <FaCalendar size={14} className="text-[#03ccba]" />
                        <span>
                          {report.createdAt 
                            ? formatDate(report.createdAt)
                            : 'N/A'
                          }
                        </span>
                      </div>

                      {/* Post ID */}
                      {report.postId && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Post ID:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {report.postId.slice(0, 12)}...
                          </code>
                        </div>
                      )}

                      {/* Sender Info */}
                      {report.senderEmail && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Báo cáo bởi:</span>
                          <span>{report.senderEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - View Button */}
                  <button
                    onClick={() => handleViewReport(report.id)}
                    className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <FaEye size={16} />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#03ccba] hover:text-[#03ccba] transition-all font-semibold"
            >
              ← Trang trước
            </button>

            <div className="px-6 py-3 bg-white rounded-lg border-2 border-gray-200">
              <span className="font-bold text-gray-900">
                Trang {pageNo + 1} / {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-semibold"
            >
              Trang sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}