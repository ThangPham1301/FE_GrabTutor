import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFlag, FaExclamationTriangle } from 'react-icons/fa';

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or Fraud' },
  { id: 'inappropriate', label: 'Inappropriate Content' },
  { id: 'fake', label: 'False Information' },
  { id: 'offensive', label: 'Offensive Language' },
  { id: 'other', label: 'Other Reason' }
];

export default function ReportPost() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle report submission here
    console.log({ postId, reason, description });
    // Show success message and redirect
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaFlag className="text-red-500 text-xl" />
              <h1 className="text-2xl font-bold text-gray-900">Report Post</h1>
            </div>
            <button
              onClick={() => navigate(`/posts/${postId}`)}
              className="text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Warning message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-400 mr-3" />
              <p className="text-sm text-yellow-700">
                Please only report posts that violate community guidelines.
                False reports may result in restrictions on your account access.
              </p>
            </div>
          </div>

          {/* Report form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Report
              </label>
              <div className="space-y-3">
                {REPORT_REASONS.map((reportReason) => (
                  <div key={reportReason.id} className="flex items-center">
                    <input
                      type="radio"
                      id={reportReason.id}
                      name="reportReason"
                      value={reportReason.id}
                      checked={reason === reportReason.id}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-[#03ccba] focus:ring-[#03ccba] border-gray-300"
                    />
                    <label
                      htmlFor={reportReason.id}
                      className="ml-3 text-sm text-gray-700"
                    >
                      {reportReason.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please provide additional information about the issue..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
              />
            </div>

            {/* Submit buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/posts/${postId}`)}
                className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}