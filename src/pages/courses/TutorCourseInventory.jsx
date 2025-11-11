import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaEyeSlash, FaTrash, FaEllipsisV, FaArrowLeft, FaBook, FaDollarSign, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';

export default function TutorCourseInventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [publishingId, setPublishingId] = useState(null); // ✅ Track which course is being published

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }

    fetchTutorCourses();
  }, [pageNo, user]);

  const fetchTutorCourses = async () => {
    try {
      setLoading(true);
      const tutorId = user?.id || user?.userId;

      if (!tutorId) {
        setError('User ID not found');
        return;
      }

      const response = await courseApi.getAllCoursesByTutorId(tutorId, pageNo, pageSize);

      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      // ✅ Debug: Check courses structure
      console.log('=== fetchTutorCourses DEBUG ===');
      console.log('Total courses:', items.length);
      items.forEach((course, i) => {
        console.log(`${i}: ${course.name} - isPublished: ${course.isPublished}`);
      });

      setCourses(items);
      setTotalPages(response.data?.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPROVED: Better publish/unpublish handler with logging
  const handleTogglePublish = async (courseId, currentPublishStatus) => {
    try {
      setPublishingId(courseId);
      
      const actualCurrentStatus = currentPublishStatus === undefined ? false : currentPublishStatus;
      const newStatus = !actualCurrentStatus;
      
      console.log('=== handleTogglePublish START ===');
      console.log('courseId:', courseId);
      console.log('currentPublishStatus:', currentPublishStatus);
      console.log('newStatus (toggled):', newStatus);
      
      // ✅ Call API
      const response = await courseApi.changePublishCourse(courseId, newStatus);
      
      console.log('=== handleTogglePublish SUCCESS ===');
      console.log('Response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.isPublished:', response.data?.isPublished);
      
      // ✅ Get the actual published status from response
      const courseData = response.data;
      let updatedPublishedStatus = newStatus; // Fallback to what we sent
      
      if (courseData?.isPublished !== undefined) {
        updatedPublishedStatus = courseData.isPublished;
        console.log('✅ Using isPublished from response:', updatedPublishedStatus);
      } else if (courseData?.published !== undefined) {
        updatedPublishedStatus = courseData.published;
        console.log('✅ Using published from response:', updatedPublishedStatus);
      } else {
        console.log('⚠️ Neither isPublished nor published found, using newStatus:', newStatus);
      }
      
      console.log('Final updatedPublishedStatus:', updatedPublishedStatus);
      
      // ✅ Update UI immediately (optimistic update)
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, isPublished: updatedPublishedStatus }
            : course
        )
      );

      // ✅ Show success message
      const statusText = updatedPublishedStatus ? '📚 Published' : '🔒 Unpublished';
      alert(`✅ Course ${statusText} successfully!`);
      
      console.log(`✅ Course ${courseId} is now ${updatedPublishedStatus ? 'PUBLISHED' : 'UNPUBLISHED'}`);
      
      // ✅ Refresh data in background (silently) after 3 seconds
      // This ensures we stay in sync with backend without re-showing alerts
      setTimeout(() => {
        console.log('🔄 Silent refresh after publish...');
        fetchTutorCourses();
      }, 3000);
      
    } catch (err) {
      console.error('❌ handleTogglePublish error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message;
      alert(`❌ Error: ${errorMsg}`);
      
      // ✅ Refresh to restore correct state on error
      await fetchTutorCourses();
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await courseApi.deleteCourse(courseId);
        alert('✅ Course deleted!');
        await fetchTutorCourses();
      } catch (err) {
        alert('❌ Error: ' + err.message);
      }
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // Calculate stats
  const stats = {
    total: courses.length,
    published: courses.filter(c => c.isPublished).length,
    unpublished: courses.filter(c => !c.isPublished).length,
    totalEnrolled: courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolledCount || 0)), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] via-[#02b5a5] to-[#008b7a] text-white py-16 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 mb-6 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                <FaArrowLeft size={16} /> Back to Profile
              </button>
              <h1 className="text-6xl font-bold mb-2">My Courses</h1>
              <p className="text-xl text-teal-100">Create, manage, and publish your courses</p>
            </div>
            <button
              onClick={() => navigate('/courses/create')}
              className="flex items-center gap-3 px-8 py-4 bg-white text-[#03ccba] rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 text-lg"
            >
              <FaPlus size={20} /> Create New Course
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white bg-opacity-15 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-sm text-teal-100">Total Courses</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-sm text-teal-100">Published</p>
              <p className="text-3xl font-bold text-green-300 mt-1">{stats.published}</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-sm text-teal-100">Unpublished</p>
              <p className="text-3xl font-bold text-yellow-300 mt-1">{stats.unpublished}</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-sm text-teal-100">Total Students</p>
              <p className="text-3xl font-bold text-blue-300 mt-1">{stats.totalEnrolled}</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-sm text-teal-100">Estimated Revenue</p>
              <p className="text-2xl font-bold text-yellow-200 mt-1">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex items-start gap-3">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div>
              <p className="font-bold text-red-800">Error Loading Courses</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#03ccba]"></div>
              <p className="text-gray-600 mt-6 text-lg font-medium">Loading your courses...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center bg-white rounded-2xl shadow-lg p-16 border-2 border-dashed border-gray-300">
            <div className="text-8xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Start by creating your first course and begin earning!</p>
            <button
              onClick={() => navigate('/courses/create')}
              className="px-8 py-4 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-xl font-bold hover:shadow-lg transition-all text-lg"
            >
              <FaPlus className="inline mr-2" /> Create Your First Course
            </button>
          </div>
        )}

        {/* View Toggle */}
        {!loading && courses.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              Showing <span className="font-bold text-[#03ccba]">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#03ccba] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#03ccba]'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#03ccba] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#03ccba]'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && courses.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {courses.map(course => (
              <div 
                key={course.id} 
                className={`bg-white rounded-xl shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border border-gray-100 ${
                  publishingId === course.id ? 'opacity-70' : ''
                }`}
              >
                {/* Course Image */}
                <div className="relative h-40 bg-gradient-to-br from-[#03ccba] to-[#02b5a5]">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                      <FaBook />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      course.isPublished
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {course.isPublished ? '✓ Published' : '⊘ Draft'}
                    </span>
                  </div>

                  {/* ✅ Loading indicator when publishing */}
                  {publishingId === course.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}

                  {/* Price Badge */}
                  {course.price === 0 && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      FREE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#03ccba]">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#03ccba]">{course.totalLessons || 0}</p>
                      <p className="text-xs text-gray-600 mt-1">Lessons</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{course.enrolledCount || 0}</p>
                      <p className="text-xs text-gray-600 mt-1">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {course.price > 0 ? `${(course.price / 1000).toFixed(0)}K` : 'Free'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Price</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      disabled={publishingId === course.id}
                      className="w-full px-4 py-2 border-2 border-[#03ccba] text-[#03ccba] rounded-lg hover:bg-[#03ccba] hover:text-white transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaEye size={16} /> View Course
                    </button>
                    <button
                      onClick={() => navigate(`/courses/edit/${course.id}`)}
                      disabled={publishingId === course.id}
                      className="w-full px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaEdit size={16} /> Edit
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTogglePublish(course.id, course.isPublished)}
                        disabled={publishingId === course.id}
                        className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          course.isPublished
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {publishingId === course.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-current"></div>
                            {course.isPublished ? 'Unpublishing...' : 'Publishing...'}
                          </>
                        ) : course.isPublished ? (
                          <>
                            <FaEyeSlash size={14} /> Unpublish
                          </>
                        ) : (
                          <>
                            <FaEye size={14} /> Publish
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={publishingId === course.id}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold flex items-center justify-center gap-1 transition-all text-sm disabled:opacity-50"
                      >
                        <FaTrash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && courses.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Course Name</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Lessons</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Students</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map(course => (
                    <tr 
                      key={course.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        publishingId === course.id ? 'opacity-70 bg-gray-100' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {course.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{course.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          {course.totalLessons || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{course.enrolledCount || 0}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-[#03ccba]">
                          {course.price > 0 ? `${course.price.toLocaleString()} VNĐ` : 'FREE'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? '✓ Published' : '⊘ Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-full">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === course.id ? null : course.id)}
                            disabled={publishingId === course.id}
                            className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FaEllipsisV className="text-gray-600 mx-auto" />
                          </button>

                          {/* Dropdown */}
                          {activeDropdown === course.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-20">
                              <button
                                onClick={() => {
                                  navigate(`/courses/${course.id}`);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium transition-colors"
                              >
                                <FaEye size={16} className="text-[#03ccba]" /> View Course
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/courses/edit/${course.id}`);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-blue-600 font-medium transition-colors"
                              >
                                <FaEdit size={16} /> Edit Course
                              </button>

                              <button
                                onClick={() => {
                                  handleTogglePublish(course.id, course.isPublished);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium transition-colors"
                              >
                                {course.isPublished ? (
                                  <>
                                    <FaEyeSlash size={16} className="text-yellow-600" /> Unpublish
                                  </>
                                ) : (
                                  <>
                                    <FaEye size={16} className="text-green-600" /> Publish
                                  </>
                                )}
                              </button>

                              <hr className="my-2" />

                              <button
                                onClick={() => {
                                  handleDeleteCourse(course.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 font-bold transition-colors"
                              >
                                <FaTrash size={16} /> Delete Course
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-8">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i !== pageNo) {
                      // Navigate to page
                    }
                  }}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    i === pageNo
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#03ccba]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}