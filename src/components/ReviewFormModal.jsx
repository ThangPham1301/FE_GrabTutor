import React, { useState } from 'react';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';
import reviewApi from '../api/reviewApi';

export default function ReviewFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  postId,
  existingReview = null
}) {
  const [stars, setStars] = useState(existingReview?.stars || 0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [description, setDescription] = useState(existingReview?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ✅ Loại bỏ countdown logic

  const handleClose = () => {
    setStars(0);
    setDescription('');
    setError(null);
    setSubmitted(false);
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError('⭐ Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingReview?.id) {
        // UPDATE
        console.log('Updating review with ID:', existingReview.id);
        await reviewApi.updateReview(existingReview.id, {
          stars,
          description
        });
        console.log('✅ Review updated successfully');
      } else {
        // CREATE
        console.log('Creating new review for post:', postId);
        await reviewApi.createReview(postId, {
          stars,
          description
        });
        console.log('✅ Review created successfully');
      }
      
      setSubmitted(true);
      onSuccess?.();
      
      // Auto close sau 2 giây
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.message || err.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        
        {/* ✅ HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {submitted ? '✅ Thank You!' : existingReview ? '✏️ Edit Review' : '⭐ Write Review'}
          </h2>
          <p className="text-gray-600 text-sm">Share your experience with this tutor</p>
        </div>

        {submitted ? (
          // ✅ SUCCESS STATE
          <div className="text-center space-y-4 py-8">
            <div className="text-5xl">✨</div>
            <p className="text-lg font-bold text-gray-900">Your review has been submitted!</p>
            <p className="text-sm text-gray-600">Thank you for reviewing this tutor</p>
            <div className="flex gap-1 justify-center mt-4">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={24}
                  className={i < stars ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
        ) : (
          // ✅ FORM STATE
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center mb-2">
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
                <p className="text-sm text-center text-gray-600">
                  <strong>{stars}/5 stars</strong>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {description.length}/500 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
              >
                <FaTimes className="inline mr-2" size={16} /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading || stars === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-bold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaStar size={16} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}