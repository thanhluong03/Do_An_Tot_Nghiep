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
import { voucherApi, Voucher } from '../../../api/modules/voucher';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, clear: clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

  const [serverItems, setServerItems] = useState<Array<{ id: string; product_id: number; quantity: number }>>([]);
  const [serverProducts, setServerProducts] = useState<Record<number, { id: number; name: string; price: number; images: string[] }>>({});
  const [loadingCart, setLoadingCart] = useState(false);

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  /** ===================== LOAD CART & VOUCHERS ===================== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user?.id) return;

      try {
        setLoadingCart(true);
        const data = await cartApi.getByCustomer(user.id as string);
        if (!mounted) return;

        const mapped = (Array.isArray(data) ? data : []).map((ci: any) => ({
          id: String(ci.id ?? ci._id ?? ''),
          product_id: Number(ci.product_id),
          quantity: Number(ci.quantity ?? 1),
        }));
        setServerItems(mapped);
      } catch (e) {
        console.error('Lỗi tải giỏ hàng:', e);
      } finally {
        if (mounted) setLoadingCart(false);
      }

      try {
        setLoadingVouchers(true);
        const vouchersData = await voucherApi.fetchCustomerVouchers(user.id as string);
        if (!mounted) return;

        const normalizedVouchers = vouchersData.map((v: any) => {
          const discountVal = Number(v.discount_value ?? v.voucher_percentage ?? v.discount ?? 0);
          const minOrder = Number(v.min_order_value ?? v.order_conditions ?? 0);
          const qty = Number(v.remaining_quantity ?? v.quantity ?? 0);

          return {
            id: v.id ?? v._id,
            code: v.code ?? v.voucher_code ?? 'N/A',
            name: v.name ?? v.title ?? '',
            description: v.description ?? v.desc ?? '',
            discount_value: discountVal,
            voucher_percentage: discountVal,
            discount_type: (v.discount_type ?? v.type ?? 'PERCENT').toUpperCase(),
            min_order_value: minOrder,
            order_conditions: minOrder,
            quantity: qty,
            remaining_quantity: qty,
            is_active: v.is_active !== false,
            effective_period_begins: v.effective_period_begins ?? v.start_time,
            effective_period_ends: v.effective_period_ends ?? v.end_time,
          };
        });
        setAvailableVouchers(normalizedVouchers);
      } catch (e) {
        console.error('❌ Lỗi khi tải voucher:', e);
      } finally {
        if (mounted) setLoadingVouchers(false);
      }
    })();

    return () => { mounted = false; };
  }, [isAuthenticated, user?.id]);

  /** ===================== LOAD PRODUCTS ===================== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const missing = serverItems.map(ci => ci.product_id).filter(pid => !serverProducts[pid]);
      if (missing.length === 0) return;

      const results = await Promise.allSettled(missing.map(pid => productApi.getProductById(String(pid))));
      if (!mounted) return;

      const next: Record<number, any> = { ...serverProducts };
      results.forEach((r, idx) => {
        const pid = missing[idx];
        if (r.status === 'fulfilled' && r.value) {
          next[pid] = {
            id: Number(r.value.id),
            name: r.value.name,
            price: Number(r.value.price),
            images: r.value.images || [],
          };
        }
      });
      setServerProducts(next);
    })();
    return () => { mounted = false; };
  }, [serverItems, serverProducts]);

  /** ===================== TÍNH TOÁN GIÁ ===================== */
  const { total, discountAmount, finalTotal } = useMemo(() => {
    const initialTotal = serverItems.length > 0
      ? serverItems.reduce((acc, ci) => {
          const product = serverProducts[ci.product_id];
          return acc + (product ? product.price * ci.quantity : 0);
        }, 0)
      : items.reduce((acc, cur) => acc + cur.product.price * cur.quantity, 0);

    let discount = 0;
    if (selectedVoucher) {
      const minOrder = Number(selectedVoucher.min_order_value ?? selectedVoucher.order_conditions ?? 0);
      if (initialTotal >= minOrder) {
        const discountValue = Number(selectedVoucher.discount_value ?? selectedVoucher.voucher_percentage ?? 0);
        const type = String(selectedVoucher.discount_type ?? 'PERCENT').toUpperCase();
        if (type === 'PERCENT' || type === 'PERCENTAGE') discount = Math.round(initialTotal * (discountValue / 100));
        else discount = discountValue;
      }
    }
    return { total: initialTotal, discountAmount: discount, finalTotal: Math.max(0, initialTotal - discount) };
  }, [items, serverItems, serverProducts, selectedVoucher]);

  /** ===================== CHỌN VOUCHER ===================== */
  const handleSelectVoucher = (voucher: Voucher) => {
    const minOrder = Number(voucher.min_order_value ?? voucher.order_conditions ?? 0);
    if (total < minOrder) {
      setError(`❌ Đơn hàng phải đạt ${formatPrice(minOrder)} để áp dụng mã này.`);
      setSelectedVoucher(null);
      return;
    }
    setError(null);
    setSelectedVoucher(selectedVoucher?.id === voucher.id ? null : voucher);
  };

  /** ===================== TẠO ĐƠN HÀNG ===================== */
