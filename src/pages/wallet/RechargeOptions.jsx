import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaArrowLeft, FaHistory, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import transactionApi from '../../api/transactionApi';
import userApi from '../../api/userApi';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const RECHARGE_OPTIONS = [
  { amount: 100000, label: '100,000 VNĐ' },
  { amount: 200000, label: '200,000 VNĐ' },
  { amount: 500000, label: '500,000 VNĐ' },
  { amount: 1000000, label: '1,000,000 VNĐ' },
  { amount: 2000000, label: '2,000,000 VNĐ' },
];

const TEST_CARD = {
  bank: 'NCB',
  cardNumber: '9704198526191432198',
  cardHolder: 'NGUYEN VAN A',
  expiry: '07/15',
  otp: '123456'
};

const DEBUG = true;

export default function RechargeOptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ==================== STATES ====================
  // Recharge states
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  // Transaction history states
  const [activeTab, setActiveTab] = useState('recharge'); // recharge, transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchMyTransactions();
    }
  }, [activeTab, pageNo]);

  // ==================== API CALLS ====================
  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await userApi.getMyBalance();
      const balanceAmount = response.data?.balance || 0;
      setBalance(balanceAmount);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  // ✅ Fetch my transactions
  const fetchMyTransactions = async () => {
    try {
      setLoadingTransactions(true);
      
      if (DEBUG) console.log('📋 Fetching my transactions... pageNo:', pageNo);
      
      const response = await transactionApi.getMyUserTransactions(pageNo, pageSize);
      
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
      
      if (DEBUG) console.log('✅ Total transactions:', items.length);
      
      setTransactions(items);
      setTotalPages(pages);
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ✅ Update handleRecharge function
  const handleRecharge = async (amount) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Processing recharge:', amount);
      
      if (amount <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }
      
      if (amount > 50000000) {
        setError('Maximum recharge amount is 50,000,000 VNĐ');
        setLoading(false);
        return;
      }
      
      const response = await transactionApi.startTransaction(amount);
      
      console.log('API Response:', response);
      
      // ✅ FIX: Check if response.data is VNPay URL (string) or transaction data (object)
      if (response.success && response.data) {
        // ✅ Case 1: response.data is a VNPay URL string (old behavior)
        if (typeof response.data === 'string' && response.data.includes('vnpay')) {
          console.log('🔗 Redirecting to VNPay URL...');
          window.location.href = response.data;
        } 
        // ✅ Case 2: response.data is transaction object (new backend behavior)
        else if (typeof response.data === 'object' && response.data.id) {
          console.log('✅ Transaction completed!', response.data);
          
          // ✅ Store transaction data for PaymentSuccess page
          const transactionInfo = {
            txnId: response.data.id,
            amount: response.data.amount,
            status: response.data.status,
            timestamp: response.data.completedAt || new Date().toISOString()
          };
          
          // ✅ Save to sessionStorage for retrieval on PaymentSuccess
          sessionStorage.setItem('paymentTransaction', JSON.stringify(transactionInfo));
          
          // ✅ Redirect to PaymentSuccess page
          navigate('/wallet/payment-success', { 
            state: { transactionData: transactionInfo }
          });
        }
      } else {
        setError(response.message || 'Error initiating transaction');
      }
    } catch (err) {
      console.error('Recharge error:', err);
      setError(err.response?.data?.message || 'Unable to process transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmount = async () => {
    if (!customAmount.trim()) {
      setError('Please enter an amount');
      return;
    }
    
    const amount = parseInt(customAmount);
    
    if (isNaN(amount)) {
      setError('Amount must be a valid number');
      return;
    }
    
    await handleRecharge(amount);
  };

  // ✅ Helper functions for transaction display
  const getTransactionTypeInfo = (type) => {
    const types = {
      'ANSWER_COMPLETED': { icon: '✅', label: 'Answer Completed', color: 'bg-green-100 text-green-800' },
      'COURSE_ENROLLED': { icon: '📚', label: 'Course Enrolled', color: 'bg-blue-100 text-blue-800' },
      'RECHARGE': { icon: '💰', label: 'Recharge', color: 'bg-purple-100 text-purple-800' },
      'WITHDRAWAL': { icon: '💸', label: 'Withdrawal', color: 'bg-orange-100 text-orange-800' },
      'PAYMENT': { icon: '💳', label: 'Payment', color: 'bg-indigo-100 text-indigo-800' },
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

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <FaWallet className="text-4xl text-teal-600" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">Recharge Wallet</h1>
                <p className="text-teal-100 text-lg">Add funds to your account and start learning</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/posts')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className="py-12">

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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 flex-wrap">
          <button
            onClick={() => { setActiveTab('recharge'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'recharge'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaWallet className="inline mr-2" size={18} />
            Recharge
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setPageNo(0); }}
            className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'transactions'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FaHistory className="inline mr-2" size={18} />
            History
          </button>
        </div>

        {/* ==================== RECHARGE TAB ==================== */}
        {activeTab === 'recharge' && (
          <div className="space-y-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-lg p-8 mb-8 border-2 border-teal-200">
              <p className="text-teal-700 text-sm font-semibold mb-2">Available Balance</p>
              {loadingBalance ? (
                <div className="animate-pulse h-12 bg-gray-300 rounded w-40"></div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-teal-600">{balance?.toLocaleString('vi-VN')}</p>
                  <p className="text-xl text-teal-600 font-semibold">VNĐ</p>
                </div>
              )}
            </div>

            {/* Recharge Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recharge Amount</h2>
              
              {/* Custom Amount Input */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Amount (VNĐ)
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setError(null);
                      }}
                      step="10000"
                      max="50000000"
                      placeholder="Enter amount (VNĐ)"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-opacity-30 outline-none text-lg font-semibold"
                      disabled={loading}
                    />
                  </div>
                  
                  {/* Recharge Button */}
                  <button
                    onClick={handleCustomAmount}
                    disabled={loading || !customAmount}
                    className="px-10 py-4 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap h-16"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaWallet /> Recharge
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Select */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Packages</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {RECHARGE_OPTIONS.map((option) => (
                    <button
                      key={option.amount}
                      onClick={() => handleRecharge(option.amount)}
                      disabled={loading}
                      className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:from-teal-100 hover:to-cyan-100 transition-all font-bold text-sm text-teal-700 hover:text-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-teal-50 rounded-2xl shadow-lg p-6 border-l-4 border-teal-400">
                <h3 className="text-lg font-bold text-gray-900 mb-3">🔒 Secure Payment</h3>
                <p className="text-gray-700 text-sm">
                  All transactions are encrypted and protected by VNPay - Vietnam's leading payment gateway
                </p>
              </div>

              <div className="bg-cyan-50 rounded-2xl shadow-lg p-6 border-l-4 border-cyan-400">
                <h3 className="text-lg font-bold text-gray-900 mb-3">⚡ Instant Funding</h3>
                <p className="text-gray-700 text-sm">
                  Money is credited instantly after successful payment. No hidden fees.
                </p>
              </div>
            </div>

            {/* Test Card Info */}
            <div className="bg-teal-50 rounded-2xl shadow-lg p-6 border-l-4 border-teal-400">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Test Card Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Bank</p>
                  <p className="text-sm font-bold text-gray-900">{TEST_CARD.bank}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Card Number</p>
                  <p className="text-sm font-mono font-bold text-gray-900">{TEST_CARD.cardNumber}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Cardholder</p>
                  <p className="text-sm font-bold text-gray-900">{TEST_CARD.cardHolder}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Expiry & OTP</p>
                  <p className="text-sm font-bold text-gray-900">{TEST_CARD.expiry} / {TEST_CARD.otp}</p>
                </div>
              </div>
              <div className="bg-teal-100 border-l-4 border-teal-400 p-3 rounded text-xs text-teal-800 mt-4">
                <p className="font-semibold mb-1">📌 Testing Only</p>
                <p>Won't charge real account</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TRANSACTIONS TAB ==================== */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>

            {loadingTransactions ? (
              <div className="flex justify-center py-16">
                <FaSpinner className="animate-spin text-4xl text-teal-600" />
              </div>
            ) : transactions.length > 0 ? (
              <>
                {/* Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Details</th>
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
                              +{tx.amount?.toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {tx.postId ? `Post: ${tx.postId.substring(0, 8)}...` : 
                               tx.courseId ? `Course: ${tx.courseId.substring(0, 8)}...` : 
                               'N/A'}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 font-semibold"
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
        </div>
      </div>
    </div>
  );
}