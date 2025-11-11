import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaStar, FaUser, FaBook, FaClock, FaFilter } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, [pageNo]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, priceFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllPublishedCourses?.(pageNo, pageSize) || 
                       { data: { items: courses } };
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      // Mock published courses for now
      const publishedCourses = items.filter(c => c.isPublished !== false);
      setCourses(publishedCourses);
      setTotalPages(response.data?.totalPages || Math.ceil(publishedCourses.length / pageSize));
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price
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
          <h1 className="text-5xl font-bold mb-4">Browse Courses</h1>
          <p className="text-xl text-teal-100">Find the perfect course to enhance your skills</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-600" />
              <span className="font-semibold text-gray-700">Price Filter:</span>
            </div>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] outline-none transition-all"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="under-100k">Under 100K VNĐ</option>
              <option value="100k-500k">100K - 500K VNĐ</option>
              <option value="over-500k">Over 500K VNĐ</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredCourses.length}</span> course(s)
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden group">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                      <FaBook />
                    </div>
                  )}
                  {course.price === 0 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      FREE
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <FaBook size={14} className="text-[#03ccba]" />
                      {course.totalLessons || 0} Lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar size={14} className="text-yellow-400" />
                      {course.rating || 4.5} stars
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      {course.price > 0 ? (
                        <p className="text-2xl font-bold text-[#03ccba]">
                          {course.price.toLocaleString()} VNĐ
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-green-600">Free</p>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No courses found matching your search</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('all');
              }}
              className="mt-4 px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
            >
              Clear Filters
            </button>
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