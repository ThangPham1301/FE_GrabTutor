import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft, FaSearch, FaFilter, FaCalendar, FaBook } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';

export default function PostInventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    console.log('=== PostInventory useEffect ===');
    console.log('user:', user);
    
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login-role');
      return;
    }
    fetchSubjects();
    fetchMyPosts();
  }, [pageNo, user, navigate]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await postApi.getSubjects();
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      setSubjects(items);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== fetchMyPosts START ===');
      console.log('user.userId:', user?.userId);
      
      const response = await postApi.getMyPosts(pageNo, pageSize);
      
      console.log('=== fetchMyPosts SUCCESS ===');
      console.log('Full response:', response);
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.data?.items) {
        items = response.data.data.items;
        totalPagesValue = response.data.data.totalPages || 0;
      } else if (response.data?.items) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('Items after processing:', items);
      setPosts(items);
      setTotalPages(totalPagesValue);
    } catch (err) {
      console.error('=== fetchMyPosts ERROR ===');
      console.error('Error:', err.message);
      setError(err.message || 'Unable to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter(post =>
        (post.subject?.id === parseInt(filterSubject) || 
         post.subjectId === parseInt(filterSubject))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleEdit = (post) => {
    navigate(`/posts/edit/${post.id}`, { state: { post } });
  };

  const handleDelete = async (postId, postTitle) => {
    if (window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      try {
        await postApi.deletePost(postId);
        alert('Post deleted successfully!');
        await fetchMyPosts();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting post!');
      }
    }
  };

  const handleViewDetail = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Please login to view your posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-3">My Posts</h1>
              <p className="text-lg text-teal-100">Manage and track your tutoring posts</p>
            </div>
            <button
              onClick={() => navigate('/posts/create')}
              className="flex items-center gap-2 px-8 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:shadow-lg transition-all duration-300"
            >
              <FaPlus size={20} /> Create New Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-700 font-semibold">{error}</p>
            <p className="text-sm text-red-600 mt-1">Check console (F12) for details</p>
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>

            {/* Filter by Subject */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-4 text-gray-400 text-lg" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all appearance-none bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          {(searchTerm || filterSubject) && (
            <div className="mt-4 text-sm text-gray-600">
              Found <span className="font-bold text-[#03ccba]">{filteredPosts.length}</span> post{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Posts Grid or Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba] mb-4"></div>
            <p className="text-gray-500 text-lg">Loading posts...</p>
          </div>
        ) : (searchTerm || filterSubject ? filteredPosts : posts).length > 0 ? (
          <>
            {/* Desktop - Grid View */}
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(searchTerm || filterSubject ? filteredPosts : posts).map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Image */}
                  {post.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-[#03ccba] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {post.subject?.name || 'Subject'}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#03ccba] transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {post.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendar size={14} className="text-[#03ccba]" />
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaBook size={14} className="text-[#03ccba]" />
                        <span>{post.subject?.name || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(post.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-1"
                      >
                        <FaEye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile - Table View */}
            <div className="lg:hidden bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">#</th>
                      <th className="px-6 py-4 text-left font-bold">Title</th>
                      <th className="px-6 py-4 text-left font-bold">Created</th>
                      <th className="px-6 py-4 text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchTerm || filterSubject ? filteredPosts : posts).map((post, index) => (
                      <tr key={post.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-700">{pageNo * pageSize + index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 max-w-xs truncate">{post.title}</p>
                          <p className="text-xs text-gray-600">{post.subject?.name || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleViewDetail(post.id)}
                              className="p-2 bg-[#03ccba] text-white rounded hover:shadow-md transition-all"
                              title="View"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-8 mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors font-semibold"
                >
                  ← Previous
                </button>
                <span className="px-6 py-2 bg-white rounded-lg border-2 border-[#03ccba] text-gray-900 font-bold">
                  Page {pageNo + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-6 py-2 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-colors font-semibold"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
                <p className="text-sm text-gray-600 font-semibold">Total Posts</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{posts.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
                <p className="text-sm text-gray-600 font-semibold">Recent Posts</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {posts.filter(p => {
                    const date = new Date(p.updatedAt || p.createdAt);
                    const today = new Date();
                    return (today - date) / (1000 * 60 * 60 * 24) < 7;
                  }).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-400">
                <p className="text-sm text-gray-600 font-semibold">Today</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {posts.filter(p => {
                    const date = new Date(p.createdAt);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-6">
              {searchTerm || filterSubject ? 'No posts match your search' : 'You haven\'t created any posts yet'}
            </p>
            {!(searchTerm || filterSubject) && (
              <button
                onClick={() => navigate('/posts/create')}
                className="px-8 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-bold inline-flex items-center gap-2"
              >
                <FaPlus /> Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}