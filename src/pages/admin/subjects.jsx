import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function AdminSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Lấy danh sách môn học
  useEffect(() => {
    fetchSubjects();
  }, [pageNo, pageSize]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSubjects(pageNo, pageSize);
      
      console.log('=== SUBJECTS RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setSubjects(items);
      setTotalPages(response.data?.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError("Không thể tải danh sách môn học");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingId(subject.id);
      setFormData({
        name: subject.name,
        description: subject.description
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên môn học!');
      return;
    }

    try {
      if (editingId) {
        // Cập nhật
        await adminApi.updateSubject(editingId, formData);
        alert('Cập nhật môn học thành công!');
      } else {
        // Tạo mới
        await adminApi.createSubject(formData);
        alert('Tạo môn học thành công!');
      }
      setShowModal(false);
      await fetchSubjects();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu môn học'));
      console.error('Error:', err);
    }
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${subjectName}" không?`)) {
      try {
        await adminApi.deleteSubject(subjectId);
        alert('Xóa môn học thành công!');
        await fetchSubjects();
      } catch (err) {
        alert('Lỗi khi xóa môn học!');
        console.error('Delete error:', err);
      }
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold">Quản lý Môn học</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#03ccba] text-white rounded hover:bg-[#02b5a5] transition-colors"
        >
          <FaPlus /> Thêm môn học
        </button>
      </div>

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
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên môn học</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Mô tả</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject, index) => (
                <tr key={subject.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{pageNo * pageSize + index + 1}</td>
                  <td className="px-6 py-3 font-medium">{subject.name}</td>
                  <td className="px-6 py-3 text-gray-600">{subject.description || 'N/A'}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => handleOpenModal(subject)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id, subject.name)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors inline-flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Không có môn học nào
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
          ← Previous Page
        </button>
        <span className="px-4 py-2 font-semibold">
          Trang {pageNo + 1} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={pageNo >= totalPages - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Next Page →
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên môn học
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  placeholder="Nhập tên môn học"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  rows={4}
                  placeholder="Nhập mô tả môn học"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
              >
                {editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}