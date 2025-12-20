import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaWallet,
  FaChartLine,
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';
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
  ComposedChart,
} from 'recharts';
import Navbar from '../../components/Navbar';
import transactionApi from '../../api/transactionApi';
import statisticApi from '../../api/statisticApi';

const DEBUG = true;

export default function AdminTransactions() {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [activeTab, setActiveTab] = useState('recharge');

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

  // ✅ Fetch Recharge Transactions
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

  // ✅ Fetch Virtual Transactions (Withdrawals)
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
        totalProfit,
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.monthName}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
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
      'DEFAULT': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors['DEFAULT'];
  };

  const getVirtualTypeColor = (type) => {
    const colors = {
      'WITHDRAW': 'bg-orange-100 text-orange-800',
      'ADD_FUND': 'bg-blue-100 text-blue-800',
      'DEFAULT': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors['DEFAULT'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUCCESS': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'DEFAULT': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors['DEFAULT'];
  };

  const formatCurrency = (value) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const chartData = revenueData?.monthly?.map((item) => ({
    ...item,
    monthName: monthNames[item.month - 1],
  })) || [];

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaWallet size={28} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">💰 Wallet & Transactions</h1>
              <p className="text-teal-100 text-lg mt-1">
                Manage all user recharges and withdrawal requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ==================== TAB NAVIGATION ==================== */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-200 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('recharge');
              setPageNo(0);
            }}
            className={`pb-4 px-6 font-bold text-lg transition-colors border-b-4 -mb-2 ${
              activeTab === 'recharge'
                ? 'text-[#03ccba] border-[#03ccba]'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaArrowUp className="inline mr-2" />
            Recharge Transactions
          </button>
          <button
            onClick={() => {
              setActiveTab('virtual');
              setPageNoVirtual(0);
            }}
            className={`pb-4 px-6 font-bold text-lg transition-colors border-b-4 -mb-2 ${
              activeTab === 'virtual'
                ? 'text-[#03ccba] border-[#03ccba]'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaArrowDown className="inline mr-2" />
            Withdrawals
          </button>
        </div>

        {/* ==================== RECHARGE TAB ==================== */}
        {activeTab === 'recharge' && (
          <div className="space-y-8">
            {/* ========== Revenue Chart Card ========== */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FaChartLine /> Revenue & Profit Analysis
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-15 rounded-lg p-4 backdrop-blur">
                      <p className="text-teal-100 text-sm font-semibold">Total Revenue</p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {(revenueData.totalRevenue / 1000000).toFixed(2)}M VNĐ
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-lg p-4 backdrop-blur">
                      <p className="text-teal-100 text-sm font-semibold">Total Profit</p>
                      <p className="text-3xl font-bold text-green-300 mt-2">
                        {(revenueData.totalProfit / 1000000).toFixed(2)}M VNĐ
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-15 rounded-lg p-4 backdrop-blur">
                      <p className="text-teal-100 text-sm font-semibold">Profit Margin</p>
                      <p className="text-3xl font-bold text-yellow-300 mt-2">
                        {revenueData.totalRevenue > 0
                          ? ((revenueData.totalProfit / revenueData.totalRevenue) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Type Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex gap-2 flex-wrap">
                <button
                  onClick={() => setChartType('composed')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'composed'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📈 Composed
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'bar'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    chartType === 'line'
                      ? 'bg-[#03ccba] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📉 Line
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
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthName" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#03ccba" name="💰 Revenue" radius={[8, 8, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          name="📈 Profit"
                          dot={{ fill: '#fbbf24', r: 5 }}
                        />
                      </ComposedChart>
                    ) : chartType === 'bar' ? (
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthName" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#03ccba" name="💰 Revenue" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="profit" fill="#fbbf24" name="📈 Profit" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthName" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#03ccba"
                          strokeWidth={2}
                          name="💰 Revenue"
                          dot={{ fill: '#03ccba', r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#fbbf24"
                          strokeWidth={2}
                          name="📈 Profit"
                          dot={{ fill: '#fbbf24', r: 5 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No data available for {chartYear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ========== Transactions Table Card ========== */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaMoneyBillWave /> Recharge Transactions
                </h2>
                <p className="text-purple-100 text-sm mt-1">All user wallet recharge records</p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
                  <p className="text-red-700 font-semibold">❌ Error</p>
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">No.</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Post ID</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Course ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((tx, index) => (
                            <tr
                              key={tx.id}
                              className="border-b hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                {pageNo * pageSize + index + 1}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(tx.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTransactionTypeColor(tx.transactionType)}`}>
                                  {tx.transactionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-green-600">
                                {tx.amount?.toLocaleString('en-US')} VNĐ
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                                  {tx.status === 'SUCCESS' && <FaCheckCircle size={12} />}
                                  {tx.status === 'FAILED' && <FaTimesCircle size={12} />}
                                  {tx.status === 'PENDING' && <FaClock size={12} />}
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                {tx.postId ? tx.postId.substring(0, 8) + '...' : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                {tx.courseId ? tx.courseId.substring(0, 8) + '...' : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                              <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-lg">No transactions found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 px-6 py-6 border-t border-gray-200">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNo === 0}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all font-semibold"
                      >
                        ← Previous
                      </button>
                      <span className="px-6 py-3 font-bold text-gray-700 bg-gray-100 rounded-lg">
                        Page {pageNo + 1} / {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNo >= totalPages - 1}
                        className="px-6 py-3 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-all font-semibold"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIRTUAL TRANSACTIONS TAB ==================== */}
        {activeTab === 'virtual' && (
          <div className="space-y-8">
            {/* ========== Stats Cards ========== */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold mb-2">💸 Total Withdrawn</p>
                <p className="text-3xl font-bold text-orange-600">
                  {(virtualTransactions
                    .filter((t) => t.type === 'WITHDRAW' && t.status === 'SUCCESS')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}
                  M VNĐ
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {virtualTransactions.filter((t) => t.type === 'WITHDRAW' && t.status === 'SUCCESS').length} successful
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold mb-2">⏳ Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {virtualTransactions.filter((t) => t.status === 'PENDING').length}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {(virtualTransactions
                    .filter((t) => t.status === 'PENDING')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}
                  M VNĐ
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold mb-2">❌ Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {virtualTransactions.filter((t) => t.status === 'FAILED').length}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {(virtualTransactions
                    .filter((t) => t.status === 'FAILED')
                    .reduce((sum, t) => sum + (t.amount || 0), 0) / 1000000).toFixed(2)}
                  M VNĐ
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold mb-2">📊 Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">
                  {virtualTransactions.length}
                </p>
                <p className="text-xs text-gray-600 mt-2">All withdrawal requests</p>
              </div>
            </div>

            {/* ========== Virtual Transactions Table ========== */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  💳 Withdrawal History
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  Manage all user withdrawal requests
                </p>
              </div>

              {errorVirtual && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
                  <p className="text-red-700 font-semibold">❌ Error</p>
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">No.</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {virtualTransactions.length > 0 ? (
                          virtualTransactions.map((tx, index) => {
                            const typeInfo = getVirtualTypeColor(tx.type);
                            const statusColor = getStatusColor(tx.status);

                            return (
                              <tr
                                key={tx.accountBalanceId || index}
                                className="border-b hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                  {pageNoVirtual * pageSize + index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {formatDate(tx.transactionDate)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${typeInfo}`}>
                                    {tx.type === 'WITHDRAW' ? (
                                      <>
                                        <FaArrowDown size={12} /> Withdrawal
                                      </>
                                    ) : (
                                      <>
                                        <FaArrowUp size={12} /> Add Fund
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold">
                                  <span className={tx.type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600'}>
                                    {tx.type === 'WITHDRAW' ? '-' : '+'}
                                    {tx.amount?.toLocaleString('en-US')} VNĐ
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${statusColor}`}>
                                    {tx.status === 'SUCCESS' && <FaCheckCircle size={12} />}
                                    {tx.status === 'PENDING' && <FaClock size={12} />}
                                    {tx.status === 'FAILED' && <FaTimesCircle size={12} />}
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {formatDate(tx.completedAt)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              <FaArrowDown className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-lg">No withdrawal requests yet</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPagesVirtual > 1 && (
                    <div className="flex justify-center items-center gap-4 px-6 py-6 border-t border-gray-200">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNoVirtual === 0}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all font-semibold"
                      >
                        ← Previous
                      </button>
                      <span className="px-6 py-3 font-bold text-gray-700 bg-gray-100 rounded-lg">
                        Page {pageNoVirtual + 1} / {totalPagesVirtual}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNoVirtual >= totalPagesVirtual - 1}
                        className="px-6 py-3 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-all font-semibold"
                      >
                        Next →
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