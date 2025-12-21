import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFlag, FaBookOpen, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function PostList() {
  const navigate = useNavigate();
  
  // Mock data - replace with actual data later
  const posts = [
    {
      id: 1,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Searching",
      schedule: "3 buổi/tuần",
      fee: "200,000 VNĐ/giờ",
      createdAt: "2024-03-15",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    // Add more mock posts...
  ];

  return (
    <div className="min-h-screen bg-[#f7f2ed]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Posts</h1>
              <p className="text-gray-600">Quản lý và theo dõi các bài đăng tìm gia sư</p>
            </div>
            <button
              onClick={() => navigate('/posts/create')}
              className="bg-[#03ccba] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#02b5a5] transition-colors shadow-sm"
            >
              <FaPlus /> Tạo bài đăng mới
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài đăng..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent appearance-none bg-white">
              <option value="">Tất cả môn học</option>
              <option value="math">Toán</option>
              <option value="physics">Vật lý</option>
              <option value="chemistry">Hóa học</option>
              <option value="english">Tiếng Anh</option>
            </select>
            <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent appearance-none bg-white">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Searching</option>
              <option value="completed">Đã tìm được</option>
            </select>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-[#03ccba] cursor-pointer">
                    {post.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    post.status === 'Searching' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FaBookOpen className="w-4 h-4 mr-2 text-[#03ccba]" />
                    <span>{post.subject} - {post.level}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-[#03ccba]" />
                    <span>{post.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="w-4 h-4 mr-2 text-[#03ccba]" />
                    <span>{post.schedule} - {post.fee}</span>
                  </div>
                </div>

                <p className="text-gray-600 line-clamp-2 mb-4">{post.description}</p>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">{post.createdAt}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/posts/edit/${post.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    <button 
                      onClick={() => navigate(`/posts/${post.id}/report`)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Báo cáo"
                    >
                      <FaFlag />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}