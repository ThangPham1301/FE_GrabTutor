import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaChartLine, FaHistory, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../api/userApi';
import transactionApi from '../../api/transactionApi';
import Navbar from '../../components/Navbar';

export default function TutorWallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, info

  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }
    fetchBalance();
    fetchTransactions();
  }, [user]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await userApi.getMyBalance();
      console.log('Balance response:', response);
      
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

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await transactionApi.getMyTransactions(0, 20);
      
      let items = [];
      if (response.data?.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setTransactions(items);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRefresh = () => {
    fetchBalance();
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Main Content - Start directly */}
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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
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
            onClick={() => setActiveTab('transactions')}
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
            onClick={() => setActiveTab('info')}
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

        {/* Tab Content */}
        <div className="space-y-8">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Balance Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Balance</h2>
                
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
                            {balance?.toLocaleString('vi-VN')}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">VNĐ</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                      <p className="text-blue-900 text-sm font-semibold mb-1">💰 Total Earnings</p>
                      <p className="text-3xl font-bold text-blue-600">{balance?.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                      <p className="text-purple-900 text-sm font-semibold mb-1">📊 Last Updated</p>
                      <p className="text-lg font-bold text-purple-600">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">✅ How to Earn</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li>✓ Accept tutor bids on student questions</li>
                    <li>✓ Create and publish paid courses</li>
                    <li>✓ Complete tutoring sessions</li>
                    <li>✓ Receive course enrollment payments</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Withdrawal Info</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li>✓ Minimum withdrawal: 100,000 VNĐ</li>
                    <li>✓ Processing time: 1-3 business days</li>
                    <li>✓ Bank transfer to your account</li>
                    <li>✓ No hidden fees or charges</li>
                  </ul>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleRefresh}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  🔄 Refresh Balance
                </button>
              </div>
            </div>
          )}

          {/* ==================== TRANSACTIONS TAB ==================== */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>

              {loadingTransactions ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={transaction.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(transaction.createdAt || transaction.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              transaction.type === 'EARNING' || transaction.type === 'CREDIT'
                                ? 'bg-green-100 text-green-800'
                                : transaction.type === 'WITHDRAWAL'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {transaction.description || transaction.reason || 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold text-right ${
                            transaction.type === 'EARNING' || transaction.type === 'CREDIT'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'EARNING' || transaction.type === 'CREDIT' ? '+' : '-'}
                            {(transaction.amount || 0).toLocaleString('vi-VN')} VNĐ
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              transaction.status === 'COMPLETED' || transaction.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FaHistory className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No transactions yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start earning by accepting bids or selling courses!</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== INFO TAB ==================== */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
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
                <div className="space-y-6">
                  <div>
                    <p className="font-bold text-gray-900 mb-2">How often is balance updated?</p>
                    <p className="text-gray-600 text-sm">Balance updates automatically after each transaction.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">When can I withdraw?</p>
                    <p className="text-gray-600 text-sm">Once your balance reaches 100,000 VNĐ, you can request withdrawal anytime.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Are there any fees?</p>
                    <p className="text-gray-600 text-sm">No! We don't charge any withdrawal fees. You get 100% of your earnings.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Need help?</p>
                    <p className="text-gray-600 text-sm">Contact support at support@grabtutor.com or call +84-xxx-xxx-xxx</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}