import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSearch, FaTimes, FaBook, FaGraduationCap,
  FaThLarge, FaList, FaSpinner, FaClock, FaUsers, FaStar,
  FaChevronRight, FaFilter, FaPlay, FaLock
} from 'react-icons/fa';
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
  
  // ✅ View mode toggle
  const [viewMode, setViewMode] = useState('grid');

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

    // Search filter
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

  const handleStartLearning = (courseId, courseData) => {
    if (courseData.totalLessons > 0) {
      navigate(`/courses/${courseId}`);
    }
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
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Loading your courses...</p>
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

          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FaGraduationCap className="text-5xl text-teal-600" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold">My Learning</h1>
              <p className="text-lg text-teal-100 mt-2">
                Explore {courses.length} course{courses.length !== 1 ? 's' : ''} and continue your journey
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
              <p className="text-teal-600 text-sm font-semibold">Total Courses</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{courses.length}</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
              <p className="text-teal-600 text-sm font-semibold">Total Lessons</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {courses.reduce((sum, c) => sum + (c.totalLessons || 0), 0)}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
              <p className="text-teal-600 text-sm font-semibold">Instructors</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {new Set(courses.map(c => c.tutorId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filters & View Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-8">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaSearch size={16} /> Search Courses
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
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaFilter size={16} /> Status
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

            {/* Clear & View Toggle */}
            <div className="md:col-span-2 flex gap-2">
              {hasFilters && (
                <button
                  onClick={() => {
                    handleClearSearch();
                    setFilterStatus('all');
                  }}
                  className="flex-1 px-3 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2 h-full text-sm"
                >
                  <FaTimes size={14} /> Clear
                </button>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded transition-all font-semibold flex items-center gap-1 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-[#03ccba] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaThLarge size={14} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded transition-all font-semibold flex items-center gap-1 text-sm ${
                    viewMode === 'list'
                      ? 'bg-[#03ccba] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaList size={14} /> List
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
              <p className="text-blue-800 text-sm font-semibold">
                ✅ Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Courses - GRID VIEW */}
        {viewMode === 'grid' && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCourses.map((course) => {
              const progress = calculateProgress(course);
              const isCompleted = progress === 100;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
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

                    {/* Status Badge */}
                    {isCompleted ? (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        ✓ Completed
                      </div>
                    ) : null}

                    {/* Lessons Badge */}
                    <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur rounded-lg px-3 py-1 shadow-md">
                      <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        <FaBook size={12} /> {course.totalLessons || 0} Lessons
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white text-xs font-bold">
                          {course.tutorName?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Instructor</p>
                          <p className="text-sm font-semibold text-gray-900">{course.tutorName}</p>
                        </div>
                      </div>
                    )}

                    {/* Stats - WITHOUT PROGRESS */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Lessons</p>
                        <p className="text-lg font-bold text-gray-900">{course.totalLessons || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Rating</p>
                        <div className="flex items-center justify-center gap-1">
                          <FaStar className="text-yellow-400" size={12} />
                          <p className="text-lg font-bold text-gray-900">{course.rating || 4.5}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLearning(course.id, course);
                      }}
                      className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FaPlay size={14} /> Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courses - LIST VIEW */}
        {viewMode === 'list' && filteredCourses.length > 0 && (
          <div className="space-y-4 mb-12">
            {filteredCourses.map((course) => {
              const progress = calculateProgress(course);
              const isCompleted = progress === 100;

              return (
                <div
                  key={course.id}
                  onClick={() => handleNavigateCourse(course.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:border-l-4 hover:border-[#03ccba]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Course Image */}
                    <div className="relative h-40 md:h-auto rounded-lg overflow-hidden bg-gradient-to-br from-[#03ccba] to-[#02b5a5]">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBook className="text-white text-5xl opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#03ccba] transition-colors line-clamp-2">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description || 'No description'}
                        </p>

                        {/* Stats Row - WITHOUT PROGRESS */}
                        <div className="flex gap-6 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaBook size={14} className="text-[#03ccba]" />
                            <span><strong>{course.totalLessons || 0}</strong> Lessons</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaStar size={14} className="text-yellow-400" />
                            <span><strong>{course.rating || 4.5}</strong> Rating</span>
                          </div>
                        </div>
                      </div>

                      {/* Tutor Info */}
                      {course.tutorName && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Instructor</p>
                          <p className="text-sm font-semibold text-gray-900">{course.tutorName}</p>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col justify-between">
                      {/* Status Badge */}
                      {isCompleted ? (
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-bold text-sm mb-3">
                          ✓ Completed
                        </div>
                      ) : null}

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartLearning(course.id, course);
                        }}
                        className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <FaPlay size={12} /> Continue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-16 border-2 border-dashed border-gray-300 shadow-sm">
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
                className="px-8 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <FaBook /> Browse Courses
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}