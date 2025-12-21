import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function AllPosts() {
  const navigate = useNavigate();
  
  // Mock data - will be replaced with API call later
  const posts = [
    {
      id: 1,
      title: "Need Grade 12 Math Tutor",
      subject: "Math",
      level: "Grade 12",
      location: "Da Nang",
      status: "Looking",
      createdAt: "2024-03-15",
      fee: "200,000 VND/hour",
      description: "Need a Grade 12 Math tutor, focused on university entrance exam preparation..."
    },
    {
      id: 2,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Đang tìm",
      createdAt: "2024-03-15",
      fee: "200,000 VNĐ/giờ",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    {
      id: 3,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Đang tìm",
      createdAt: "2024-03-15",
      fee: "200,000 VNĐ/giờ",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    {
      id: 4,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Đang tìm",
      createdAt: "2024-03-15",
      fee: "200,000 VNĐ/giờ",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    {
      id: 5,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Đang tìm",
      createdAt: "2024-03-15",
      fee: "200,000 VNĐ/giờ",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    {
      id: 6,
      title: "Cần gia sư Toán lớp 12",
      subject: "Toán",
      level: "Lớp 12",
      location: "Đà Nẵng",
      status: "Đang tìm",
      createdAt: "2024-03-15",
      fee: "200,000 VNĐ/giờ",
      description: "Cần gia sư dạy Toán lớp 12, tập trung ôn thi đại học..."
    },
    // Add mock data later
  ];

  return (
    <div className="min-h-screen bg-[#f7f2ed]">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Post List</h1>
        </div>
      </div>

      {/* Search and filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent">
              <option value="">All Subjects</option>
              <option value="math">Math</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="english">English</option>
            </select>
            <select className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent">
              <option value="">All Levels</option>
              <option value="primary">Elementary</option>
              <option value="secondary">Middle School</option>
              <option value="high">High School</option>
            </select>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-4">{post.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{post.createdAt}</span>
                  {/* ✅ FIX: Pass postId to URL */}
                  <button
                    onClick={() => navigate(`/posts/${post.id}`)}
                    className="px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}