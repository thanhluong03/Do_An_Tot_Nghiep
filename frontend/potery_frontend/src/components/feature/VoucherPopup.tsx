'use client';

import React, { useState, useEffect } from 'react';
import { voucherApi, Voucher } from '../../api/modules/voucher';
import { formatPrice } from '../../utils/format';
import { X, Gift, AlertTriangle, Info, CheckCircle, Loader2, Tag, ShoppingCart, DollarSign, Clock, Zap, Code } from 'lucide-react';

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
    <div 
      className="fixed inset-0 flex items-center justify-center z-[1000] p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose} // Đóng khi click ra ngoài
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 scale-95"
        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện nổi bọt
      >
        
        {/* Header - Modern Minimalist */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#8B7D6B]" />
            Ưu Đãi Đặc Biệt
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Alert Area */}
        {message && (
          <div className="mx-6 mt-4">
            {message.startsWith('❌') ? (
              <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 flex items-center border border-red-200">
                <AlertTriangle className="w-4 h-4 mr-2" /> {message.substring(2).trim()}
              </div>
            ) : message.startsWith('ℹ️') ? (
              <div className="p-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 flex items-center border border-blue-200">
                <Info className="w-4 h-4 mr-2" /> {message.substring(2).trim()}
              </div>
            ) : (
              <div className="p-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 flex items-center border border-green-200">
                <CheckCircle className="w-4 h-4 mr-2" /> {message.substring(2).trim()}
              </div>
            )}
          </div>
        )}

        {/* Content - Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingList ? (
            <div className="text-center py-12">
              <Loader2 className="inline-block animate-spin h-8 w-8 text-indigo-500" />
              <p className="mt-4 text-gray-600">Đang tải các ưu đãi...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg p-10">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">Hiện không có mã giảm giá khả dụng</p>
              <p className="text-sm text-gray-400 mt-1">Vui lòng quay lại sau.</p>
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
                    className={`
                      border border-gray-200 p-5 rounded-lg transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                      ${voucher.isClaimed 
                        ? 'bg-gray-50 opacity-80' 
                        : isOutOfStock
                        ? 'bg-red-50 border-red-100 opacity-70'
                        : 'bg-white hover:shadow-lg hover:border-indigo-300'
                      }
                    `}
                  >
                    
                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="font-bold text-xl text-gray-800 truncate">{voucher.name}</div>
                        {isLowStock && !isOutOfStock && (
                          <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold flex items-center">
                            <Zap className="w-5 h-5 mr-1" /> Sắp hết
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="flex-shrink-0 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-semibold">
                            Hết hàng
                          </span>
                        )}
                      </div>
                      
                      {voucher.description && (
                        <p className="text-sm text-gray-500 mb-3">{voucher.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        
                        {/* Discount Value */}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-500">Giảm:</span>
                          <span className="font-bold text-green-600">
                            {voucher.discount_type === 'PERCENT' 
                              ? `${voucher.discount_value}%`
                              : formatPrice(voucher.discount_value ?? 0)
                            }
                          </span>
                        </div>
                        
                        {/* Remaining Stock */}
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-[#8B7D6B] flex-shrink-0" />
                          <span className="text-gray-500">Còn lại:</span>
                          <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                            {stock}
                          </span>
                        </div>
                        
                        {/* Min Order Value */}
                        <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          <span className="text-gray-500">Đơn tối thiểu:</span>
                          <span className="font-semibold text-gray-700">
                            {formatPrice(voucher.min_order_value ?? 0)}
                          </span>
                        </div>
                        
                        {/* Voucher Code */}
                        {voucher.code && (
                          <div className="flex items-center gap-2">
                            <Code className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-500">Mã:</span>
                            <span className="font-mono text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                              {voucher.code}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Expiration Date */}
                      {(voucher.effective_period_begins || voucher.effective_period_ends) && (
                        <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
                          <Clock className="w-5 h-5 mr-2" />
                          HSD: {voucher.effective_period_begins?.slice(0,10) || '?'} - {voucher.effective_period_ends?.slice(0,10) || '?'}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleClaim(voucher.id!)}
                      disabled={
                        voucher.isClaimed || 
                        isOutOfStock || 
                        loadingClaimId === voucher.id
                      }
                      className={`
                        w-full md:w-auto px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md 
                        flex items-center justify-center whitespace-nowrap min-w-[150px]
                        ${voucher.isClaimed
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
                          : isOutOfStock
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                          : 'bg-[#8B7D6B] text-white hover:bg-indigo-600 hover:shadow-indigo-300/50 disabled:opacity-50'
                        }
                      `}
                    >
                      {loadingClaimId === voucher.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang Lấy...</>
                      ) : voucher.isClaimed ? (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Đã Nhận</>
                      ) : isOutOfStock ? (
                        <><X className="w-4 h-4 mr-2" /> Hết Hàng</>
                      ) : (
                        <><Gift className="w-4 h-4 mr-2" /> Lấy Voucher</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-[#F9FAFB] text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-700 font-bold hover:text-[#8B7D6B] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}