const handleCreate = async () => {
  if (!isAuthenticated || !user?.id) return setError('❌ Vui lòng đăng nhập để thanh toán');
  if (loadingCart) return setError('⏳ Đang tải giỏ hàng, vui lòng thử lại sau');
  const cartItems = serverItems.length > 0 ? serverItems : items;
  if (!cartItems.length) return setError('❌ Giỏ hàng trống');
  if (!address.trim()) return setError('❌ Vui lòng nhập địa chỉ giao hàng');

  setCreating(true);
  setError(null);

  try {
    const totalBeforeDiscount = total;
    const totalAfterDiscount = finalTotal;
    const discount = totalBeforeDiscount - totalAfterDiscount;

    // Nếu có giảm giá, chia phần giảm đều theo tỷ lệ
    const payloadItems = cartItems.map(ci => {
      const pid = 'product_id' in ci && typeof (ci as any).product_id !== 'undefined'
        ? Number((ci as any).product_id)
        : Number((ci as any).product?.id ?? 0);

      const basePrice = Number(serverProducts[pid]?.price ?? (ci as any).product?.price ?? 0);
      const share = totalBeforeDiscount > 0 ? (basePrice * ci.quantity) / totalBeforeDiscount : 0;
      const discountedPrice = basePrice - (share * discount) / ci.quantity;

      return {
        product_id: pid,
        quantity: ci.quantity,
        price_at_order: Math.round(discountedPrice), // giá đã giảm cho từng sp
      };
    });

    const payload = {
      customer_id: Number(user.id),
      shipping_address: address,
      voucher_id: selectedVoucher ? Number(selectedVoucher.id) : null,
      payment_method: paymentMethod === 'COD' ? 'ONSITE' : 'CARD',
      items: payloadItems,
      total_amount: totalAfterDiscount,  // tổng sau giảm
      discount_amount: discount,
      original_amount: totalBeforeDiscount,
    };

    const res = await orderApi.createOrder(payload);
    const createdId = Number(res?.data?.id ?? res?.id);
    if (!createdId) throw new Error('Không lấy được ID đơn hàng');
    setOrderId(createdId);

    if (paymentMethod === 'VNPAY') {
      const returnUrl = `${window.location.origin}/orders?payment=success&order_id=${createdId}`;
      const pay = await paymentApi.createVnPayPayment(createdId, totalAfterDiscount, returnUrl);
      const paymentUrl = pay?.paymentUrl || pay?.data?.paymentUrl || pay?.url || pay?.redirectUrl;
      if (!paymentUrl) throw new Error('Không lấy được đường dẫn thanh toán');
      window.location.href = paymentUrl;
    } else {
      clearCart();
      window.location.href = '/orders';
    }
  } catch (e: any) {
    setError(e?.response?.data?.message || e?.message || 'Không thể tạo đơn hàng');
  } finally {
    setCreating(false);
  }
};
/** ===================== CHECK PAYMENT RETURN ===================== */
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment');
  const orderId = params.get('order_id');

  if (paymentStatus === 'success' && orderId) {
    (async () => {
      try {
        // ✅ Cập nhật trạng thái đơn hàng thành CONFIRMED + PAID
        await orderApi.updateOrder(Number(orderId), {
          status: 'CONFIRMED',
          payment_status: 'PAID',
        });

        clearCart();
        setError(null);
        alert('✅ Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
        window.history.replaceState({}, '', '/orders');
        window.location.href = '/orders'; // chuyển sang trang danh sách đơn
      } catch (err) {
        console.error('❌ Lỗi cập nhật trạng thái đơn hàng sau thanh toán:', err);
        setError('Không thể cập nhật trạng thái đơn hàng.');
      }
    })();
  }
}, []);
   /** ===================== CHECK PAYMENT SUCCESS ===================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      toast.success('🎉 Thanh toán thành công!');
      window.history.replaceState({}, '', '/orders'); // xóa query để tránh toast lặp
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại, vui lòng thử lại!');
      window.history.replaceState({}, '', '/orders');
    }
  }, [])
   /** ===================== LOAD ORDERS ===================== */
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrdersByCustomer(user.id as string);
        setOrders(res?.data || []);
      } catch (err) {
        console.error('Lỗi khi tải đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.id]);
  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold font-serif mb-8 text-gray-800 text-center">🛍️ Thanh toán</h1>

        {/* CART + VOUCHER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-xl rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Giỏ hàng</h2>
              {loadingCart ? (
                <div className="text-center text-gray-500 py-8">Đang tải giỏ hàng...</div>
              ) : serverItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8">Giỏ hàng trống</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {serverItems.map(ci => {
                    const p = serverProducts[ci.product_id];
                    if (!p) return null;
                    return (
                      <div key={ci.id} className="flex justify-between py-4 items-center">
                        <div className="flex items-center gap-4">
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />}
                          <div>
                            <div className="font-semibold text-gray-700">{p.name}</div>
                            <div className="text-sm text-gray-500">x{ci.quantity}</div>
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800">{formatPrice(p.price * ci.quantity)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Voucher */}
            <div className="bg-yellow-50 rounded-xl shadow-inner p-5 border-dashed border-2 border-yellow-200">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">🏷️ Mã giảm giá</h2>
              {loadingVouchers ? (
                <div className="text-center text-gray-500 py-4">Đang tải...</div>
              ) : availableVouchers.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableVouchers.map(v => {
                    const minOrder = Number(v.min_order_value ?? v.order_conditions ?? 0);
                    const eligible = total >= minOrder;
                    const selected = selectedVoucher?.id === v.id;
                    const discountVal = Number(v.discount_value ?? v.voucher_percentage ?? 0);
                    const type = String(v.discount_type ?? 'PERCENT').toUpperCase();

                    return (
                      <div
                        key={v.id}
                        onClick={() => eligible && handleSelectVoucher(v)}
                        className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                          selected ? 'bg-yellow-200 border-yellow-400 shadow-md'
                          : eligible ? 'hover:bg-yellow-100 border-yellow-300'
                          : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-700">{v.code}</span>
                              {selected && <span className="text-green-600 font-bold">✓</span>}
                            </div>
                            {v.description && <p className="text-sm text-gray-600 mt-1">{v.description}</p>}
                            <p className="text-sm font-semibold text-red-600 mt-1">
                              🎉 Giảm: {type === 'PERCENT' || type === 'PERCENTAGE' ? `${discountVal}%` : formatPrice(discountVal)}
                            </p>
                            <p className={`text-xs mt-1 ${eligible ? 'text-green-600' : 'text-red-600'}`}>
                              {eligible ? '✅ Đủ điều kiện' : `❌ Đơn tối thiểu ${formatPrice(minOrder)}`}
                            </p>
                          </div>
                          <input type="radio" checked={selected} readOnly disabled={!eligible} className="mt-1 w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">Bạn chưa có mã giảm giá</div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-6">
            <div className="bg-white shadow-xl rounded-xl p-6 sticky top-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">💰 Tổng cộng</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng tiền hàng</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold border-t-2 border-dashed pt-2">
                    <span>🎉 Giảm ({selectedVoucher?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 pt-4 items-center">
                  <span className="text-xl font-bold">Thành tiền</span>
                  <div className="text-right">
                    {discountAmount > 0 && <div className="text-sm text-gray-400 line-through">{formatPrice(total)}</div>}
                    <span className="text-3xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white shadow-xl rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📍 Địa chỉ giao hàng *</label>
                <textarea
                  className="w-full border-2 rounded-lg p-3 focus:border-yellow-400 focus:ring focus:ring-yellow-200 transition"
                  rows={4}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💳 Phương thức thanh toán</label>
                <select
                  className="w-full border-2 rounded-lg p-3 focus:border-yellow-400 focus:ring focus:ring-yellow-200 transition"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as 'COD' | 'VNPAY')}
                >
                  <option value="COD">🏠 COD</option>
                  <option value="VNPAY">💳 VNPay</option>
                </select>
              </div>
              {error && <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>}
              <button
                disabled={creating || loadingCart || finalTotal === 0 || !address.trim()}
                onClick={handleCreate}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-4 rounded-lg text-lg font-bold disabled:opacity-50 hover:shadow-lg transition"
              >
                {creating ? '⏳ Đang xử lý...' : paymentMethod === 'VNPAY' ? `🚀 Thanh toán ${formatPrice(finalTotal)}` : `✅ Tạo đơn COD ${formatPrice(finalTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}

