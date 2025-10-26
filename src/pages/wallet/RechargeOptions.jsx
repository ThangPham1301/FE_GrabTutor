import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet } from 'react-icons/fa';

const RECHARGE_OPTIONS = [
  { amount: 100000, label: '100,000 VNĐ' },
  { amount: 200000, label: '200,000 VNĐ' },
  { amount: 500000, label: '500,000 VNĐ' },
  { amount: 1000000, label: '1,000,000 VNĐ' },
  { amount: 2000000, label: '2,000,000 VNĐ' },
];

export default function RechargeOptions() {
  const navigate = useNavigate();

  const handleSelectAmount = (amount) => {
    navigate(`/wallet/recharge/payment`, { state: { amount } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaWallet className="text-2xl text-[#03ccba]" />
              <h1 className="text-2xl font-bold text-gray-900">Nạp tiền vào ví</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Current balance */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Số dư hiện tại</p>
            <p className="text-3xl font-bold text-gray-900">0 VNĐ</p>
          </div>

          {/* Recharge options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {RECHARGE_OPTIONS.map((option) => (
              <button
                key={option.amount}
                onClick={() => handleSelectAmount(option.amount)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#03ccba] hover:bg-gray-50 transition-all"
              >
                <p className="text-xl font-bold text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">Nạp qua VNPay</p>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập số tiền khác
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                min="50000"
                step="10000"
                placeholder="Tối thiểu 50,000 VNĐ"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              />
              <button
                onClick={() => {/* Handle custom amount */}}
                className="px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
              >
                Nạp tiền
              </button>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Phương thức thanh toán</h2>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
            <img src="/vnpay-logo.png" alt="VNPay" className="h-8" />
            <div>
              <p className="font-medium">VNPay</p>
              <p className="text-sm text-gray-500">Thanh toán an toàn qua VNPay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}