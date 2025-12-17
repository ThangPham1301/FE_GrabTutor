import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Navbar from '../../components/Navbar';

const DEBUG = true;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract transaction data from URL parameters
    const extractTransactionData = () => {
      try {
        const txnId = searchParams.get('vnp_TxnRef');
        const amount = searchParams.get('vnp_Amount');
        const bankCode = searchParams.get('vnp_BankCode');
        const bankTranNo = searchParams.get('vnp_BankTranNo');
        const cardType = searchParams.get('vnp_CardType');
        const responseCode = searchParams.get('vnp_ResponseCode');
        const transactionNo = searchParams.get('vnp_TransactionNo');

        if (DEBUG) {
          console.log('=== Payment Success Data ===');
          console.log('TxnRef:', txnId);
          console.log('Amount:', amount);
          console.log('BankCode:', bankCode);
          console.log('ResponseCode:', responseCode);
        }

        // Parse amount (VNPay returns amount in 100 VNĐ units)
        const actualAmount = amount ? parseInt(amount) / 100 : 0;

        setTransactionData({
          txnId: txnId || 'N/A',
          amount: actualAmount,
          bankCode: bankCode || 'N/A',
          bankTranNo: bankTranNo || 'N/A',
          cardType: cardType || 'ATM',
          responseCode: responseCode,
          transactionNo: transactionNo || 'N/A',
          timestamp: new Date().toLocaleString('vi-VN')
        });

        setLoading(false);
      } catch (error) {
        console.error('Error extracting transaction data:', error);
        setLoading(false);
      }
    };

    extractTransactionData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-blue-600 mb-4 mx-auto" />
            <p className="text-gray-600 text-lg">Processing payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Success Container */}
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <FaCheckCircle className="text-green-600 text-6xl" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-green-50 text-lg">Your wallet has been recharged</p>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              
              {/* Success Message */}
              <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-green-800 font-semibold text-lg">
                  ✅ Your recharge has been completed successfully!
                </p>
                <p className="text-green-700 text-sm mt-2">
                  The funds will be available in your wallet immediately.
                </p>
              </div>

              {/* Transaction Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Amount */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Amount Recharged</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {transactionData?.amount?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>

                  {/* Transaction ID */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Transaction ID</p>
                    <p className="text-sm font-mono text-purple-600 break-all">
                      {transactionData?.txnId}
                    </p>
                  </div>

                  {/* Bank Code */}
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Payment Method</p>
                    <p className="text-lg font-bold text-gray-900">
                      {transactionData?.bankCode} ({transactionData?.cardType})
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Date & Time</p>
                    <p className="text-lg font-bold text-gray-900">
                      {transactionData?.timestamp}
                    </p>
                  </div>

                  {/* Bank Transaction No */}
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400 md:col-span-1">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Bank Ref No</p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {transactionData?.bankTranNo}
                    </p>
                  </div>

                  {/* Transaction No */}
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400 md:col-span-1">
                    <p className="text-gray-600 text-sm font-semibold mb-2">VNPay Ref No</p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {transactionData?.transactionNo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">📋 What's Next?</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ Your wallet balance has been updated</li>
                  <li>✓ You can now use your balance to enroll in courses or book tutors</li>
                  <li>✓ Check your transaction history in the wallet section</li>
                  <li>✓ You will receive a confirmation email shortly</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Back Button */}
                <button
                  onClick={() => navigate('/wallet/recharge')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaArrowLeft /> Back to Wallet
                </button>

                {/* Continue Shopping Button */}
                <button
                  onClick={() => navigate('/posts')}
                  className="flex-1 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all"
                >
                  🔍 Explore Posts
                </button>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">
              Need help? Contact our support team
            </p>
            <p className="text-gray-500 text-sm">
              Email: <span className="text-blue-600 font-semibold">support@grabtutor.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
