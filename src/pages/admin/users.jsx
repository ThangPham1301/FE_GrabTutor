import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import statisticApi from "../../api/statisticApi";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaTrash } from "react-icons/fa";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [pageNo, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers(pageNo, pageSize);
      
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

  // ✅ NEW - Fetch user stats
  const fetchUserStats = async () => {
    try {
      const response = await statisticApi.getUserStatus('user', 0, 100);
      console.log('User status stats:', response);
      setUserStats(response?.data || response);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

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
          <h1 className="text-3xl font-bold">Quản lý User</h1>
        </div>
      </div>

      {/* ✅ Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold">Tất cả</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{userStats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Hoạt động</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{userStats?.active || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold">Bị khóa</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{userStats?.inactive || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold">Chờ xác thực</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{userStats?.pending || 0}</p>
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
                  <td className="px-6 py-3 font-medium">{user.fullName || 'N/A'}</td>
                  <td className="px-6 py-3">{user.email || 'N/A'}</td>
                  <td className="px-6 py-3">{user.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {user.active !== false ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <FaCheckCircle /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-semibold">
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