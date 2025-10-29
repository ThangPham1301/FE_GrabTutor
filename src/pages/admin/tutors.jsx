import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { FaArrowLeft, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AdminTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchTutors();
  }, [pageNo, pageSize]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await userApi.getTutorRequests(pageNo, pageSize);
      
      console.log('=== TUTOR REQUESTS RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      // Normalize snake_case từ Backend thành camelCase
      const normalizedTutors = items.map((item) => {
        console.log(`Processing tutor:`, item);
        
        return {
          ...item,
          // Normalize snake_case → camelCase
          fullName: item.fullName || item.full_name || 'N/A',
          phoneNumber: item.phoneNumber || item.phone_number || 'N/A',
          nationalId: item.nationalId || item.national_id || 'N/A',
          highestAcademicDegree: item.highestAcademicDegree || item.highest_academic_degree || 'N/A',
          university: item.university || 'N/A',
          major: item.major || 'N/A',
          email: item.email || 'N/A',
          dob: item.dob || item.date_of_birth || '',
          role: item.role || 'TUTOR'
        };
      });
      
      console.log('Normalized tutors:', normalizedTutors);
      
      setTutors(normalizedTutors);
      setTotalPages(response.data?.totalPages || 0);
    } catch (err) {
      console.error('Error:', err);
      setError("Không thể tải danh sách yêu cầu gia sư");
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // Phê duyệt yêu cầu gia sư
  const handleApproveTutor = async (tutor) => {
    console.log('=== handleApproveTutor ===');
    console.log('Tutor object:', tutor);
    console.log('tutor.requestId:', tutor.requestId);
    
    const requestId = tutor.requestId;
    
    if (!requestId) {
      alert('Lỗi: Không tìm thấy requestId!');
      return;
    }
    
    // Kiểm tra xem đã phê duyệt chưa
    const isApprovedStatus = tutor.status === 'APPROVED' || tutor.active === true;
    if (isApprovedStatus) {
      alert('Yêu cầu này đã được phê duyệt!');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt gia sư ${tutor.fullName} không?`)) {
      try {
        console.log('Gọi approveTutorRequest với requestId:', requestId);
        await userApi.approveTutorRequest(requestId);
        alert('Phê duyệt thành công! Tài khoản đã được kích hoạt.');
        await fetchTutors();
      } catch (err) {
        alert('Lỗi khi phê duyệt gia sư!');
        console.error('Approve error:', err);
      }
    }
  };

  // Từ chối yêu cầu gia sư
  const handleRejectTutor = async (tutor) => {
    console.log('=== handleRejectTutor ===');
    console.log('Tutor object:', tutor);
    console.log('tutor.requestId:', tutor.requestId);
    
    if (!tutor.requestId) {
      alert('Lỗi: Không tìm thấy requestId!');
      return;
    }
    
    // Kiểm tra xem đã phê duyệt chưa
    const isApprovedStatus = tutor.status === 'APPROVED' || tutor.active === true;
    if (isApprovedStatus) {
      alert('Không thể từ chối yêu cầu đã được phê duyệt!');
      return;
    }
    
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  const confirmReject = async () => {
    try {
      const requestId = selectedTutor.requestId;
      console.log('Gọi rejectTutorRequest với requestId:', requestId);
      await userApi.rejectTutorRequest(requestId, rejectReason);
      alert('Từ chối thành công!');
      setShowModal(false);
      setRejectReason('');
      await fetchTutors();
    } catch (err) {
      alert('Lỗi khi từ chối gia sư!');
      console.error('Reject error:', err);
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // Helper function để check xem đã được phê duyệt không
  const isApproved = (tutor) => {
    return tutor.status === 'APPROVED' || tutor.active === true;
  };

  // Helper function để check field có dữ liệu không
  const hasData = (value) => {
    return value && value !== 'N/A' && value !== '';
  };

  // Helper function để check xem có pending hay không
  const isPending = (tutor) => {
    return tutor.status === 'PENDING' || (!tutor.status && !tutor.active);
  };

  if (loading) return <div className="text-center py-8 text-lg">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 py-8 text-lg">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold">Quản lý Yêu cầu Gia sư</h1>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              {tutors.some(t => hasData(t.phoneNumber)) && (
                <th className="px-6 py-3 text-left text-sm font-semibold">SĐT</th>
              )}
              {tutors.some(t => hasData(t.nationalId)) && (
                <th className="px-6 py-3 text-left text-sm font-semibold">CMND/CCCD</th>
              )}
              {tutors.some(t => hasData(t.university)) && (
                <th className="px-6 py-3 text-left text-sm font-semibold">Trường</th>
              )}
              {tutors.some(t => hasData(t.major)) && (
                <th className="px-6 py-3 text-left text-sm font-semibold">Chuyên ngành</th>
              )}
              {tutors.some(t => hasData(t.highestAcademicDegree)) && (
                <th className="px-6 py-3 text-left text-sm font-semibold">Bằng cấp</th>
              )}
              <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tutors.length > 0 ? (
              tutors.map((tutor, index) => (
                <tr key={tutor.id || tutor.userId || index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{pageNo * pageSize + index + 1}</td>
                  <td className="px-6 py-3 font-medium">{tutor.fullName || 'N/A'}</td>
                  <td className="px-6 py-3">{tutor.email || 'N/A'}</td>
                  {tutors.some(t => hasData(t.phoneNumber)) && (
                    <td className="px-6 py-3">{hasData(tutor.phoneNumber) ? tutor.phoneNumber : '-'}</td>
                  )}
                  {tutors.some(t => hasData(t.nationalId)) && (
                    <td className="px-6 py-3">{hasData(tutor.nationalId) ? tutor.nationalId : '-'}</td>
                  )}
                  {tutors.some(t => hasData(t.university)) && (
                    <td className="px-6 py-3">{hasData(tutor.university) ? tutor.university : '-'}</td>
                  )}
                  {tutors.some(t => hasData(t.major)) && (
                    <td className="px-6 py-3">{hasData(tutor.major) ? tutor.major : '-'}</td>
                  )}
                  {tutors.some(t => hasData(t.highestAcademicDegree)) && (
                    <td className="px-6 py-3">
                      {hasData(tutor.highestAcademicDegree) ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                          {tutor.highestAcademicDegree}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                  <td className="px-6 py-3">
                    {isPending(tutor) ? (
                      // Pending - hiển thị 2 button
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveTutor(tutor)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors inline-flex items-center gap-1"
                        >
                          <FaCheck /> Phê duyệt
                        </button>
                        <button
                          onClick={() => handleRejectTutor(tutor)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors inline-flex items-center gap-1"
                        >
                          <FaTimes /> Từ chối
                        </button>
                      </div>
                    ) : (
                      // Đã xử lý - hiển thị dấu tick
                      <div className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 text-lg" />
                        <span className="text-sm font-medium text-green-600">
                          {tutor.status === 'APPROVED' ? 'Đã phê duyệt' : tutor.status === 'REJECTED' ? 'Đã từ chối' : 'Đã xử lý'}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  Không có yêu cầu gia sư nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePrevPage}
          disabled={pageNo === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
        >
          ← Trang trước
        </button>
        <span className="px-4 py-2 font-semibold">
          Trang {pageNo + 1} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={pageNo >= totalPages - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Trang sau →
        </button>
      </div>

      {/* Modal từ chối */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Lý do từ chối</h2>
            <p className="mb-4 text-gray-600">
              Từ chối yêu cầu của <strong>{selectedTutor?.fullName}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (tùy chọn)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}