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
    // ✅ Clear success when user starts typing again
    if (success) setSuccess(false);
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
      
      // ✅ Reset form
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
    // ==================== BACKDROP - BLUR ==================== 
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* ==================== MODAL CONTAINER ==================== */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        
        {/* ==================== HEADER ==================== */}
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🤝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Submit Bid</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* ==================== CONTENT ==================== */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex gap-3 animate-slide-down">
              <FaCheck className="text-green-600 flex-shrink-0 text-lg mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">✅ Bid submitted successfully!</p>
                <p className="text-xs text-green-600">Closing in a moment...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-3 animate-shake">
              <FaExclamationCircle className="text-red-600 flex-shrink-0 text-lg mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* ==================== POST INFO ==================== */}
          <div className="bg-gradient-to-br from-[#03ccba]/10 to-[#02b5a5]/10 border-l-4 border-[#03ccba] rounded-lg p-4">
            <p className="text-xs text-[#03ccba] font-bold uppercase mb-2 tracking-wide">Question</p>
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-xs text-gray-600 line-clamp-2">{post.description?.substring(0, 80)}...</p>
          </div>

          {/* ==================== FORM FIELDS ==================== */}
          
          {/* Proposed Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              💰 Proposed Price (VNĐ/hour)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="proposedPrice"
                value={formData.proposedPrice}
                onChange={handleInputChange}
                placeholder="50000"
                min="50000"
                step="10000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all disabled:bg-gray-50 text-base font-medium"
                disabled={loading}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">VNĐ</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">💡 Minimum: 50,000 VNĐ</p>
          </div>

          {/* Question Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📊 Question Level
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="questionLevel"
              value={formData.questionLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white disabled:bg-gray-50 text-base font-medium"
              disabled={loading}
            >
              <option value="EASY">🟢 Easy</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HARD">🔴 Hard</option>
              <option value="VERY_HARD">⚫ Very Hard</option>
            </select>
          </div>

          {/* Description / Approach */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ✍️ Your Approach / Solution
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe how you would solve this question..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none disabled:bg-gray-50 text-base font-medium"
              disabled={loading}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">Min: 10 characters</p>
              <p className={`text-xs font-semibold ${
                formData.description.length > 450 ? 'text-red-500' : 'text-gray-600'
              }`}>
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* ==================== BUTTONS ==================== */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || success}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg hover:shadow-[#03ccba]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base flex items-center justify-center gap-2"
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