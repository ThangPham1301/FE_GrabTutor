import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Simple: If not logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPostDetail();
  }, [postId, user, navigate]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching post:', postId);
      const response = await postApi.getPostById(postId);
      console.log('Post response:', response);
      setPost(response.data || response);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // ✅ Redirect happens in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Post not found'}</p>
            <button
              onClick={() => navigate('/posts/browse')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-5xl font-bold mb-2">{post.title}</h1>
          <p className="text-teal-100">{post.subject?.name || 'General'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Post Description */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
            </div>

            {/* Post Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ℹ️ Post Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.location && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">📍 Location</p>
                    <p className="text-lg font-bold text-gray-900">{post.location}</p>
                  </div>
                )}
                {post.fee && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">💰 Fee</p>
                    <p className="text-lg font-bold text-[#03ccba]">{post.fee}</p>
                  </div>
                )}
                {post.subject && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">📚 Subject</p>
                    <p className="text-lg font-bold text-gray-900">{post.subject.name}</p>
                  </div>
                )}
                {post.createdAt && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">📅 Posted</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {/* ✅ TUTOR - Submit Bid */}
              {user && user.role === 'TUTOR' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Your Bid</h3>
                  <button
                    onClick={() => {
                      alert('💼 Bid submission coming soon!');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    🤝 Submit Bid
                  </button>
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    Share your approach to help this student
                  </p>
                </>
              )}

              {/* ✅ STUDENT - View Post Info */}
              {user && user.role === 'USER' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Browse Tutors</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Check back soon to see bids from tutors
                  </p>
                  <button
                    className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold cursor-not-allowed"
                    disabled
                  >
                    Waiting for Bids...
                  </button>
                </>
              )}

              {/* Post Status Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <span className={`px-4 py-2 rounded-full font-bold text-sm inline-block ${
                  post.status === 'OPEN'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.status === 'OPEN' ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}