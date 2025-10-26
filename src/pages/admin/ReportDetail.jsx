import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

export default function ReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - replace with API call
  const report = {
    id: 1,
    postTitle: "Cần gia sư Toán lớp 12",
    postContent: "Chi tiết bài đăng...",
    reportedBy: "user123@gmail.com",
    detail: "Bài đăng có nội dung không phù hợp",
    status: "Pending",
    createdAt: "2024-03-15"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/reports')}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết báo cáo</h1>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <FaCheck /> Chấp nhận
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <FaTimes /> Từ chối
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Report info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin báo cáo</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : report.status === 'Resolved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày báo cáo</p>
                <p>{report.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Người báo cáo</p>
                <p>{report.reportedBy}</p>
              </div>
            </div>
          </div>

          {/* Report detail */}
          <div>
            <h3 className="text-lg font-medium mb-2">Nội dung báo cáo</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{report.detail}</p>
          </div>

          {/* Reported post */}
          <div>
            <h3 className="text-lg font-medium mb-2">Bài đăng bị báo cáo</h3>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{report.postTitle}</h4>
              <p className="text-gray-700">{report.postContent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}