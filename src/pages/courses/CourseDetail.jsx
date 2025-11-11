import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaStar, FaUser, FaClock, FaCheckCircle, FaPlay, FaShoppingCart, FaExclamationCircle, FaEdit, FaEyeSlash, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';
import lessonApi from '../../api/lession';

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [isTutorOwner, setIsTutorOwner] = useState(false);
  
  // ✅ Track if we've already checked enrollment to prevent infinite loop
  const enrollmentCheckedRef = useRef(false);

  // ✅ NEW: Check if user is authenticated when component mounts
  useEffect(() => {
    // ⏱️ Small delay to ensure user context is loaded
    const timer = setTimeout(() => {
      if (!user) {
        console.log('❌ No authenticated user - redirecting to login');
        navigate('/login', { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    fetchCourseDetail();
    fetchLessons();
  }, [courseId]);

  // ✅ FIXED: Check enrollment status ONLY ONCE when course loads
  useEffect(() => {
    if (course && user && !enrollmentCheckedRef.current) {
      enrollmentCheckedRef.current = true;
      checkEnrollmentStatus();

      // ✅ Check if current user is tutor owner
      if (user.role === 'TUTOR' && course.tutorId === user.userId) {
        setIsTutorOwner(true);
      }
    }
  }, [course?.id, user?.userId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourseByCourseId(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('❌ Error fetching course:', err);

      if (err.response?.status === 403) {
        setError('This course is not published yet. Please publish it first.');
      } else {
        setError('Failed to load course details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await lessonApi.getAllLessonsByCourseId(courseId, 0, 100);
      let items = [];
      if (response.data?.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      setLessons(items);
    } catch (err) {
      console.error('❌ Error fetching lessons:', err);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      console.log('🔍 Checking enrollment status...');

      const response = await courseApi.getMyEnrolledCourses(0, 1000);
      const enrolledCourseIds = response.data?.items?.map(c => c.id) || [];

      console.log('📋 Enrolled courses:', enrolledCourseIds);
      console.log('🎯 Current course:', courseId);
      console.log('✅ Is enrolled:', enrolledCourseIds.includes(courseId));

      setCourse(prev => prev ? {
        ...prev,
        isEnrolled: enrolledCourseIds.includes(courseId)
      } : prev);
    } catch (err) {
      console.error('❌ Error checking enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await courseApi.enrollCourse(courseId);
      alert('✅ Enrolled successfully! Start learning now.');

      // ✅ Reset enrollment check so it runs again
      enrollmentCheckedRef.current = false;

      // Refresh course detail to update enrollment status
      await fetchCourseDetail();
    } catch (err) {
      console.error('Enrollment error:', err);

      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message;
      const errorCode = errorData?.code;

      let displayMessage = errorMessage;

      if (errorCode === 11003 || errorMessage.includes('already enrolled')) {
        displayMessage = '✅ You are already enrolled in this course! Go to "My Courses" to continue learning.';
        enrollmentCheckedRef.current = false;
        await fetchCourseDetail();
      } else if (errorCode === 11002 || errorMessage.includes("doesn't have enough money")) {
        displayMessage = '💳 Insufficient balance. Please recharge your wallet and try again.';
      } else if (errorCode === 1004 || errorMessage.includes('Unauthenticated')) {
        displayMessage = 'Please log in to enroll in this course.';
        setTimeout(() => navigate('/login'), 2000);
      }

      alert('❌ ' + displayMessage);
    } finally {
      setEnrolling(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!isTutorOwner) return;

    try {
      const newStatus = !course.isPublished;
      const response = await courseApi.changePublishCourse(courseId, newStatus);

      const updatedStatus = response.data?.isPublished ?? newStatus;
      setCourse(prev => ({ ...prev, isPublished: updatedStatus }));

      const statusText = updatedStatus ? '📚 Published' : '🔒 Unpublished';
      alert(`✅ Course ${statusText} successfully!`);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleEdit = () => {
    navigate(`/courses/edit/${courseId}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      courseApi.deleteCourse(courseId)
        .then(() => {
          alert('✅ Course deleted successfully!');
          navigate('/courses/inventory');
        })
        .catch(err => {
          alert('❌ Error: ' + err.message);
        });
    }
  };

  // ✅ NEW: If no user, show loading or return null (will redirect)
  if (!user && loading === true) {
    return null; // Redirect happens in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Course not found</p>
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
          <h1 className="text-5xl font-bold mb-2">{course.name}</h1>
          <p className="text-teal-100 text-lg">{course.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg overflow-hidden mb-8 h-80">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                  <FaBook />
                </div>
              )}
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                <FaBook className="text-[#03ccba] text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{course.totalLessons || 0}</p>
                <p className="text-gray-600 text-sm">Lessons</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{course.rating || 4.5}</p>
                <p className="text-gray-600 text-sm">Rating</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                <FaUser className="text-[#03ccba] text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{course.enrolledCount || 0}</p>
                <p className="text-gray-600 text-sm">Students</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                <FaClock className="text-[#03ccba] text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">12h</p>
                <p className="text-gray-600 text-sm">Duration</p>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              {lessons.length > 0 ? (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        // ✅ Simple: Just navigate to login if not authenticated
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        
                        // ✅ Check if enrolled or is tutor owner
                        if (course.isEnrolled || isTutorOwner) {
                          navigate(`/courses/${courseId}/learn/${lesson.id}`);
                        } else {
                          alert('❌ Please enroll in this course first');
                        }
                      }}
                      className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg transition-colors ${
                        course.isEnrolled || isTutorOwner
                          ? 'hover:bg-gray-100 cursor-pointer'
                          : user ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#03ccba] text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      </div>
                      <FaPlay className={`${course.isEnrolled || isTutorOwner || !user ? 'text-[#03ccba]' : 'text-gray-400'}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No lessons available yet</p>
              )}
            </div>
          </div>

          {/* Right Sidebar - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {/* ✅ TUTOR OWNER VIEW */}
              {isTutorOwner ? (
                <>
                  {/* Tutor Owner Info */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">COURSE STATUS</p>
                    <div className={`px-4 py-3 rounded-lg text-center font-bold ${
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? '✓ Published' : '⊘ Draft'}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-1 font-semibold">COURSE PRICE</p>
                    <p className="text-4xl font-bold text-[#03ccba]">
                      {course.price > 0 ? `${course.price.toLocaleString()} VNĐ` : 'FREE'}
                    </p>
                  </div>

                  {/* Revenue Info */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-200">
                    <p className="text-gray-600 text-sm mb-2 font-semibold">YOUR EARNINGS</p>
                    <p className="text-3xl font-bold text-green-600">
                      {((course.price || 0) * (course.enrolledCount || 0)).toLocaleString()} VNĐ
                    </p>
                    <p className="text-gray-500 text-xs mt-1">({course.enrolledCount || 0} students)</p>
                  </div>

                  {/* Tutor Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FaEdit size={16} /> Edit Course
                    </button>

                    <button
                      onClick={handleTogglePublish}
                      className={`w-full px-4 py-3 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                        course.isPublished
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {course.isPublished ? (
                        <>
                          <FaEyeSlash size={16} /> Unpublish Course
                        </>
                      ) : (
                        <>
                          <FaCheckCircle size={16} /> Publish Course
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FaTrash size={16} /> Delete Course
                    </button>

                    <button
                      onClick={() => navigate(`/courses/${courseId}/lessons`)}
                      className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FaBook size={16} /> Manage Lessons
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-blue-700">
                    <p className="font-bold mb-1">💡 Tutor Preview Mode</p>
                    <p>You can see lesson content as tutor owner. Students need to enroll to access.</p>
                  </div>
                </>
              ) : (
                <>
                  {/* STUDENT VIEW */}
                  {/* Price */}
                  <div className="mb-6">
                    {course.price > 0 ? (
                      <>
                        <p className="text-gray-600 text-sm mb-1">Course Price</p>
                        <p className="text-4xl font-bold text-[#03ccba]">
                          {course.price.toLocaleString()} VNĐ
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-green-600">FREE</p>
                    )}
                  </div>

                  {/* ✅ ENROLLMENT STATUS */}
                  {course.isEnrolled ? (
                    // ✅ Already Enrolled - Show Success with Action Buttons
                    <div className="space-y-3 mb-6">
                      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                        <FaCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                        <p className="text-green-700 font-bold text-lg">You're enrolled!</p>
                        <p className="text-green-600 text-sm mt-1">Start learning now</p>
                      </div>

                      {/* Continue Learning Button */}
                      <button
                        onClick={() => {
                          if (lessons.length > 0) {
                            navigate(`/courses/${courseId}/learn/${lessons[0].id}`);
                          } else {
                            navigate('/courses/my-enrolled');
                          }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                      >
                        <FaPlay size={16} /> Continue Learning
                      </button>

                      {/* My Learning Button */}
                      <button
                        onClick={() => navigate('/courses/my-enrolled')}
                        className="w-full px-4 py-2 border-2 border-[#03ccba] text-[#03ccba] rounded-lg hover:bg-[#03ccba] hover:text-white transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <FaBook size={16} /> My Learning
                      </button>
                    </div>
                  ) : (
                    // ✅ Not Enrolled - Show Enroll Button
                    <>
                      {user ? (
                        <button
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all mb-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaShoppingCart /> {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all mb-6 flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart /> Login to Enroll
                        </button>
                      )}
                    </>
                  )}

                  {/* Course Features */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900">What you'll get:</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 flex-shrink-0" />
                        <span>Access to all {course.totalLessons || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 flex-shrink-0" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 flex-shrink-0" />
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Info */}
                  {course.tutorId && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-gray-600 text-sm mb-2">Instructor</p>
                      <button className="w-full px-4 py-2 border-2 border-[#03ccba] text-[#03ccba] rounded-lg hover:bg-[#03ccba] hover:text-white transition-colors font-semibold">
                        View Profile
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}