import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

export default function ReportList() {
  const navigate = useNavigate();
  
  // Mock data - replace with API call later
  const reports = [
    {
      id: 1,
      postTitle: "Cần gia sư Toán lớp 12",
      reportedBy: "user123@gmail.com",
      detail: "Bài đăng có nội dung không phù hợp",
      status: "Pending",
      createdAt: "2024-03-15"
    },
    // Add more mock reports...
  ];

  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm báo cáo..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ xử lý</option>
              <option value="resolved">Đã xử lý</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Reports table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài đăng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày báo cáo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.postTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.reportedBy}</td>
                  <td className="px-6 py-4">{report.detail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'Resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => navigate(`/admin/reports/${report.id}`)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900 mx-2"
                      title="Chấp nhận"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 mx-2"
                      title="Từ chối"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}