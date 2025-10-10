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
        console.log('📦 Raw vouchers:', data);
        
        const list = Array.isArray(data) ? data : [];
        
        // Chuẩn hóa dữ liệu voucher
        const normalized = list.map((v: any) => {
          const voucherId = v.id || v._id;
          return {
            id: voucherId,
            _id: v._id,
            name: v.name || v.title || '',
            code: v.code || '',
            description: v.description || v.desc || '',
            voucher_percentage: Number(v.voucher_percentage || v.discount || v.discount_value || 0),
            discount_value: Number(v.discount_value || v.voucher_percentage || v.discount || 0),
            discount_type: (v.discount_type || 'PERCENT').toUpperCase() as 'FIXED' | 'PERCENT',
            quantity: Number(v.quantity || 0),
            remaining_quantity: Number(v.remaining_quantity ?? v.quantity ?? 0),
            order_conditions: Number(v.order_conditions || v.min_order_value || 0),
            min_order_value: Number(v.min_order_value || v.order_conditions || 0),
            start_time: v.start_time,
            end_time: v.end_time,
            effective_period_begins: v.effective_period_begins || v.start_time,
            effective_period_ends: v.effective_period_ends || v.end_time,
            is_active: v.is_active !== false,
            isClaimed: false,
          };
        });
        
        // Lọc voucher còn số lượng và đang hoạt động
        const available = normalized.filter((v: Voucher) => {
          const hasStock = (v.remaining_quantity ?? v.quantity ?? 0) > 0;
          const isActive = v.is_active !== false;
          
          if (!hasStock) console.warn(`⚠️ Voucher "${v.name}" hết hàng`);
          if (!isActive) console.warn(`⚠️ Voucher "${v.name}" không hoạt động`);
          
          return hasStock && isActive;
        });
        
        console.log(`✅ Loaded ${available.length}/${normalized.length} vouchers`);
        setVouchers(available);
        
        if (available.length === 0) {
          setMessage('ℹ️ Hiện tại không có voucher khả dụng.');
        }
      } catch (error: any) {
        console.error('❌ Lỗi tải voucher:', error);
        setMessage(`❌ ${error.message || 'Không thể tải danh sách voucher.'}`);
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
    // Gọi API claim voucher
    await voucherApi.claimVoucher(customerId, voucherId);

    // Fetch lại danh sách voucher từ server để đồng bộ
    const updatedVouchers = await voucherApi.fetchAvailableVouchers();

    // Chuẩn hóa danh sách voucher, đánh dấu voucher vừa claim là isClaimed
    const normalized = updatedVouchers.map(v => ({
      ...v,
      isClaimed: v.id === voucherId ? true : false
    }));

    // Cập nhật state
    setVouchers(normalized);

    // Lấy tên voucher để hiển thị message
    const claimedVoucher = normalized.find(v => v.id === voucherId);
    setMessage(`✅ Đã lưu voucher "${claimedVoucher?.name || ''}" thành công!`);

    // Tự động đóng modal sau 2 giây
    setTimeout(() => onClose(), 2000);

  } catch (error: any) {
    console.error('❌ Lỗi khi nhận voucher:', error);
    setMessage(`❌ ${error.message || 'Không thể nhận voucher.'}`);
  } finally {
    setLoadingClaimId(null);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-amber-50 to-yellow-50">
          <h3 className="text-2xl font-bold text-[#65604E] flex items-center gap-2">
            🎁 Mã Giảm Giá Dành Cho Bạn
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-sm font-medium ${
            message.startsWith('❌') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : message.startsWith('ℹ️')
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingList ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D1C8B4] border-t-[#65604E]"></div>
              <p className="mt-4 text-gray-600">Đang tải voucher...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-lg">Không có voucher khả dụng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => {
                const stock = voucher.remaining_quantity ?? voucher.quantity ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 5;
                
                return (
                  <div
                    key={voucher.id}
                    className={`border-2 p-4 rounded-lg transition-all duration-200 ${
                      voucher.isClaimed 
                        ? 'bg-gray-100 border-gray-300' 
                        : isOutOfStock
                        ? 'bg-red-50 border-red-200 opacity-60'
                        : 'border-[#D1C8B4] hover:shadow-md hover:border-[#65604E]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="font-bold text-xl text-[#65604E]">{voucher.name}</div>
                          {isLowStock && !isOutOfStock && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                              🔥 Sắp hết
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-semibold">
                              ❌ Hết hàng
                            </span>
                          )}
                        </div>
                        
                        {voucher.description && (
                          <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">💰 Giảm:</span>
                            <span className="font-semibold text-red-600">
                              {voucher.discount_type === 'PERCENT' 
                                ? `${voucher.discount_value}%`
                                : formatPrice(voucher.discount_value ?? 0)
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">📦 Còn:</span>
                            <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                              {stock} voucher
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">🛒 Đơn tối thiểu:</span>
                            <span className="font-semibold text-gray-700">
                              {formatPrice(voucher.min_order_value ?? 0)}
                            </span>
                          </div>
                          
                          {voucher.code && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">🏷️ Mã:</span>
                              <span className="font-mono font-semibold text-[#65604E]">
                                {voucher.code}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {(voucher.effective_period_begins || voucher.effective_period_ends) && (
                          <p className="text-xs text-gray-500 mt-2">
                            ⏰ HSD: {voucher.effective_period_begins?.slice(0,10) || '?'} đến {voucher.effective_period_ends?.slice(0,10) || '?'}
                          </p>
                        )}
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => handleClaim(voucher.id!)}
                        disabled={
                          voucher.isClaimed || 
                          isOutOfStock || 
                          loadingClaimId === voucher.id
                        }
                        className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                          voucher.isClaimed
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 hover:shadow-lg disabled:opacity-50'
                        }`}
                      >
                        {loadingClaimId === voucher.id
                          ? '⏳ Đang Lấy...'
                          : voucher.isClaimed
                          ? '✓ Đã Nhận'
                          : isOutOfStock
                          ? '❌ Hết Hàng'
                          : '🎁 Lấy Voucher'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-[#65604E] font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}