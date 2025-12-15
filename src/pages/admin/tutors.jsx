import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import statisticApi from "../../api/statisticApi";
import { FaArrowLeft, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";

export default function AdminTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [selectedStars, setSelectedStars] = useState(null);
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
    fetchReviewStats();
  }, [pageNo, pageSize]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await userApi.getTutorRequests(pageNo, pageSize);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      const normalizedTutors = items.map((item) => ({
        ...item,
        fullName: item.fullName || item.full_name || 'N/A',
        phoneNumber: item.phoneNumber || item.phone_number || 'N/A',
        nationalId: item.nationalId || item.national_id || 'N/A',
        highestAcademicDegree: item.highestAcademicDegree || item.highest_academic_degree || 'N/A',
        university: item.university || 'N/A',
        major: item.major || 'N/A',
        email: item.email || 'N/A',
        dob: item.dob || item.date_of_birth || '',
        role: item.role || 'TUTOR'
      }));
      
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

  // ✅ NEW - Fetch review stars for filtering
  const fetchReviewStats = async () => {
    try {
      const response = await statisticApi.getReviewStars(0, 100);
      console.log('Review stats:', response);
      setReviewStats(response?.data || response);
    } catch (err) {
      console.error('Error fetching review stats:', err);
    }
  };

  const handleApproveTutor = async (tutor) => {
    const requestId = tutor.requestId;
    
    if (!requestId) {
      alert('Lỗi: Không tìm thấy requestId!');
      return;
    }
    
    const isApprovedStatus = tutor.status === 'APPROVED' || tutor.active === true;
    if (isApprovedStatus) {
      alert('Yêu cầu này đã được phê duyệt!');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt gia sư ${tutor.fullName} không?`)) {
      try {
        await userApi.approveTutorRequest(requestId);
        alert('Phê duyệt thành công!');
        await fetchTutors();
      } catch (err) {
        alert('Lỗi khi phê duyệt gia sư!');
        console.error('Approve error:', err);
      }
    }
  };

  const handleRejectTutor = async (tutor) => {
    if (!tutor.requestId) {
      alert('Lỗi: Không tìm thấy requestId!');
      return;
    }
    
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

  const isApproved = (tutor) => {
    return tutor.status === 'APPROVED' || tutor.active === true;
  };

  const hasData = (value) => {
    return value && value !== 'N/A' && value !== '';
  };

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

      {/* ✅ Review Stars Filter */}
      {reviewStats && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Lọc theo Đánh giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedStars(null)}
              className={`p-4 rounded-lg font-semibold transition-all ${
                selectedStars === null
                  ? 'bg-[#03ccba] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-[#03ccba]'
              }`}
            >
              Tất cả ({reviewStats?.total || 0})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setSelectedStars(stars)}
                className={`p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedStars === stars
                    ? 'bg-[#03ccba] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#03ccba]'
                }`}
              >
                {[...Array(stars)].map((_, i) => (
                  <FaStar key={i} size={16} />
                ))}
                ({reviewStats?.[`stars_${stars}`] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
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
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                        Chờ xử lý
                      </span>
                    ) : isApproved(tutor) ? (
                      <div className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 text-lg" />
                        <span className="text-sm font-medium text-green-600">Đã phê duyệt</span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                        {tutor.status === 'APPROVED' ? 'Đã phê duyệt' : tutor.status === 'REJECTED' ? 'Đã từ chối' : 'Đã xử lý'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {isPending(tutor) ? (
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
                      <div className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-green-600 text-lg" />
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
              Bạn có chắc chắn muốn từ chối gia sư <strong>{selectedTutor?.fullName}</strong> không?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (tùy chọn)..."
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-[#03ccba]"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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