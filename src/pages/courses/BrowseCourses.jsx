import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaStar, FaUser, FaBook, FaClock, FaFilter, FaSpinner,
  FaChevronLeft, FaChevronRight, FaTimes, FaShoppingCart, FaUsers,
  FaArrowRight, FaMapPin
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';

const DEBUG = true;

export default function BrowseCourses() {
  const navigate = useNavigate();
  
  // State
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Pagination
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    fetchCourses();
  }, [pageNo]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNo(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter when search changes
  useEffect(() => {
    filterCourses();
  }, [courses, debouncedSearch, priceFilter]);

  // ==================== API CALLS ====================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (DEBUG) console.log('📥 Fetching courses (page', pageNo, ')...');
      
      const response = await courseApi.getAllPublishedCourses(pageNo, pageSize);
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setCourses(items);
      setTotalPages(totalPagesValue);
      if (DEBUG) console.log('✅ Courses loaded:', items.length);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filterCourses = () => {
    let filtered = courses;

    // Search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
      setSearching(false);
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(course => {
        const price = course.price || 0;
        switch (priceFilter) {
          case 'free':
            return price === 0;
          case 'under-100k':
            return price > 0 && price < 100000;
          case '100k-500k':
            return price >= 100000 && price < 500000;
          case 'over-500k':
            return price >= 500000;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  };

  // ==================== HANDLERS ====================
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
    setPageNo(0);
  };

  const hasFilters = searchTerm.trim() || priceFilter !== 'all';
  const displayCourses = filteredCourses;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HERO SECTION - SIMPLIFIED ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-[#02b5a5] to-[#008b7a] text-white py-16 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            🎓 Browse Courses
          </h1>
          <p className="text-xl text-teal-100 max-w-2xl">
            Discover premium courses from expert tutors and enhance your skills
          </p>
        </div>
      </div>

      {/* ==================== SEARCH & FILTER ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-2">
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
                {searching && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#03ccba]" />}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 Price Range
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Only</option>
                <option value="under-100k">Under 100K VNĐ</option>
                <option value="100k-500k">100K - 500K VNĐ</option>
                <option value="over-500k">Over 500K VNĐ</option>
              </select>
            </div>

            {/* Clear Button */}
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2 h-full"
              >
                <FaTimes size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Results Info */}
          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-700 flex items-center gap-2">
              <FaFilter size={14} />
              Found <span className="font-bold">{displayCourses.length}</span> course{displayCourses.length !== 1 ? 's' : ''} matching your criteria
            </div>
          )}
        </div>

        {/* ==================== COURSES GRID ==================== */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Loading courses...</p>
          </div>
        ) : displayCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {displayCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mb-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-[#03ccba] hover:text-[#03ccba] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-md"
                >
                  <FaChevronLeft size={16} />
                  Previous
                </button>

                <div className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold shadow-md min-w-max">
                  Page {pageNo + 1} of {totalPages}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-md"
                >
                  Next
                  <FaChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">
              {hasFilters 
                ? "Try adjusting your search filters"
                : "No courses available yet"}
            </p>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COURSE CARD COMPONENT ====================
function CourseCard({ course, onClick }) {
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `${(price / 1000).toFixed(0)}K VNĐ`;
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700',
      'All Levels': 'bg-blue-100 text-blue-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const rating = course.rating || 4.5;
  const studentCount = course.enrolledCount || Math.floor(Math.random() * 500 + 50);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group border border-gray-100"
    >
      {/* Course Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBook className="text-white text-5xl opacity-30" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white text-[#03ccba] px-4 py-2 rounded-full font-bold shadow-lg text-sm">
          {formatPrice(course.price)}
        </div>

        {/* Free Badge */}
        {!course.price && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            FREE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#03ccba] transition-colors">
          {course.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
          {/* Lessons */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <FaBook size={12} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">{course.totalLessons || 0}</p>
              <p className="text-gray-500 text-xs">Lessons</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <FaStar size={12} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">{rating.toFixed(1)}</p>
              <p className="text-gray-500 text-xs">Rating</p>
            </div>
          </div>

          {/* Students */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <FaUsers size={12} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">{studentCount}</p>
              <p className="text-gray-500 text-xs">Students</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
              <FaClock size={12} className="text-orange-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">~12h</p>
              <p className="text-gray-500 text-xs">Duration</p>
            </div>
          </div>
        </div>

        {/* Tutor Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white text-xs font-bold">
            {course.tutorName?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{course.tutorName || 'Expert Tutor'}</p>
            <p className="text-xs text-gray-500">Professional Tutor</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-full py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 group/btn"
        >
          <FaShoppingCart size={14} />
          View Course
          <FaArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}