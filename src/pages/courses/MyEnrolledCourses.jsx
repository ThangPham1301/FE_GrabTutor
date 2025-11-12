import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTimes, FaBook, FaGraduationCap } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';
import { useAuth } from '../../contexts/AuthContext';

const DEBUG = true;

export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEnrolledCourses();
  }, [user, navigate]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterStatus]);

  // ==================== API CALLS ====================
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (DEBUG) console.log('📚 Fetching enrolled courses...');
      
      const response = await courseApi.getMyEnrolledCourses();
      
      if (DEBUG) {
        console.log('=== MyEnrolledCourses RESPONSE ===');
        console.log('Full response:', response);
      }
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) {
        console.log('✅ Courses count:', items.length);
        items.forEach((course, idx) => {
          console.log(`[Course ${idx}]: name=${course.name}, id=${course.id}`);
        });
      }
      
      setCourses(items);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to load your courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filterCourses = () => {
    let filtered = courses;

    // Search filter - tìm kiếm theo tên khóa học
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
      if (DEBUG) console.log(`🔍 Search: "${searchTerm}" -> ${filtered.length} results`);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(course => {
        const progress = calculateProgress(course);
        if (filterStatus === 'in-progress') return progress > 0 && progress < 100;
        if (filterStatus === 'completed') return progress === 100;
        return true;
      });
    }

    setFilteredCourses(filtered);
  };

  // ==================== UTILITIES ====================
  const calculateProgress = (course) => {
    if (!course.totalLessons || course.totalLessons === 0) return 0;
    return Math.round(((course.completedLessons || 0) / course.totalLessons) * 100);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleNavigateCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleManageLessons = (courseId) => {
    navigate(`/courses/${courseId}/lessons`);
  };

  // ==================== RENDER ====================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Please login to view your courses</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const hasFilters = searchTerm.trim() || filterStatus !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-teal-500 to-[#02b5a5] text-white py-16 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all mb-6"
          >
            <FaArrowLeft size={20} /> Back
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FaGraduationCap className="text-5xl" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold">My Courses</h1>
              <p className="text-lg text-teal-100 mt-2">
                Continue your learning journey with the courses you've enrolled in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Courses
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by course name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📋 Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white"
              >
                <option value="all">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Clear Button */}
            {hasFilters && (
              <div className="md:col-span-2 flex">
                <button
                  onClick={() => {
                    handleClearSearch();
                    setFilterStatus('all');
                  }}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2 h-full"
                >
                  <FaTimes size={16} />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Results Info */}
          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-800 text-sm font-semibold">
                ✅ Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => handleNavigateCourse(course.id)}
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBook className="text-white text-6xl opacity-50" />
                    </div>
                  )}

                  {/* Lessons Badge */}
                  <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1 shadow-md">
                    <p className="text-xs font-bold text-gray-900">
                      {course.totalLessons || 0} Lessons
                    </p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#03ccba] transition-colors">
                    {course.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'No description'}
                  </p>

                  {/* Tutor Info */}
                  {course.tutorName && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#03ccba] flex items-center justify-center text-white text-xs font-bold">
                        {course.tutorName?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Instructor</p>
                        <p className="text-sm font-semibold text-gray-900">{course.tutorName}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateCourse(course.id);
                      }}
                      className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      Continue Learning
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManageLessons(course.id);
                      }}
                      className="w-full border-2 border-[#03ccba] text-[#03ccba] font-bold py-2 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all"
                    >
                      View Lessons
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-lg p-16 border-2 border-dashed border-gray-300">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">
              {hasFilters
                ? 'Try adjusting your search filters'
                : 'You haven\'t enrolled in any courses yet. Start learning today!'}
            </p>
            {!hasFilters && (
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Browse Courses
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}