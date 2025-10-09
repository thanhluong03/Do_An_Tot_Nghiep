// components/VoucherModal.js
'use client';

import React, { useState, useEffect } from 'react';
import { voucherApi, Voucher } from '../../api/modules/voucher';
import { formatPrice } from '../../utils/format';

interface VoucherModalProps {
  customerId: string | number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherModal({ customerId, isOpen, onClose }: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingClaimId, setLoadingClaimId] = useState<string | number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadVouchers = async () => {
      setLoadingList(true);
      setMessage(null);
      try {
        const data = await voucherApi.fetchAvailableVouchers();
        setVouchers(data.map(v => ({ ...v, isClaimed: false }))); // Thêm flag isClaimed tạm thời
      } catch (error) {
        setMessage('Không thể tải danh sách voucher. Vui lòng thử lại.');
      } finally {
        setLoadingList(false);
      }
    };
    loadVouchers();
  }, [isOpen]);

  const handleClaim = async (voucherId: string | number) => {
    if (!customerId) {
      setMessage('❌ Vui lòng đăng nhập để nhận voucher.');
      return;
    }
    setLoadingClaimId(voucherId);
    setMessage(null);

    try {
      await voucherApi.claimVoucher(customerId, voucherId);
      setMessage(`✅ Đã lưu voucher thành công! Mã: ${vouchers.find(v => v.id === voucherId)?.code}`);
      setVouchers(prev => 
          prev.map(v => v.id === voucherId ? { ...v, isClaimed: true } : v)
      );
    } catch (error: any) {
      setMessage(`❌ Lỗi khi lưu: ${error.response?.data?.message || 'Không thể nhận voucher.'}`);
    } finally {
      setLoadingClaimId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🎁 Mã Giảm Giá Dành Cho Bạn</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        {message && <div className={`p-2 mb-3 rounded text-sm ${message.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}
        
        {loadingList ? (<p className="text-center text-gray-600">Đang tải voucher...</p>) : (
          <div className="space-y-3">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className={`border p-3 rounded flex justify-between items-center ${voucher.isClaimed ? 'bg-gray-50' : ''}`}>
                <div>
                  <div className="font-semibold text-lg text-[#65604E]">{voucher.code}</div>
                  <p className="text-sm text-gray-600">{voucher.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu: {formatPrice(voucher.min_order_value)}</p>
                </div>
                <button
                  onClick={() => handleClaim(voucher.id)}
                  disabled={voucher.isClaimed || loadingClaimId === voucher.id}
                  className={`px-4 py-2 text-sm rounded transition ${
                    voucher.isClaimed
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                  }`}
                >
                  {loadingClaimId === voucher.id ? 'Đang Lấy...' : voucher.isClaimed ? 'Đã Nhận' : 'Lấy Voucher'}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-[#65604E]">Đóng</button>
        </div>
      </div>
    </div>
  );
}