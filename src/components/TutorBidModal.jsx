import React, { useState } from 'react';
import { FaTimes, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import postApi from '../api/postApi';

export default function TutorBidModal({ isOpen, onClose, onSuccess, post }) {
  const [formData, setFormData] = useState({
    proposedPrice: '',
    questionLevel: 'MEDIUM',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.proposedPrice.trim()) {
      setError('Please enter proposed price');
      return;
    }

    if (isNaN(formData.proposedPrice) || parseFloat(formData.proposedPrice) <= 0) {
      setError('Proposed price must be a valid positive number');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bidData = {
        proposedPrice: formData.proposedPrice,
        questionLevel: formData.questionLevel,
        description: formData.description,
        postId: post.id
      };

      console.log('Submitting bid:', bidData);

      await postApi.tutorBid(bidData);

      alert('✅ Bid submitted successfully!');
      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        proposedPrice: '',
        questionLevel: 'MEDIUM',
        description: ''
      });
    } catch (err) {
      console.error('Error submitting bid:', err);
      
      // ✅ NEW - Handle specific error messages
      const errorMessage = err.response?.data?.message || err.message || 'Error submitting bid';
      
      // Map backend error messages to user-friendly Vietnamese messages
      const errorMap = {
        'Post already accepted': '❌ Bài đăng này đã được nhận rồi',
        'Post not found': '❌ Bài đăng không tồn tại',
        'Unauthorized': '❌ Bạn không có quyền thực hiện hành động này',
        'Invalid price': '❌ Giá đề xuất không hợp lệ',
        'Tutor not found': '❌ Gia sư không tồn tại'
      };

      // Check if error message matches any known errors
      let displayMessage = errorMessage;
      for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) {
          displayMessage = value;
          break;
        }
      }

      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Accept Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ✅ NEW - Error Message with Icon */}
          {error && (
            <div className={`border-l-4 p-4 rounded flex gap-3 ${
              error.includes('❌')
                ? 'bg-red-50 border-red-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <FaExclamationCircle className={`flex-shrink-0 text-lg ${
                error.includes('❌') ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <p className={`text-sm font-semibold ${
                error.includes('❌') ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {error}
              </p>
            </div>
          )}

          {/* Post Info - Display Only */}
          <div className="bg-gradient-to-br from-[#03ccba] to-[#02b5a5] text-white rounded-lg p-4">
            <p className="text-xs text-teal-100 font-semibold mb-1">QUESTION</p>
            <h3 className="font-bold text-sm line-clamp-2">{post.title}</h3>
          </div>

          {/* Proposed Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Proposed Price (VNĐ/hour) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="proposedPrice"
              value={formData.proposedPrice}
              onChange={handleInputChange}
              placeholder="Enter your proposed price"
              min="0"
              step="1000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum recommended: 50,000 VNĐ</p>
          </div>

          {/* Question Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Question Level <span className="text-red-500">*</span>
            </label>
            <select
              name="questionLevel"
              value={formData.questionLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all appearance-none bg-white"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="VERY_HARD">Very Hard</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Assess the difficulty level</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description / Approach <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your approach to solve this question..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Explain how you would approach this question</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheck /> Submit Bid
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}