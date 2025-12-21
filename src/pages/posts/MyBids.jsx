import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaTrash, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import postApi from '../../api/postApi';
import Navbar from '../../components/Navbar';

export default function MyBids() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }
    fetchMyBids();
  }, [pageNo, user]);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== fetchMyBids START ===');
      
      const response = await postApi.getMyTutorBids(pageNo, pageSize);
      
      console.log('=== fetchMyBids SUCCESS ===');
      console.log('Response:', response.data);
      
      if (response.data?.items) {
        setBids(response.data.items);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setBids([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load your bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <FaCheckCircle className="text-green-600" />;
      case 'REJECTED':
        return <FaTimesCircle className="text-red-600" />;
      case 'PENDING':
        return <FaClock className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/posts')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-5xl font-bold">My Bids</h1>
              <p className="text-lg text-teal-100">Track your submitted proposals</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg px-4 py-3 border-2 border-teal-200">
              <p className="text-teal-700 text-sm font-semibold">Total Bids</p>
              <p className="text-3xl font-bold text-teal-600">{bids.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-4 py-3 border-2 border-green-200">
              <p className="text-green-700 text-sm font-semibold">Accepted</p>
              <p className="text-3xl font-bold text-green-600">
                {bids.filter(b => b.status === 'ACCEPTED').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg px-4 py-3 border-2 border-yellow-200">
              <p className="text-yellow-700 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {bids.filter(b => b.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaEye size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bids Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't submitted any bids. Browse posts and submit your proposals!
            </p>
            <button
              onClick={() => navigate('/posts')}
              className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Browse Posts
            </button>
          </div>
        ) : (
          <>
            {/* Bids Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Bid ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Proposed Price</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Level</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Submitted At</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, index) => (
                      <tr key={bid.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {bid.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-[#03ccba]">
                            {bid.proposedPrice.toLocaleString()} VNĐ
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {bid.questionLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700 max-w-xs truncate">
                            {bid.description}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 w-fit font-semibold ${getStatusColor(bid.status)}`}>
                            {getStatusIcon(bid.status)}
                            {bid.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(bid.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/posts/${bid.postId}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Post"
                            >
                              <FaEye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors font-semibold"
                >
                  ← Previous
                </button>
                <span className="px-6 py-2 bg-white rounded-lg border-2 border-gray-200 font-bold text-gray-900">
                  Page {pageNo + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-6 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-semibold"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}