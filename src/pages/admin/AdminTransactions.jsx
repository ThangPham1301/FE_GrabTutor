import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaWallet, FaChartLine, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import Navbar from '../../components/Navbar';
import transactionApi from '../../api/transactionApi';
import statisticApi from '../../api/statisticApi';

const DEBUG = true;

export default function AdminTransactions() {
  const navigate = useNavigate();
  
  // ==================== STATES ====================
  const [activeTab, setActiveTab] = useState('recharge'); // recharge, virtual
  
  // Recharge transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Virtual transactions (withdrawals)
  const [virtualTransactions, setVirtualTransactions] = useState([]);
  const [loadingVirtual, setLoadingVirtual] = useState(false);
  const [errorVirtual, setErrorVirtual] = useState(null);
  const [pageNoVirtual, setPageNoVirtual] = useState(0);
  const [totalPagesVirtual, setTotalPagesVirtual] = useState(0);

  // Revenue chart
  const [revenueData, setRevenueData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('composed');

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (activeTab === 'recharge') {
      fetchAllTransactions();
      fetchRevenueData();
    } else if (activeTab === 'virtual') {
      fetchAllVirtualTransactions();
    }
  }, [activeTab, pageNo, pageNoVirtual]);

  // ==================== API CALLS ====================
  // ✅ Fetch Recharge Transactions (Legacy)
  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEBUG) console.log('📋 Fetching all transactions...');

      const response = await transactionApi.getAllUserTransactions(pageNo, pageSize);

      if (DEBUG) console.log('📋 Response:', response);

      let items = [];
      let pages = 0;

      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        pages = response.data.totalPages || 0;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
        pages = response.totalPages || 0;
      }

      if (DEBUG) console.log('📋 Total transactions:', items.length);

      setTransactions(items);
      setTotalPages(pages);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW - Fetch Virtual Transactions (Withdrawals)
  const fetchAllVirtualTransactions = async () => {
    try {
      setLoadingVirtual(true);
      setErrorVirtual(null);

      if (DEBUG) console.log('💸 Fetching virtual transactions...');

      const response = await transactionApi.getAllVirtualTransactions(pageNoVirtual, pageSize);

      if (DEBUG) console.log('💸 Response:', response);

      let items = [];
      let pages = 0;

      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        pages = response.data.totalPages || 0;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
        pages = response.totalPages || 0;
      }

      if (DEBUG) console.log('💸 Total virtual transactions:', items.length);

      setVirtualTransactions(items);
      setTotalPagesVirtual(pages);
    } catch (err) {
      console.error('Error fetching virtual transactions:', err);
      setErrorVirtual(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoadingVirtual(false);
    }
  };

  // ✅ Fetch Revenue Data
  const fetchRevenueData = async () => {
    try {
      setLoadingChart(true);

      if (DEBUG) console.log('📊 Fetching revenue data for year:', chartYear);

      const response = await statisticApi.getRevenueProfit(chartYear);

      if (DEBUG) console.log('📊 Revenue response:', response);

      const chartData = response.data?.monthly || [];
      const totalRevenue = response.data?.totalRevenue || 0;
      const totalProfit = response.data?.totalProfit || 0;

      setRevenueData({
        monthly: chartData,
        totalRevenue,
        totalProfit
      });
    } catch (err) {
      console.error('❌ Error fetching revenue data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  // ==================== PAGINATION ====================
  const handlePrevPage = () => {
    if (activeTab === 'recharge' && pageNo > 0) {
      setPageNo(pageNo - 1);
    } else if (activeTab === 'virtual' && pageNoVirtual > 0) {
      setPageNoVirtual(pageNoVirtual - 1);
    }
  };

  const handleNextPage = () => {
    const currentPages = activeTab === 'recharge' ? totalPages : totalPagesVirtual;
    const currentPageNo = activeTab === 'recharge' ? pageNo : pageNoVirtual;

    if (currentPageNo < currentPages - 1) {
      if (activeTab === 'recharge') {
        setPageNo(pageNo + 1);
      } else {
        setPageNoVirtual(pageNoVirtual + 1);
      }
    }
  };

  // ==================== HELPERS ====================
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900">
            {monthNames[label - 1]}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {(entry.value / 1000000).toFixed(2)}M VNĐ
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      'ANSWER_COMPLETED': 'bg-green-100 text-green-800',
      'COURSE_ENROLLED': 'bg-blue-100 text-blue-800',
      'RECHARGE': 'bg-purple-100 text-purple-800',
      'WITHDRAWAL': 'bg-orange-100 text-orange-800',
      'PAYMENT': 'bg-indigo-100 text-indigo-800',
      'ADD_FUND': 'bg-cyan-100 text-cyan-800',
      'DEFAULT': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['DEFAULT'];
  };

  const getVirtualTypeColor = (type) => {
    const colors = {
      'WITHDRAW': 'bg-orange-100 text-orange-800',
      'ADD_FUND': 'bg-blue-100 text-blue-800',
      'DEFAULT': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['DEFAULT'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUCCESS': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'DEFAULT': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors['DEFAULT'];
  };

  const formatCurrency = (value) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartData = revenueData?.monthly?.map((item) => ({
    ...item,
    monthName: monthNames[item.month - 1]
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Quay lại Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaWallet size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">💰 Quản lý Ví & Giao dịch</h1>
              <p className="text-teal-100 text-lg mt-1">Xem và quản lý tất cả giao dịch nạp tiền và rút tiền của người dùng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('recharge');
              setPageNo(0);
            }}
            className={`pb-4 px-6 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'recharge'
                ? 'text-[#03ccba] border-[#03ccba]'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaArrowUp className="inline mr-2" />
            Nạp tiền (Recharge)
          </button>
          <button
            onClick={() => {
              setActiveTab('virtual');
              setPageNoVirtual(0);
            }}
            className={`pb-4 px-6 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'virtual'
                ? 'text-[#03ccba] border-[#03ccba]'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaArrowDown className="inline mr-2" />
            Rút tiền (Withdrawals)
          </button>
        </div>

        {/* ==================== RECHARGE TAB ==================== */}
        {activeTab === 'recharge' && (
          <div className="space-y-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FaChartLine /> Doanh thu & Lợi nhuận
                  </h2>
                  <select
                    value={chartYear}
                    onChange={(e) => {
                      setChartYear(parseInt(e.target.value));
                      fetchRevenueData();
                    }}
                    className="px-4 py-2 bg-white bg-opacity-20 text-white rounded border border-white border-opacity-30 focus:outline-none font-semibold"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y} className="text-gray-900">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats */}
                {revenueData && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-15 rounded p-4">
                      <p className="text-teal-100 text-sm font-semibold">Tổng doanh thu</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {(revenueData.totalRevenue / 1000000).toFixed(2)}M VNĐ
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded p-4">
                      <p className="text-teal-100 text-sm font-semibold">Tổng lợi nhuận</p>
                      <p className="text-2xl font-bold text-green-300 mt-1">
                        {(revenueData.totalProfit / 1000000).toFixed(2)}M VNĐ
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded p-4">
                      <p className="text-teal-100 text-sm font-semibold">Tỷ suất lợi nhuận</p>
                      <p className="text-2xl font-bold text-yellow-300 mt-1">
                        {revenueData.totalRevenue > 0 ? ((revenueData.totalProfit / revenueData.totalRevenue) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Type Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex gap-2">
                <button
                  onClick={() => setChartType('composed')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'composed'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📈 Kết hợp
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'bar'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Cột
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'line'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📉 Đường
                </button>
              </div>

              {/* Chart */}
              <div className="p-6 overflow-x-auto">
                {loadingChart ? (
                  <div className="flex justify-center items-center h-96">
                    <FaSpinner className="animate-spin text-4xl text-[#03ccba]" />
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'composed' ? (
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthName"
                          label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          label={{ value: 'VNĐ', angle: -90, position: 'insideLeft' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#03ccba" name="💰 Doanh thu" />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          name="📈 Lợi nhuận"
                        />
                      </ComposedChart>
                    ) : chartType === 'bar' ? (
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthName"
                          label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          label={{ value: 'VNĐ', angle: -90, position: 'insideLeft' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#03ccba" name="💰 Doanh thu" />
                        <Bar dataKey="profit" fill="#fbbf24" name="📈 Lợi nhuận" />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthName"
                          label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          label={{ value: 'VNĐ', angle: -90, position: 'insideLeft' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#03ccba"
                          strokeWidth={2}
                          name="💰 Doanh thu"
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#fbbf24"
                          strokeWidth={2}
                          name="📈 Lợi nhuận"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">Không có dữ liệu trong năm {chartYear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 border-b p-4">
                <h2 className="text-xl font-bold text-gray-900">📊 Giao dịch Nạp tiền</h2>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                  <p className="text-red-700 font-semibold">❌ Lỗi</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-4xl text-[#03ccba]" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-bold">STT</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Ngày tạo</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Loại</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Số tiền</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Post ID</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Course ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((tx, index) => (
                            <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm">
                                {pageNo * pageSize + index + 1}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTransactionTypeColor(tx.transactionType)}`}>
                                  {tx.transactionType}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm font-bold text-green-600">
                                {tx.amount?.toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="px-6 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status)}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                {tx.postId ? tx.postId.substring(0, 8) + '...' : '-'}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                {tx.courseId ? tx.courseId.substring(0, 8) + '...' : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                              <FaWallet className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-lg">Không tìm thấy giao dịch nào</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 px-4 py-4 border-t">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNo === 0}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#03ccba] hover:text-[#03ccba] transition-all font-semibold"
                      >
                        ← Trang trước
                      </button>
                      <span className="px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg">
                        Trang {pageNo + 1} / {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNo >= totalPages - 1}
                        className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-semibold"
                      >
                        Trang sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIRTUAL TRANSACTIONS TAB (NEW) ==================== */}
        {activeTab === 'virtual' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6 border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm font-semibold">💸 Tổng Rút tiền</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {(virtualTransactions
                    .filter(t => t.type === 'WITHDRAW' && t.status === 'SUCCESS')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}M VNĐ
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {virtualTransactions.filter(t => t.type === 'WITHDRAW' && t.status === 'SUCCESS').length} giao dịch thành công
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm font-semibold">⏳ Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {virtualTransactions.filter(t => t.status === 'PENDING').length}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {(virtualTransactions
                    .filter(t => t.status === 'PENDING')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}M VNĐ
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow p-6 border-l-4 border-red-500">
                <p className="text-gray-600 text-sm font-semibold">❌ Thất bại</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {virtualTransactions.filter(t => t.status === 'FAILED').length}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {(virtualTransactions
                    .filter(t => t.status === 'FAILED')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}M VNĐ
                </p>
              </div>
            </div>

            {/* Virtual Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <h2 className="text-2xl font-bold">💳 Lịch sử Rút tiền (Withdrawals)</h2>
                <p className="text-orange-100 text-sm mt-2">Quản lý tất cả yêu cầu rút tiền từ người dùng</p>
              </div>

              {errorVirtual && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                  <p className="text-red-700 font-semibold">❌ Lỗi</p>
                  <p className="text-red-600 text-sm mt-1">{errorVirtual}</p>
                </div>
              )}

              {loadingVirtual ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-4xl text-orange-600" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-bold">STT</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Ngày Rút</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Loại</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Số tiền</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-sm font-bold">Ngày Hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody>
                        {virtualTransactions.length > 0 ? (
                          virtualTransactions.map((tx, index) => (
                            <tr key={tx.accountBalanceId || index} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm font-semibold">
                                {pageNoVirtual * pageSize + index + 1}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {formatDate(tx.transactionDate)}
                              </td>
                              <td className="px-6 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getVirtualTypeColor(tx.type)}`}>
                                  {tx.type === 'WITHDRAW' ? (
                                    <>
                                      <FaArrowDown size={12} /> {tx.type}
                                    </>
                                  ) : (
                                    <>
                                      <FaArrowUp size={12} /> {tx.type}
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm font-bold">
                                <span className={tx.type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600'}>
                                  {tx.type === 'WITHDRAW' ? '-' : '+'}{tx.amount?.toLocaleString('vi-VN')} VNĐ
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                                  {tx.status === 'SUCCESS' && '✅'}
                                  {tx.status === 'PENDING' && '⏳'}
                                  {tx.status === 'FAILED' && '❌'}
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {formatDate(tx.completedAt)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center">
                              <FaArrowDown className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-lg">Chưa có yêu cầu rút tiền</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPagesVirtual > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 px-4 py-4 border-t">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNoVirtual === 0}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 hover:text-orange-600 transition-all font-semibold"
                      >
                        ← Trang trước
                      </button>
                      <span className="px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg">
                        Trang {pageNoVirtual + 1} / {totalPagesVirtual}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNoVirtual >= totalPagesVirtual - 1}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-semibold"
                      >
                        Trang sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}