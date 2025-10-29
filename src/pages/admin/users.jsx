import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaTrash } from "react-icons/fa";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách user
  useEffect(() => {
    fetchUsers();
  }, [pageNo, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers(pageNo, pageSize);
      
      console.log('=== FULL RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      
      // Kiểm tra xem items nằm ở đâu
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setUsers(items);
      setTotalPages(response.data?.totalPages || 0);
    } catch (err) {
      console.error('Error:', err);
      setError("Không thể tải danh sách user");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API xóa user
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa user "${userName}" không?`)) {
      try {
        await userApi.deleteUser(userId);
        alert("Xóa user thành công!");
        await fetchUsers();
      } catch (err) {
        alert("Lỗi khi xóa user!");
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
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header với nút quay lại */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold">Quản lý User</h1>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">SĐT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{pageNo * pageSize + index + 1}</td>
                  <td className="px-6 py-3">{user.fullName || 'N/A'}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{user.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {user.active ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <FaCheckCircle /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-600">
                        <FaTimesCircle /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                    >
                      <FaTrash /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  Không có user nào
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
    </div>
  );
}