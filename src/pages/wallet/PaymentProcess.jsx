import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCreditCard, FaLock, FaArrowLeft } from 'react-icons/fa';

export default function PaymentProcess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount } = location.state || { amount: 0 };
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Here you would integrate with VNPay API
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to success page or show error
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/wallet/recharge')}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <FaArrowLeft /> Quay lại
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">Thanh toán VNPay</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Payment summary card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03ccba] bg-opacity-10 rounded-full mb-4">
              <FaCreditCard className="text-[#03ccba] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận thanh toán</h2>
            <p className="text-gray-600">Nạp tiền vào ví GrabTutor</p>
          </div>

          <div className="space-y-6">
            {/* Amount */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số tiền nạp:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </span>
              </div>
            </div>

            {/* VNPay section */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <img src="/vnpay-logo.png" alt="VNPay" className="h-8" />
                <div>
                  <p className="font-medium text-gray-900">Thanh toán qua VNPay</p>
                  <p className="text-sm text-gray-500">Chuyển hướng đến cổng thanh toán an toàn của VNPay</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaLock className="text-gray-400" />
                <span>Bảo mật bởi VNPay Payment Services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/wallet/recharge')}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </div>
            ) : (
              'Tiếp tục thanh toán'
            )}
          </button>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Thông tin thanh toán của bạn được bảo mật.</p>
          <p>Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay.</p>
        </div>
      </div>
    </div>
  );
}