import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import reviewApi from '../api/reviewApi';

export default function ReviewForm({ postId, onClose, onSuccess, existingReview }) {
  const [stars, setStars] = useState(existingReview?.stars || 0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [description, setDescription] = useState(existingReview?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError('Vui lòng chọn số sao');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingReview?.id) {
        // UPDATE - Dùng reviewId từ existingReview
        console.log('Updating review with ID:', existingReview.id);
        await reviewApi.updateReview(existingReview.id, {
          stars,
          description
        });
        console.log('Review updated successfully');
      } else {
        // CREATE - Dùng postId
        console.log('Creating new review for post:', postId);
        await reviewApi.createReview(postId, {
          stars,
          description
        });
        console.log('Review created successfully');
      }
      // Gọi callback success trước khi đóng modal
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi gửi review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {existingReview ? 'Chỉnh sửa Review' : 'Viết Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoveredStars(star)}
                  onMouseLeave={() => setHoveredStars(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FaStar
                    size={40}
                    className={`${
                      star <= (hoveredStars || stars)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                Bạn đã chọn: <strong>{stars}/5 sao</strong>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận (tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500 ký tự
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || stars === 0}
              className="flex-1 px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  Đang gửi...
                </span>
              ) : existingReview ? (
                'Cập nhật'
              ) : (
                'Gửi Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}