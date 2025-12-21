import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, FaStar, FaEdit, FaTrash, FaTimes, FaSpinner, 
  FaBox, FaChevronLeft, FaChevronRight, FaCalendar, FaUser 
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import reviewApi from '../../api/reviewApi';

export default function MyReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==================== STATES ====================
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editStars, setEditStars] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [hoveredStars, setHoveredStars] = useState(0);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!user || user.role !== 'USER') {
      navigate('/login-role');
      return;
    }
    fetchMyReviews();
  }, [user, pageNo]);

  // ==================== API CALLS ====================
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewApi.getReviewByUserId(user.userId, pageNo, pageSize);

      console.log('Response:', response);
      
      // ✅ Đúng: response.items = [{ stars, description, ... }]
      let items = [];
      let totalPagesValue = 0;

      if (response?.items && Array.isArray(response.items)) {
        items = response.items;
        totalPagesValue = response.totalPages || 0;
      }

      setReviews(items);
      setTotalPages(totalPagesValue);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT - Open modal
  const handleOpenEdit = (review) => {
    console.log('Opening edit modal for review:', review.id);
    setEditingReview(review);
    setEditStars(review.stars);
    setEditDescription(review.description || '');
    setEditError(null);
    setShowEditModal(true);
  };

  // ✅ EDIT - Close modal
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingReview(null);
    setEditStars(0);
    setEditDescription('');
    setEditError(null);
  };

  // ✅ EDIT - Submit
  const handleEditSubmit = async () => {
    if (!editingReview) return;

    if (editStars === 0) {
      setEditError('⭐ Vui lòng chọn số sao');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);

      console.log('=== Updating review START ===');
      console.log('reviewId:', editingReview.id);
      console.log('Payload:', { stars: editStars, description: editDescription });

      await reviewApi.updateReview(editingReview.id, {
        stars: editStars,
        description: editDescription
      });

      console.log('✅ Review updated successfully');
      alert('✅ Review updated successfully!');
      
      handleCloseEdit();
      await fetchMyReviews();
    } catch (err) {
      console.error('❌ Error updating review:', err);
      setEditError(err.response?.data?.message || err.message || 'Error updating review');
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ DELETE - Open confirmation
  const handleOpenDelete = (reviewId) => {
    console.log('Opening delete confirmation for review:', reviewId);
    setDeletingReviewId(reviewId);
    setShowDeleteConfirm(true);
  };

  // ✅ DELETE - Confirm
  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;

    try {
      setDeleteLoading(true);

      console.log('=== Deleting review START ===');
      console.log('reviewId:', deletingReviewId);

      await reviewApi.deleteReview(deletingReviewId);

      console.log('✅ Review deleted successfully');
      alert('✅ Review deleted successfully!');
      
      setShowDeleteConfirm(false);
      setDeletingReviewId(null);
      setPageNo(0);
      await fetchMyReviews();
    } catch (err) {
      console.error('❌ Error deleting review:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==================== HANDLERS ====================
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
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
            onClick={() => navigate('/posts/inventory')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-teal-100 hover:text-white"
          >
            <FaArrowLeft /> Back to My Posts
          </button>
          <h1 className="text-4xl font-bold mb-2">⭐ My Reviews</h1>
          <p className="text-teal-100">
            Manage the reviews you've sent to tutors
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tổng Reviews */}
              <div className="text-center">
                <p className="text-gray-600 text-sm font-semibold mb-2">Tổng Reviews</p>
                <p className="text-4xl font-bold text-[#03ccba]">{reviews.length}</p>
              </div>
              
              {/* Trang */}
              <div className="text-center">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(review)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit Review"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(review.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete Review"
                    >
                      <FaTrash size={16} />
                    </button>
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

                {/* Post Info */}
                <div className="text-xs text-gray-500">
                  <p>Review ID: {review.id.slice(0, 8)}...</p>
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
              When you review a tutor, it will appear here
            </p>
            <button
              onClick={() => navigate('/posts')}
              className="mt-6 px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
            >
              Đi Tìm Gia Sư
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

      {/* ==================== EDIT MODAL ==================== */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">✏️ Chỉnh Sửa Review</h2>
              <button
                onClick={handleCloseEdit}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Error */}
            {editError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                {editError}
              </div>
            )}

            {/* Stars */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditStars(star)}
                    onMouseEnter={() => setHoveredStars(star)}
                    onMouseLeave={() => setHoveredStars(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    disabled={editLoading}
                  >
                    <FaStar
                      size={40}
                      className={`${
                        star <= (hoveredStars || editStars)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {editStars > 0 && (
                <p className="text-sm text-center text-gray-600 mt-2">
                  <strong>{editStars}/5 sao</strong>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bình luận (tùy chọn)
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                maxLength={500}
                disabled={editLoading}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none text-sm disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {editDescription.length}/500 ký tự
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={editLoading}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={editLoading || editStars === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-bold transition-all flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaStar size={16} />
                    Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">🗑️ Delete Review</h2>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingReviewId(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold transition-all flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}