import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, FaStar, FaSpinner, FaBox, FaChevronLeft, FaChevronRight, 
  FaCalendar, FaUser, FaChartBar 
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import reviewApi from '../../api/reviewApi';

export default function MyReceivedReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==================== STATES ====================
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login-role');
      return;
    }
    fetchMyReceivedReviews();
  }, [user, pageNo]);

  // ==================== API CALLS ====================
  const fetchMyReceivedReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== fetchMyReceivedReviews START ===');
      console.log('userId (receiverId):', user.userId);
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await reviewApi.getReviewsByReceiverId(user.userId, pageNo, pageSize);

      console.log('=== fetchMyReceivedReviews SUCCESS ===');
      console.log('Response:', response);

      let items = [];
      let totalPagesValue = 0;

      // ✅ Handle response structure
      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
        totalPagesValue = response.totalPages || 0;
      } else if (Array.isArray(response)) {
        items = response;
      }

      console.log('📋 Received reviews count:', items.length);
      items.forEach((review, idx) => {
        console.log(`[Review ${idx}]:`);
        console.log('  - id:', review.id);
        console.log('  - stars:', review.stars);
        console.log('  - description:', review.description);
        console.log('  - senderId:', review.senderId);
        console.log('  - createdAt:', review.createdAt);
      });

      setReviews(items);
      setTotalPages(totalPagesValue);
    } catch (err) {
      console.error('❌ Error fetching received reviews:', err);
      setError(err.response?.data?.message || err.message || 'Unable to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // ✅ Calculate average stars
  const calculateAverageStars = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.stars || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/courses/inventory')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-teal-100 hover:text-white"
          >
            <FaArrowLeft /> Back to Inventory
          </button>
          <h1 className="text-4xl font-bold mb-2">⭐ My Received Reviews</h1>
          <p className="text-teal-100">
            Xem các đánh giá từ học sinh
          </p>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Stats */}
        {reviews.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tổng Reviews */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <FaBox size={24} className="text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Tổng Reviews</p>
                <p className="text-4xl font-bold text-[#03ccba]">{reviews.length}</p>
              </div>

              {/* Trung bình Sao */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <FaStar size={24} className="text-yellow-400" />
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Trung bình Sao</p>
                <p className="text-4xl font-bold text-yellow-400">
                  {calculateAverageStars()}
                </p>
              </div>

              {/* Trang */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <FaChartBar size={24} className="text-green-600" />
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Trang</p>
                <p className="text-4xl font-bold text-[#03ccba]">
                  {pageNo + 1} / {totalPages || 1}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    {/* Stars */}
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={20}
                          className={i < review.stars ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm font-bold text-gray-700 ml-2">
                        {review.stars}/5 sao
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCalendar size={12} />
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {review.description && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{review.description}"
                    </p>
                  </div>
                )}

                {/* Reviewer Info & Post Info */}
                <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUser size={12} />
                    <p>From: {review.senderId?.slice(0, 12)}...</p>
                  </div>
                  {review.postId && (
                    <p>Post ID: {review.postId.slice(0, 8)}...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-lg p-12 border-2 border-dashed border-gray-300">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Chưa có reviews nào</p>
            <p className="text-gray-500 text-sm">
              When students review you, it will appear here
            </p>
            <button
              onClick={() => navigate('/posts')}
              className="mt-6 px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
            >
              Xem Câu Hỏi
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-8 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaChevronLeft size={16} /> Previous
            </button>

            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-semibold">
                Page {pageNo + 1} of {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next <FaChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}