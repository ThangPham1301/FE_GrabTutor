import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaStar, FaClock, FaArrowLeft, FaPlay } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';

export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'USER') {
      navigate('/login');
      return;
    }
    fetchEnrolledCourses();
  }, [pageNo, user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getMyEnrolledCourses(pageNo, pageSize);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      setCourses(items);
      setTotalPages(response.data?.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to load your courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    // Mock progress calculation
    return Math.floor(Math.random() * 100);
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-5xl font-bold mb-2">My Courses</h1>
          <p className="text-teal-100">Continue your learning journey with the courses you've enrolled in</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-[#03ccba] text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'in-progress'
                ? 'bg-[#03ccba] text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'completed'
                ? 'bg-[#03ccba] text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
            <p className="text-gray-600 mt-4">Loading your courses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center bg-white rounded-lg p-12">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">You haven't enrolled in any courses yet</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-[#03ccba] text-white rounded-lg font-bold hover:bg-[#02b5a5]"
            >
              Browse Courses
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map(course => {
              const progress = calculateProgress(course);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Course Image */}
                  <div className="relative h-40 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl">
                        <FaBook />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.name}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-[#03ccba]">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#03ccba] h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FaBook size={14} className="text-[#03ccba]" />
                        {course.totalLessons || 0} Lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStar size={14} className="text-yellow-400" />
                        {course.rating || 4.5}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="w-full px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <FaPlay size={12} /> Continue Learning
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${course.id}/lessons`)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-purple-600 font-medium transition-colors"
                      >
                        <FaBook size={16} /> Manage Lessons
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              ← Previous
            </button>
            <span className="text-gray-600">
              Page {pageNo + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}