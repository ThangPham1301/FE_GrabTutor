import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import statisticApi from '../../api/statisticApi';

export default function AdminPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postStats, setPostStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchPostStats();
  }, [pageNo]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
      console.log('Posts response:', response);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setPosts(items);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải danh sách bài đăng');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostStats = async () => {
    try {
      const response = await statisticApi.getPostStatus();
      console.log('Post stats:', response);
      setPostStats(response?.data || response);
    } catch (err) {
      console.error('Error fetching post stats:', err);
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      case 'DELETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="animate-spin text-4xl text-[#03ccba]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          <h1 className="text-4xl font-bold">📄 Quản lý Bài đăng</h1>
          <p className="text-teal-100 text-lg mt-2">Xem và quản lý tất cả bài đăng trên hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      {postStats && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <p className="text-gray-600 text-sm">Tất cả</p>
              <p className="text-3xl font-bold text-orange-600">{postStats?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm">Đang mở</p>
              <p className="text-3xl font-bold text-yellow-600">{postStats?.open || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm">Đã đóng</p>
              <p className="text-3xl font-bold text-red-600">{postStats?.closed || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
              <p className="text-gray-600 text-sm">Bị xóa</p>
              <p className="text-3xl font-bold text-gray-600">{postStats?.deleted || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 mx-4 mt-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">STT</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Môn học</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{pageNo * pageSize + index + 1}</td>
                    <td className="px-6 py-3 font-medium max-w-xs truncate">{post.title || 'N/A'}</td>
                    <td className="px-6 py-3">{post.subject?.name || post.subjectName || 'N/A'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(post.status)}`}>
                        {post.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Không có bài đăng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={pageNo === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
          >
            ← Trang trước
          </button>
          <span className="px-4 py-2 font-semibold">
            Trang {pageNo + 1} / {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNo >= totalPages - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Trang sau →
          </button>
        </div>
      </div>
    </div>
  );
}