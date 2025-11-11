import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaBook } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import lessonApi from '../../api/lession';
import courseApi from '../../api/course';
import { useAuth } from '../../contexts/AuthContext';

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLesson();
    fetchLessons();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await lessonApi.getLessonById(lessonId);
      const lessonData = response.data;
      
      // ✅ Normalize
      lessonData.isPublished = lessonData.published !== undefined ? lessonData.published : lessonData.isPublished;
      lessonData.isPreview = lessonData.preview !== undefined ? lessonData.preview : lessonData.isPreview;
      
      setLesson(lessonData);
    } catch (err) {
      console.error('Error fetching lesson:', err);
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await lessonApi.getAllLessonsByCourseId(courseId, 0, 100);
      let items = [];
      
      if (response.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }

      // ✅ Normalize all lessons
      items = items.map(l => ({
        ...l,
        isPublished: l.published !== undefined ? l.published : l.isPublished,
        isPreview: l.preview !== undefined ? l.preview : l.isPreview
      }));

      setLessons(items);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

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
              onClick={() => navigate(`/courses/${courseId}`)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Lesson not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 mb-6 text-[#03ccba] hover:text-[#02b5a5] transition-colors font-semibold"
        >
          <FaArrowLeft /> Back to Course
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              {lesson.videoUrl ? (
                <video
                  controls
                  className="w-full h-96 bg-black"
                  src={lesson.videoUrl}
                />
              ) : (
                <div className="w-full h-96 bg-gray-800 flex items-center justify-center text-white">
                  <div className="text-center">
                    <FaBook size={80} className="mx-auto mb-4 opacity-50" />
                    <p>No video available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <div className="flex gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                  Bài {lesson.lessonNumber}
                </span>
                {lesson.isPreview && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-sm">
                    Preview
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
            </div>

            {/* Lesson Image */}
            {lesson.imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <img
                  src={lesson.imageUrl}
                  alt={lesson.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              {prevLesson ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/learn/${prevLesson.id}`)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <FaChevronLeft /> Previous Lesson
                </button>
              ) : (
                <div className="flex-1"></div>
              )}

              {nextLesson ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/learn/${nextLesson.id}`)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  Next Lesson <FaChevronRight />
                </button>
              ) : (
                <div className="flex-1"></div>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Lessons</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/courses/${courseId}/learn/${l.id}`)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? 'bg-[#03ccba] text-white font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{l.lessonNumber}.</span>
                      <span className="line-clamp-1">{l.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}