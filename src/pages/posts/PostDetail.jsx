import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFlag, FaUserCircle, FaMapMarkerAlt, FaBook, FaClock, FaDollarSign } from 'react-icons/fa';
import axios from 'axios';

export default function PostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to load post details');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleContactTutor = async () => {
    try {
      await axios.put(`/api/posts/accept`, { postId: id });
      // Redirect to chat or show success message
      navigate('/chat'); // Assuming you have a chat route
    } catch (err) {
      console.error('Error accepting post:', err);
      // Show error message to user
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/all-posts')}
              className="text-gray-600 hover:text-gray-900"
            >
              &larr; Quay lại
            </button>
            <button
              onClick={() => navigate(`/posts/${id}/report`)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <FaFlag /> Báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Title and status */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{post.description}</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              !post.accepted 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {!post.accepted ? 'Đang tìm' : 'Đã nhận'}
            </span>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-6">
            <FaUserCircle className="text-gray-400 text-xl" />
            <div>
              <p className="font-medium">{post.user?.fullName || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">{post.user?.role || 'User'}</p>
            </div>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FaBook className="text-[#03ccba]" />
              <div>
                <p className="text-sm text-gray-500">Môn học</p>
                <p className="font-medium">{post.subject?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#03ccba]" />
              <div>
                <p className="text-sm text-gray-500">Địa điểm</p>
                <p className="font-medium">{post.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaClock className="text-[#03ccba]" />
              <div>
                <p className="text-sm text-gray-500">Lịch học</p>
                <p className="font-medium">{post.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-[#03ccba]" />
              <div>
                <p className="text-sm text-gray-500">Học phí</p>
                <p className="font-medium">{post.fee}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
            <p className="text-gray-700 whitespace-pre-line">{post.description}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/all-posts')}
              className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Quay lại
            </button>
            {!post.accepted && (
              <button
                onClick={handleContactTutor}
                className="flex-1 px-6 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
              >
                Nhận dạy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}