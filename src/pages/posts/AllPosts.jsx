import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function AllPosts() {
  const navigate = useNavigate();
  
  // Mock data - sẽ thay thế bằng API call sau
  const posts = [
    {
      id: 1,
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
    // Thêm mock data sau
  ];

  return (
    <div className="min-h-screen bg-[#f7f2ed]">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách bài đăng</h1>
        </div>
      </div>

      {/* Search and filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài đăng..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent">
              <option value="">Tất cả môn học</option>
              <option value="math">Toán</option>
              <option value="physics">Vật lý</option>
              <option value="chemistry">Hóa học</option>
              <option value="english">Tiếng Anh</option>
            </select>
            <select className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent">
              <option value="">Tất cả trình độ</option>
              <option value="primary">Tiểu học</option>
              <option value="secondary">THCS</option>
              <option value="high">THPT</option>
            </select>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-[#03ccba] cursor-pointer">
                    {post.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    post.status === 'Đang tìm' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600"><strong>Môn học:</strong> {post.subject}</p>
                  <p className="text-gray-600"><strong>Trình độ:</strong> {post.level}</p>
                  <p className="text-gray-600"><strong>Địa điểm:</strong> {post.location}</p>
                  <p className="text-gray-600"><strong>Học phí:</strong> {post.fee}</p>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-4">{post.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{post.createdAt}</span>
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