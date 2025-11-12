import React, { useState } from 'react';
import { FaTimes, FaCheck, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import postApi from '../api/postApi';

const DEBUG = true;

export default function TutorBidModal({ isOpen, onClose, onSuccess, post }) {
  const [formData, setFormData] = useState({
    proposedPrice: '',
    questionLevel: 'MEDIUM',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;
  if (!post) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    // Reset success message
    setSuccess(false);

    // Check post
    if (!post || !post.id) {
      setError('❌ Post information is missing');
      return false;
    }

    // Check price
    const priceStr = formData.proposedPrice?.toString().trim();
    if (!priceStr) {
      setError('❌ Please enter proposed price');
      return false;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      setError('❌ Price must be a valid number');
      return false;
    }

    if (price <= 0) {
      setError('❌ Price must be greater than 0');
      return false;
    }

    if (price < 50000) {
      setError('❌ Minimum price is 50,000 VNĐ');
      return false;
    }

    // Check description
    const descStr = formData.description?.toString().trim();
    if (!descStr) {
      setError('❌ Please enter description');
      return false;
    }

    if (descStr.length < 10) {
      setError('❌ Description must be at least 10 characters');
      return false;
    }

    if (descStr.length > 500) {
      setError('❌ Description must be less than 500 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (DEBUG) {
      console.log('=== Submit Bid START ===');
      console.log('formData:', formData);
      console.log('post:', post);
    }

    // Validate
    if (!validateForm()) {
      if (DEBUG) console.log('❌ Validation failed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bidData = {
        proposedPrice: parseFloat(formData.proposedPrice),
        questionLevel: formData.questionLevel,
        description: formData.description.trim(),
        postId: post.id
      };

      if (DEBUG) console.log('Submitting bid:', bidData);

      const response = await postApi.tutorBid(bidData);

      if (DEBUG) console.log('✅ Response:', response);

      setSuccess(true);
      setFormData({
        proposedPrice: '',
        questionLevel: 'MEDIUM',
        description: ''
      });

      // Show success message
      alert('✅ Bid submitted successfully!');

      // Call success callback
      onSuccess?.();

      // Close modal after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('❌ Error:', err);

      const errorMsg = err.response?.data?.message || err.message || 'Error submitting bid';

      const errorMap = {
        'already accepted': '❌ This post has already been accepted',
        'post not found': '❌ Post not found',
        'unauthorized': '❌ You are not authorized',
        'invalid price': '❌ Invalid price',
        'tutor not found': '❌ Tutor not found',
        'forbidden': '❌ You are not a tutor'
      };

      let displayError = errorMsg;
      for (const [key, value] of Object.entries(errorMap)) {
        if (errorMsg.toLowerCase().includes(key)) {
          displayError = value;
          break;
        }
      }

      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">🤝 Submit Bid</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Close"
          >
            <FaTimes size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex gap-3">
              <FaCheck className="text-green-600 flex-shrink-0 text-lg mt-0.5" />
              <p className="text-sm font-semibold text-green-700">
                ✅ Bid submitted successfully! Closing...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-3">
              <FaExclamationCircle className="text-red-600 flex-shrink-0 text-lg mt-0.5" />
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Post Info */}
          <div className="bg-gradient-to-br from-[#03ccba] to-[#02b5a5] text-white rounded-lg p-4">
            <p className="text-xs text-teal-100 font-semibold mb-1">QUESTION</p>
            <h3 className="font-bold text-sm line-clamp-2">{post.title}</h3>
            <p className="text-xs text-teal-100 mt-2">{post.description?.substring(0, 50)}...</p>
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
              placeholder="50000"
              min="50000"
              step="10000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all disabled:bg-gray-100"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">💡 Minimum: 50,000 VNĐ</p>
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="VERY_HARD">Very Hard</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Approach / Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe how you would solve this question... (10-500 characters)"
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none disabled:bg-gray-100"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  <span>Submitting...</span>
                </>
              ) : success ? (
                <>
                  <FaCheck size={16} />
                  <span>Submitted!</span>
                </>
              ) : (
                <>
                  <FaCheck size={16} />
                  <span>Submit Bid</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}