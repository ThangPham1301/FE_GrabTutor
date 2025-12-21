import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWallet, FaChartLine, FaHistory, FaCreditCard, FaCheckCircle, 
  FaExclamationTriangle, FaSpinner, FaMoneyBillWave, FaArrowDown,
  FaArrowUp, FaLock, FaPhone, FaGraduationCap, FaCheckDouble,
  FaTimes, FaBuilding, FaExchangeAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../api/userApi';
import transactionApi from '../../api/transactionApi';
import Navbar from '../../components/Navbar';

const DEBUG = true;

export default function TutorWallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ==================== STATES ====================
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [virtualTransactions, setVirtualTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingVirtual, setLoadingVirtual] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, virtual, withdraw, info
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalVirtualPages, setTotalVirtualPages] = useState(0);
  
  // Withdraw modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }
    fetchBalance();
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'virtual') {
      fetchVirtualTransactions();
    }
  }, [user, activeTab, pageNo]);

  // ==================== API CALLS ====================
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await userApi.getMyBalance();
      if (DEBUG) console.log('Balance response:', response);
      
      const balanceAmount = response.data?.balance || 0;
      setBalance(balanceAmount);
      setError(null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to load wallet balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch old transactions (legacy)
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      
      if (DEBUG) console.log('📋 Fetching transactions... pageNo:', pageNo);
      
      const response = await transactionApi.getMyUserTransactions(pageNo, pageSize);
      
      if (DEBUG) console.log('📋 Transactions response:', response);
      
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
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ✅ NEW - Fetch virtual transactions (withdrawals)
  const fetchVirtualTransactions = async () => {
    try {
      setLoadingVirtual(true);
      
      if (DEBUG) console.log('📋 Fetching virtual transactions... pageNo:', pageNo);
      
      const response = await transactionApi.getMyVirtualTransactions(pageNo, pageSize);
      
      if (DEBUG) console.log('📋 Virtual transactions response:', response);
      
      let items = [];
      let pages = 0;
      
      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        pages = response.data.totalPages || 0;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
        pages = response.totalPages || 0;
      }
      
      if (DEBUG) console.log('📋 Total virtual transactions:', items.length);
      
      setVirtualTransactions(items);
      setTotalVirtualPages(pages);
    } catch (error) {
      console.error('❌ Error fetching virtual transactions:', error);
      setVirtualTransactions([]);
    } finally {
      setLoadingVirtual(false);
    }
  };

  // ✅ NEW - Handle withdrawal
  const handleWithdraw = async () => {
    try {
      const amount = parseInt(withdrawAmount);
      
      if (isNaN(amount)) {
        alert('❌ Please enter a valid amount');
        return;
      }
      
      if (amount < 100000) {
        alert('❌ Minimum withdrawal amount is 100,000 VNĐ');
        return;
      }
      
      if (amount > balance) {
        alert('❌ Insufficient balance');
        return;
      }
      
      setWithdrawLoading(true);
      
      const response = await transactionApi.withdrawBalance(amount);
      
      if (DEBUG) console.log('💳 Withdraw response:', response);
      
      if (response.success) {
        setWithdrawSuccess({
          amount: response.data?.amount,
          type: response.data?.type,
          status: response.data?.status
        });
        
        // Update balance immediately
        setBalance(prev => prev - amount);
        
        // Reset form
        setWithdrawAmount('');
        setShowWithdrawModal(false);
        
        // Refresh virtual transactions
        await fetchVirtualTransactions();
        
        // Close success after 3 seconds
        setTimeout(() => setWithdrawSuccess(null), 3000);
      } else {
        alert('❌ Withdrawal failed: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Withdrawal error:', error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleRefresh = () => {
    setPageNo(0);
    fetchBalance();
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'virtual') {
      fetchVirtualTransactions();
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const handleNextPage = () => {
    const maxPages = activeTab === 'transactions' ? totalPages : totalVirtualPages;
    if (pageNo < maxPages - 1) setPageNo(pageNo + 1);
  };

  // ✅ Format transaction type
  const getTransactionTypeInfo = (type) => {
    const types = {
      'ANSWER_COMPLETED': { icon: '✅', label: 'Answer Completed', color: 'bg-green-100 text-green-800' },
      'COURSE_ENROLLED': { icon: '📚', label: 'Course Enrolled', color: 'bg-blue-100 text-blue-800' },
      'RECHARGE': { icon: '💰', label: 'Recharge', color: 'bg-purple-100 text-purple-800' },
      'WITHDRAWAL': { icon: '💸', label: 'Withdrawal', color: 'bg-orange-100 text-orange-800' },
      'WITHDRAW': { icon: '💸', label: 'Withdrawal', color: 'bg-orange-100 text-orange-800' },
      'PAYMENT': { icon: '💳', label: 'Payment', color: 'bg-indigo-100 text-indigo-800' },
      'ADD_FUND': { icon: '➕', label: 'Add Fund', color: 'bg-cyan-100 text-cyan-800' },
      'DEFAULT': { icon: '📊', label: 'Transaction', color: 'bg-gray-100 text-gray-800' }
    };
    return types[type] || types['DEFAULT'];
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

  const formatCurrency = (value) => {
    return value?.toLocaleString('vi-VN') || '0';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {withdrawSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-8 flex items-start gap-3">
            <FaCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-semibold">✅ Withdrawal Successful!</p>
              <p className="text-green-600 text-sm">
                {formatCurrency(withdrawSuccess.amount)} VNĐ withdrawn successfully
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 flex-wrap">
          <button
            onClick={() => { setActiveTab('overview'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaWallet className="inline mr-2" size={18} />
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'transactions'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaHistory className="inline mr-2" size={18} />
            Transactions
          </button>
          <button
            onClick={() => { setActiveTab('virtual'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'virtual'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaArrowDown className="inline mr-2" size={18} />
            Withdrawals
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'withdraw'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaMoneyBillWave className="inline mr-2" size={18} />
            Withdraw Now
          </button>
          <button
            onClick={() => { setActiveTab('info'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'info'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaCheckCircle className="inline mr-2" size={18} />
            Info
          </button>
        </div>

        <div className="space-y-8">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Balance Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Current Balance</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Balance Display */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <FaWallet className="text-white text-2xl" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Available Balance</p>
                        {loading ? (
                          <div className="animate-pulse h-8 bg-gray-300 rounded w-32"></div>
                        ) : (
                          <p className="text-4xl font-bold text-green-600">
                            {formatCurrency(balance)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">VNĐ</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold">Total Earned</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {formatCurrency(transactions.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0))}
                          </p>
                        </div>
                        <FaArrowUp className="text-blue-600 text-3xl opacity-20" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold">Total Withdrawn</p>
                          <p className="text-2xl font-bold text-orange-600 mt-1">
                            {formatCurrency(virtualTransactions.filter(t => t.type === 'WITHDRAW' && t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0))}
                          </p>
                        </div>
                        <FaArrowDown className="text-orange-600 text-3xl opacity-20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave /> Withdraw
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FaSpinner className="animate-spin" /> Refresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TRANSACTIONS TAB (Legacy) ==================== */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Transaction History</h2>

              {loadingTransactions ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-4xl text-green-600" />
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, index) => {
                          const typeInfo = getTransactionTypeInfo(tx.transactionType);
                          const statusColor = getStatusColor(tx.status);
                          
                          return (
                            <tr key={tx.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(tx.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${typeInfo.color}`}>
                                  {typeInfo.icon} {typeInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-green-600">
                                +{formatCurrency(tx.amount)} VNĐ
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNo === 0}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 font-semibold"
                      >
                        ← Previous
                      </button>
                      <span className="px-4 py-2 font-semibold text-gray-700">
                        Page {pageNo + 1} / {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNo >= totalPages - 1}
                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 font-semibold"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <FaHistory className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No transactions yet</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== WITHDRAWALS TAB (NEW) ==================== */}
          {activeTab === 'virtual' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💸 Withdrawal History</h2>

              {loadingVirtual ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-4xl text-orange-600" />
                </div>
              ) : virtualTransactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {virtualTransactions.map((tx, index) => {
                          const typeInfo = getTransactionTypeInfo(tx.type);
                          const statusColor = getStatusColor(tx.status);
                          
                          return (
                            <tr key={tx.accountBalanceId || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(tx.transactionDate)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${typeInfo.color}`}>
                                  {typeInfo.icon} {typeInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-orange-600">
                                {tx.type === 'WITHDRAW' ? '-' : '+'}{formatCurrency(tx.amount)} VNĐ
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(tx.completedAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalVirtualPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handlePrevPage}
                        disabled={pageNo === 0}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 font-semibold"
                      >
                        ← Previous
                      </button>
                      <span className="px-4 py-2 font-semibold text-gray-700">
                        Page {pageNo + 1} / {totalVirtualPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNo >= totalVirtualPages - 1}
                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 font-semibold"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <FaArrowDown className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No withdrawals yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start withdrawing to see your history here</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== WITHDRAW NOW TAB (NEW) ==================== */}
          {activeTab === 'withdraw' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Withdraw Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Withdraw Money</h2>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Current Balance</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {formatCurrency(balance)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">VNĐ</p>
                  </div>

                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Withdrawal Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter amount (minimum 100,000 VNĐ)"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-lg font-semibold"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">
                          VNĐ
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum: 100,000 VNĐ | Maximum: {formatCurrency(balance)} VNĐ
                      </p>
                    </div>

                    {/* Quick Select Buttons */}
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">Quick Select</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[500000, 1000000, 2000000, 5000000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setWithdrawAmount(amount.toString())}
                            disabled={amount > balance}
                            className="px-4 py-2 border-2 border-green-500 text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {formatCurrency(amount)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-sm text-yellow-800">
                        <span className="font-bold">⏱️ Processing Time:</span> 1-3 business days
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        <span className="font-bold">📊 Fee:</span> Free withdrawal
                      </p>
                    </div>

                    {/* Withdraw Button */}
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={!withdrawAmount || parseInt(withdrawAmount) < 100000 || parseInt(withdrawAmount) > balance}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaMoneyBillWave /> Withdraw {withdrawAmount ? formatCurrency(parseInt(withdrawAmount)) : '0'} VNĐ
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">ℹ️ Withdrawal Info</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <FaBuilding className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Bank Transfer</p>
                        <p className="text-xs text-gray-600">Directly to your registered account</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <FaLock className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Secure</p>
                        <p className="text-xs text-gray-600">SSL encrypted transactions</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <FaCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Fast Processing</p>
                        <p className="text-xs text-gray-600">1-3 business days</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">❓ FAQ</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">How long does it take?</p>
                      <p className="text-xs text-gray-600">Usually 1-3 business days</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Is there a fee?</p>
                      <p className="text-xs text-gray-600">No fees for withdrawals</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Minimum amount?</p>
                      <p className="text-xs text-gray-600">100,000 VNĐ minimum</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== INFO TAB ==================== */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Account Information</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Name</p>
                    <p className="text-lg font-bold text-gray-900">{user?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Email</p>
                    <p className="text-lg font-bold text-gray-900">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Phone</p>
                    <p className="text-lg font-bold text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Role</p>
                    <p className="text-lg font-bold text-green-600">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ FAQ</h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">How do I withdraw money?</p>
                    <p className="text-gray-600 text-sm">Go to the "Withdraw Now" tab, enter the amount, and confirm. The money will be transferred to your registered bank account within 1-3 business days.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">When will I receive payment?</p>
                    <p className="text-gray-600 text-sm">Payments are processed within 1-3 business days after your withdrawal request.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">What's the minimum withdrawal?</p>
                    <p className="text-gray-600 text-sm">The minimum withdrawal amount is 100,000 VNĐ.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Are there withdrawal fees?</p>
                    <p className="text-gray-600 text-sm">No, there are no fees for withdrawals from your wallet.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== WITHDRAW CONFIRMATION MODAL ==================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Withdrawal</h2>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <p className="text-gray-600 text-sm font-semibold mb-2">Withdrawal Amount</p>
              <p className="text-4xl font-bold text-green-600">
                {formatCurrency(parseInt(withdrawAmount))}
              </p>
              <p className="text-sm text-gray-600 mt-2">VNĐ</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-bold">⏱️ Processing:</span> 1-3 business days
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-bold">🏦 Destination:</span> Your registered bank account
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {withdrawLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FaCheckDouble /> Confirm Withdrawal
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                disabled={withdrawLoading}
                className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}