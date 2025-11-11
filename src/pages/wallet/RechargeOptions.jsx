import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaCopy } from 'react-icons/fa';
import transactionApi from '../../api/transactionApi';
import Navbar from '../../components/Navbar';

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

export default function RechargeOptions() {
  const navigate = useNavigate();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTestCard, setShowTestCard] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // ✅ Copy to clipboard
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ✅ Handle recharge - direct API call
  const handleRecharge = async (amount) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Processing recharge:', amount);
      
      // ✅ Validate amount
      if (amount < 50000) {
        setError('Minimum recharge amount is 50,000 VNĐ');
        setLoading(false);
        return;
      }
      
      if (amount > 50000000) {
        setError('Maximum recharge amount is 50,000,000 VNĐ');
        setLoading(false);
        return;
      }
      
      // ✅ Call API to get VNPay URL
      const response = await transactionApi.startTransaction(amount);
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // ✅ Redirect to VNPay immediately
        window.location.href = response.data;
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

  // ✅ Handle preset amount
  const handleSelectAmount = async (amount) => {
    await handleRecharge(amount);
  };

  // ✅ Handle custom amount
  const handleCustomAmount = async () => {
    const amount = parseInt(customAmount);
    
    if (!customAmount.trim()) {
      setError('Please enter an amount');
      return;
    }
    
    if (isNaN(amount)) {
      setError('Amount must be a valid number');
      return;
    }
    
    await handleRecharge(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold">Recharge Wallet</h1>
              <p className="text-teal-100 mt-2">Add money to your account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ✅ MAIN SECTION - Matching Layout from Image */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recharge Amount</h2>
          
          {/* ✅ Matching the image layout - Label on top, Input below */}
          <div className="mb-12">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Amount (VNĐ)
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setError(null);
                  }}
                  min="50000"
                  step="10000"
                  max="50000000"
                  placeholder="Minimum 50,000 VNĐ"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none text-lg font-semibold"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  From 50,000 to 50,000,000 VNĐ
                </p>
              </div>
              
              {/* ✅ Recharge Button - Right side */}
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

          {/* Preset Amounts */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Select</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {RECHARGE_OPTIONS.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handleSelectAmount(option.amount)}
                  disabled={loading}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#03ccba] hover:bg-[#03ccba] hover:bg-opacity-5 transition-all font-bold text-sm text-gray-900 hover:text-[#03ccba] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
                <h3 className="text-lg font-bold text-gray-900 mb-3">🔒 Secure Payment</h3>
                <p className="text-gray-700 text-sm">
                  All transactions are encrypted and protected by VNPay - Vietnam's leading payment gateway
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
                <h3 className="text-lg font-bold text-gray-900 mb-3">⚡ Instant Funding</h3>
                <p className="text-gray-700 text-sm">
                  Money is credited instantly after successful payment. No hidden fees.
                </p>
              </div>
            </div>

            {/* Step Guide */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
              <div className="flex gap-4">
                <FaCheckCircle className="text-green-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">✅ How to Recharge</h4>
                  <ol className="text-gray-700 text-sm space-y-2 list-decimal list-inside">
                    <li>Enter amount or select quick option</li>
                    <li>Click "Recharge" button</li>
                    <li>You'll be redirected to VNPay payment gateway</li>
                    <li>Use test card info from the right</li>
                    <li>Complete the payment</li>
                    <li>Funds appear in your wallet instantly</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Test Card Info (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              Test Card Info - PROMINENT
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">💳</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Test Card</h3>
                </div>

                {/* Quick Info */}
                <div className="space-y-3">
                  {/* Bank */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Bank</p>
                    <p className="text-sm font-bold text-gray-900">{TEST_CARD.bank}</p>
                  </div>

                  {/* Card Number
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Card Number</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-mono font-bold text-gray-900 break-all">{TEST_CARD.cardNumber}</p>
                      <button
                        onClick={() => copyToClipboard(TEST_CARD.cardNumber, 'cardNumber')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Copy"
                      >
                        <FaCopy size={14} className={copiedField === 'cardNumber' ? 'text-green-600' : 'text-gray-400'} />
                      </button>
                    </div>
                  </div>

                  {/* Cardholder */}
                  {/* <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Cardholder</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{TEST_CARD.cardHolder}</p>
                      <button
                        onClick={() => copyToClipboard(TEST_CARD.cardHolder, 'cardHolder')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      >
                        <FaCopy size={14} className={copiedField === 'cardHolder' ? 'text-green-600' : 'text-gray-400'} />
                      </button>
                    </div>
                  </div> */}

                  {/* Expiry */}
                  {/* <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Issue Date</p>
                    <p className="text-sm font-bold text-gray-900">{TEST_CARD.expiry}</p>
                  </div> */}

                  {/* OTP */}
                  {/* <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700 font-semibold mb-1">🔐 OTP Code</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-mono font-bold text-red-600">{TEST_CARD.otp}</p>
                      <button
                        onClick={() => copyToClipboard(TEST_CARD.otp, 'otp')}
                        className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                      >
                        <FaCopy size={14} className={copiedField === 'otp' ? 'text-green-600' : 'text-gray-600'} />
                      </button>
                    </div>
                  </div>*/}
                </div> 

                {/* Info Alert */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-yellow-800 mt-4">
                  <p className="font-semibold mb-1">📌 Testing Only</p>
                  <p>Won't charge real account</p>
                </div>
              </div>

              {/* FAQ Sidebar */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">❓ FAQ</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-bold text-gray-900 text-xs">How much?</p>
                    <p className="text-gray-600 text-xs">50K - 50M VNĐ</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-bold text-gray-900 text-xs">Safe?</p>
                    <p className="text-gray-600 text-xs">Yes! VNPay secure</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-bold text-gray-900 text-xs">Speed?</p>
                    <p className="text-gray-600 text-xs">Instant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}