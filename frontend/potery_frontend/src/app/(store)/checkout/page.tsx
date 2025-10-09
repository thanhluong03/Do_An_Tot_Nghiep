// pages/store/checkout.js (hoặc CheckoutPage.js của bạn)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { orderApi } from '../../../api/modules/orders';
import { paymentApi } from '../../../api/modules/payments';
import { formatPrice } from '../../../utils/format';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';
// IMPORT MỚI
import { voucherApi, Voucher } from '../../../api/modules/voucher'; 

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, clear: clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [serverItems, setServerItems] = useState<Array<{ id: string; product_id: string | number; quantity: number }>>([]);
  const [serverProducts, setServerProducts] = useState<Record<string, { id: string; name: string; price: number; images: string[] }>>({});
  const [loadingCart, setLoadingCart] = useState(false);
  
  // STATE MỚI CHO VOUCHER
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Load server-side cart items and VOUCHERS for authenticated user
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user?.id) return;

      // 1. Tải Giỏ hàng
      try {
        setLoadingCart(true);
        const data = await cartApi.getByCustomer(user.id as string);
        if (!mounted) return;
        const mapped = (Array.isArray(data) ? data : []).map((ci: any) => ({
          id: String(ci.id ?? ci._id ?? ''),
          product_id: ci.product_id,
          quantity: Number(ci.quantity ?? 1),
        }));
        setServerItems(mapped);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoadingCart(false);
      }
      
      // 2. Tải Voucher đã nhận của khách hàng
      try {
          setLoadingVouchers(true);
          const vouchersData = await voucherApi.fetchCustomerVouchers(user.id as string);
          if (mounted) setAvailableVouchers(vouchersData);
      } catch (e) {
          console.error("Lỗi khi tải voucher của khách hàng:", e);
      } finally {
          if (mounted) setLoadingVouchers(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated, user?.id]);

  // Load product details for server items (GIỮ NGUYÊN)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const missing = serverItems.map(ci => String(ci.product_id)).filter(pid => !serverProducts[pid]);
      if (missing.length === 0) return;
      const results = await Promise.allSettled(missing.map(pid => productApi.getProductById(pid)));
      if (!mounted) return;
      const next: Record<string, any> = { ...serverProducts };
      results.forEach((r, idx) => {
        const pid = missing[idx];
        if (r.status === 'fulfilled' && r.value) {
          next[pid] = { id: r.value.id, name: r.value.name, price: r.value.price, images: r.value.images };
        }
      });
      setServerProducts(next);
    })();
    return () => { mounted = false; };
  }, [serverItems, serverProducts]);

  // LOGIC TÍNH TỔNG TIỀN VÀ ÁP DỤNG VOUCHER
  const { total, discountAmount, finalTotal } = useMemo(() => {
    // 1. Tính tổng tiền ban đầu (Initial Total)
    const initialTotal = serverItems.length > 0
      ? serverItems.reduce((acc, ci) => acc + (serverProducts[String(ci.product_id)]?.price ?? 0) * (ci.quantity ?? 1), 0)
      : items.reduce((acc, cur) => acc + cur.product.price * cur.quantity, 0);

    let discount = 0;
    
    // 2. Áp dụng Voucher
    if (selectedVoucher && initialTotal >= selectedVoucher.min_order_value) {
        const value = selectedVoucher.discount_value;
        if (selectedVoucher.discount_type === 'PERCENT') {
            discount = initialTotal * (value / 100);
            // Có thể thêm logic giới hạn giảm tối đa (Max Cap) ở đây
        } else { // FIXED
            discount = value;
        }
    } else if (selectedVoucher && initialTotal < selectedVoucher.min_order_value) {
        // Nếu chọn voucher nhưng không đủ điều kiện
        discount = 0;
    }

    // 3. Tính tổng tiền cuối cùng
    const final = Math.max(0, initialTotal - discount);

    return { total: initialTotal, discountAmount: discount, finalTotal: final };
  }, [items, serverItems, serverProducts, selectedVoucher]);

  // Xử lý chọn voucher
  const handleSelectVoucher = (voucher: Voucher) => {
    // Kiểm tra điều kiện tối thiểu ngay khi chọn
    if (total < voucher.min_order_value) {
        setError(`Đơn hàng phải đạt ${formatPrice(voucher.min_order_value)} để áp dụng mã này.`);
        setSelectedVoucher(null);
        return;
    }
    setError(null);

    // Toggle chọn/bỏ chọn
    if (selectedVoucher?.id === voucher.id) {
        setSelectedVoucher(null);
    } else {
        setSelectedVoucher(voucher);
    }
  };


  const handleCreate = async () => {
    // ... (Kiểm tra lỗi giữ nguyên)
    if (!isAuthenticated || !user || !user.id) {
      setError('Vui lòng đăng nhập để thanh toán');
      return;
    }
    if (loadingCart) {
      setError('Đang tải giỏ hàng, vui lòng thử lại trong giây lát');
      return;
    }
    const hasServer = serverItems.length > 0;
    if ((!hasServer && items.length === 0) || (hasServer && serverItems.length === 0)) {
      setError('Giỏ hàng trống');
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const payload = {
        customer_id: Number(user.id),
        shipping_address: address,
        // THÊM VOUCHER ID VÀO PAYLOAD GỬI ĐẾN BACKEND
        voucher_id: selectedVoucher?.id ? Number(selectedVoucher.id) : null, 
        payment_method: paymentMethod === 'COD' ? 'ONSITE' : 'CARD',
        items: hasServer
          ? serverItems.map((ci) => ({
              product_id: Number(ci.product_id),
              quantity: ci.quantity,
              price_at_order: Number(serverProducts[String(ci.product_id)]?.price ?? 0),
            }))
          : items.map((it) => ({
              product_id: Number(it.product.id),
              quantity: it.quantity,
              price_at_order: it.product.price,
            })),
            // THÊM TRƯỜNG TỔNG TIỀN VÀ GIẢM GIÁ (Nếu backend cần)
            total_amount: finalTotal, 
            discount_amount: discountAmount,
      };
      
      const res = await orderApi.createOrder(payload);
      const order = res?.data || res; // backend wraps in { success, data }
      const createdId = Number(order?.id ?? order?.data?.id);
      if (!createdId) throw new Error('Không lấy được ID đơn hàng');
      setOrderId(createdId);
      
      // Xử lý thanh toán VNPay
      if (paymentMethod === 'VNPAY') {
        const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/orders` : undefined;
        // Gửi finalTotal (tổng tiền sau giảm) để thanh toán
        const pay = await paymentApi.createVnPayPayment(createdId, finalTotal, returnUrl); 
        console.log('VNPay response:', pay);
        const paymentUrl = pay?.paymentUrl || pay?.data?.paymentUrl || pay?.url || pay?.redirectUrl || pay?.data?.redirectUrl;
        if (!paymentUrl) throw new Error('Không lấy được đường dẫn thanh toán');
        window.location.href = paymentUrl;
      } else {
        // COD
        clearCart();
        window.location.href = '/store/orders';
      }
    } catch (e: any) {
      setError(e?.message || 'Không thể tạo đơn hàng/ thanh toán');
    } finally {
      setCreating(false);
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Thanh toán</h1>

        {/* ... (Phần hiển thị sản phẩm giữ nguyên) ... */}
        
        {/* PHẦN CHỌN VOUCHER */}
        <div className="mb-6 border p-4 rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-3">🏷️ Chọn Mã Giảm Giá</h2>
            {loadingVouchers ? (
                <div className="text-gray-600">Đang tải voucher đã nhận...</div>
            ) : availableVouchers.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableVouchers.map((voucher) => (
                        <div 
                            key={voucher.id} 
                            onClick={() => handleSelectVoucher(voucher)}
                            className={`p-3 border rounded cursor-pointer transition flex justify-between items-center 
                                ${selectedVoucher?.id === voucher.id ? 'bg-[#D1C8B4] border-[#65604E]' : total < voucher.min_order_value ? 'opacity-50' : 'hover:bg-gray-100'}`
                            }
                        >
                            <div>
                                <span className="font-medium">{voucher.code}</span>
                                <span className="text-sm text-gray-600 ml-2"> - {voucher.description}</span>
                                <p className={`text-xs ${total < voucher.min_order_value ? 'text-red-600' : 'text-gray-500'}`}>
                                    {total < voucher.min_order_value ? `❌ Đơn tối thiểu ${formatPrice(voucher.min_order_value)}` : 'Đủ điều kiện'}
                                </p>
                            </div>
                            <input
                                type="radio"
                                checked={selectedVoucher?.id === voucher.id}
                                readOnly
                                className="w-4 h-4 text-[#65604E] focus:ring-[#65604E] border-gray-300"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-600 text-sm">Bạn chưa có mã giảm giá nào.</div>
            )}
        </div>

        <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
                <span className="text-gray-700">Tổng tiền hàng</span>
                <span className="font-semibold">{formatPrice(total)}</span>
            </div>

            {/* HIỂN THỊ GIẢM GIÁ */}
            {discountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600 font-semibold border-t pt-2 border-dashed">
                    <span>Mã giảm giá ({selectedVoucher?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
                <span className="text-gray-800 text-xl font-bold">Thành tiền cuối cùng</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
            </div>

            {/* ... (Phần địa chỉ và thanh toán giữ nguyên) ... */}
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng</label>
              <textarea className="w-full border rounded p-3" rows={4} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nhập địa chỉ giao hàng" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
              <select className="border rounded p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                <option value="COD">Trả tiền sau (COD)</option>
                <option value="VNPAY">Thanh toán VNPay</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button disabled={creating || loadingCart || finalTotal === 0} onClick={handleCreate} className="w-full bg-[#65604E] text-white px-5 py-3 rounded text-lg font-semibold disabled:opacity-50">
              {creating ? 'Đang xử lý…' : paymentMethod === 'VNPAY' ? `Tạo đơn & Thanh toán ${formatPrice(finalTotal)}` : `Tạo đơn COD (${formatPrice(finalTotal)})`}
            </button>
        </div>
      </div>
    </BaseLayout>
  );
}