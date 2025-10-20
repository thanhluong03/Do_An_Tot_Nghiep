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
import { customersApi } from '../../../api/modules/customers';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, clear: clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [serverItems, setServerItems] = useState<Array<{ id: string; product_id: number; quantity: number; store_id: number }>>([]);
  const [serverProducts, setServerProducts] = useState<Record<number, { id: number; name: string; price: number; images: string[] }>>({});
  const [loadingCart, setLoadingCart] = useState(false);

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Build a fallback product map from context items for guest rendering
  const contextProducts = useMemo(() => {
    const map: Record<number, { id: number; name: string; price: number; images: string[] }> = {};
    items.forEach(i => {
      const pid = Number(i.product?.id ?? 0);
      if (!pid) return;
      if (!map[pid]) {
        map[pid] = {
          id: pid,
          name: i.product?.name ?? 'Sản phẩm',
          price: Number(i.product?.price ?? 0),
          images: i.product?.images ?? [],
        };
      }
    });
    return map;
  }, [items]);
  async function handleGuestCheckout(customerInfo: any) {
    const savedCart = Cookies.get('cart_session');
    if (!savedCart) {
      alert('Giỏ hàng trống!');
      return;
    }

    const cartItems = JSON.parse(savedCart);

    const payload = {
      customer_info: customerInfo,
      items: cartItems.map((item: any) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_order: item.product.price,
      })),
    };

    const res = await fetch('/api/orders/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Cookies.remove('cart_session'); // clear cart sau khi đặt
      alert('Đặt hàng thành công!');
    } else {
      alert('Đặt hàng thất bại!');
    }
  }
  /** ===================== LOAD CART & VOUCHERS ===================== */
  /** ===================== LOAD CART & VOUCHERS ===================== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCart(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('productId');
        const storeId = params.get('storeId');
        const quantity = params.get('quantity');
        // Nếu có đủ 3 param → ưu tiên hiển thị đơn hàng mua ngay
        if (productId && storeId && quantity) {
          const detail = await productApi.getProductById(productId);
          setServerItems([
            {
              id: 'buy-now',
              product_id: Number(productId),
              quantity: Number(quantity),
              store_id: Number(storeId),
            },
          ]);
          setServerProducts({
            [Number(productId)]: {
              id: Number(detail.id),
              name: detail.name,
              price: Number(detail.price),
              images: detail.images || [],
            },
          });
          setLoadingCart(false);
          return;
        }
        // ...existing code for cart/session/cookie...
        if (isAuthenticated && user?.id) {
          const data = await cartApi.getByCustomer(user.id as string);
          const mapped = (Array.isArray(data) ? data : []).map((ci: any) => ({
            id: String(ci.id ?? ci._id ?? ''),
            product_id: Number(ci.product_id),
            quantity: Number(ci.quantity ?? 1),
            store_id: Number(ci.store?.id ?? ci.store_id ?? 0),
          }));
          setServerItems(mapped);
        } else {
          // ...existing code for guest cart...
          let localItems: any[] | null = null;
          try {
            if (typeof window !== 'undefined') {
              const ss = sessionStorage.getItem('cart_session');
              if (ss) localItems = JSON.parse(ss);
            }
          } catch { }
          if (!localItems) {
            const saved = Cookies.get('cart_session');
            if (saved) localItems = JSON.parse(saved);
          }
          if (localItems) {
            const mapped = await Promise.all(
              localItems.map(async (i: any, idx: number) => {
                const pid = Number(i.product?.id ?? i.product_id);
                let storeId = Number(i.product?.store?.id ?? i.store_id ?? 0);
                if (!storeId) {
                  try {
                    const detail = await productApi.getProductById(String(pid));
                    const fallback = detail?.stores?.[0]?.store_id;
                    if (fallback) storeId = Number(fallback);
                  } catch { }
                }
                return {
                  id: `guest-${idx}`,
                  product_id: pid,
                  quantity: Number(i.quantity ?? 1),
                  store_id: storeId || 1,
                };
              })
            );
            setServerItems(mapped);
          }
        }

        /** 🔥 THÊM MỚI — TẢI DANH SÁCH VOUCHER NGƯỜI DÙNG CÓ */
        setLoadingVouchers(true);
        let vouchers: Voucher[] = [];

        if (isAuthenticated && user?.id) {
          try {
            vouchers = await voucherApi.fetchCustomerVouchers(user.id);
          } catch (err) {
            console.error('❌ Lỗi khi tải voucher người dùng:', err);
          }
        } else {
          // Nếu khách, có thể hiển thị danh sách chung (nếu cần)
          try {
            vouchers = await voucherApi.fetchAvailableVouchers();
          } catch { }
        }

        if (mounted) setAvailableVouchers(vouchers);
      } catch (e) {
        console.error('Lỗi tải giỏ hàng:', e);
      } finally {
        if (mounted) {
          setLoadingCart(false);
          setLoadingVouchers(false);
        }
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
  const handlePayment = async (orderId: number, amount: number) => {
    const returnUrl = `${window.location.origin}/orders?payment=success&order_id=${orderId}`;

    try {
      const pay = await paymentApi.createVnPayPayment(orderId, amount, returnUrl);
      const paymentUrl = pay?.paymentUrl || pay?.data?.paymentUrl || pay?.url || pay?.redirectUrl;

      if (!paymentUrl) throw new Error('Không lấy được đường dẫn thanh toán');
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('❌ Lỗi khi tạo thanh toán VNPay:', error);
      toast.error('Không thể khởi tạo thanh toán VNPay');
    }
  };

  /** ===================== TẠO ĐƠN HÀNG ===================== */
  const handleCreate = async () => {
    if (loadingCart) return setError('⏳ Đang tải giỏ hàng, vui lòng thử lại sau');
    const cartItems = serverItems.length > 0 ? serverItems : items;
    if (!cartItems.length) return setError('❌ Giỏ hàng trống');
    if (!address.trim()) return setError('❌ Vui lòng nhập địa chỉ giao hàng');

    setCreating(true);
    setError(null);

    try {
      // Determine customer id: logged-in or create guest
      let customerId: number | null = isAuthenticated && user?.id ? Number(user.id) : null;
      if (!customerId) {
        if (!guestName.trim() || !guestPhone.trim()) {
          throw new Error('Vui lòng nhập họ tên và số điện thoại để đặt hàng.');
        }
        const fallbackEmail = guestEmail.trim() || `guest_${Date.now()}@example.com`;
        const created = await customersApi.createCustomer({
          username: `guest_${Date.now()}`,
          password: `guest-${Math.random().toString(36).slice(2)}`,
          full_name: guestName.trim(),
          email: fallbackEmail,
          phone_number: guestPhone.trim(),
          address: address.trim(),
        });
        customerId = Number(created?.id ?? created?.data?.id ?? created?.customer?.id);
        if (!customerId) throw new Error('Không thể tạo khách hàng tạm thời.');
      }

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
        const storeId =
          'store_id' in ci ? Number((ci as any).store_id) : 1;
        return {
          product_id: pid,
          quantity: ci.quantity,
          price_at_order: Math.round(discountedPrice), // giá đã giảm cho từng sp
          store_id: Number(storeId),
        };
      });

      const payload = {
        customer_id: Number(customerId),
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
        await handlePayment(createdId, totalAfterDiscount);
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
  /** ===================== CHECK PAYMENT RETURN ===================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order_id');

    if (paymentStatus === 'success' && orderId) {
      (async () => {
        try {
          // ... (Giữ nguyên logic cập nhật API và clearCart) ...
          await orderApi.updateOrder(Number(orderId), {
            status: 'CONFIRMED',
            payment_status: 'PAID',
          });
          clearCart();

          // 1. GỌI TOAST TRƯỚC HẾT
          toast.success('🎉 Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.', {
            duration: 4000,
            position: 'top-right',
            style: {
              border: '2px solid #22c55e',
              padding: '16px',
              color: '#166534',
              fontWeight: '600',
              borderRadius: '10px',
              background: '#dcfce7',
            },
          });

          // 2. XÓA QUERY NGAY LẬP TỨC ĐỂ NGĂN useEffect LẶP LẠI
          window.history.replaceState({}, '', '/orders');

          // 3. THIẾT LẬP TIMEOUT CHO VIỆC CHUYỂN HƯỚNG CỨNG (NẾU CẦN)
          // Nếu bạn muốn người dùng thấy thông báo trên trang Orders sau khi chuyển
          // thì không cần chuyển hướng cứng nữa vì đã replaceState ở bước 2.
          // NHƯNG nếu bạn muốn chuyển đến trang /orders SAU KHI thấy toast, hãy dùng setTimeout.
          // Giữ nguyên setTimeout để cho phép người dùng thấy toast
          setTimeout(() => {
            window.location.href = '/orders'; // Chuyển hướng cứng để tải lại trang Orders
          }, 2000);

        } catch (err) {
          console.error('❌ Lỗi cập nhật trạng thái đơn hàng sau thanh toán:', err);
          toast.error('Không thể cập nhật trạng thái đơn hàng.', {
            position: 'top-right',
          });
          // Quan trọng: Nếu lỗi, xóa query và quay lại /checkout để người dùng thử lại
          window.history.replaceState({}, '', '/checkout');
        }
      })();
      // THÊM DÒNG NÀY: Dọn dẹp query param ngay lập tức (trước khi async/await kết thúc)
      // Tùy chọn, vì nó đã có trong logic async ở trên, nhưng có thể giúp ngăn race condition
      window.history.replaceState({}, '', '/orders');
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại, vui lòng thử lại!', {
        position: 'top-right',
      });
      window.history.replaceState({}, '', '/checkout');
    }
  }, []);

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
              ) : (serverItems.length === 0 && items.length === 0) ? (
                <div className="text-center text-gray-400 py-8">Giỏ hàng trống</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {(serverItems.length > 0 ? serverItems : items.map((i, idx) => ({ id: `guest-${idx}`, product_id: Number(i.product.id), quantity: i.quantity, store_id: Number(i.product.store?.id || 0) }))).map(ci => {
                    const p = serverProducts[ci.product_id] || contextProducts[ci.product_id];
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
                        className={`p-3 rounded-lg border-2 transition cursor-pointer ${selected ? 'bg-yellow-200 border-yellow-400 shadow-md'
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
              {!isAuthenticated && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">👤 Họ và tên *</label>
                    <input
                      className="w-full border-2 rounded-lg p-3 focus:border-yellow-400 focus:ring focus:ring-yellow-200 transition"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📞 Số điện thoại *</label>
                      <input
                        className="w-full border-2 rounded-lg p-3 focus:border-yellow-400 focus:ring focus:ring-yellow-200 transition"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="090xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">✉️ Email</label>
                      <input
                        className="w-full border-2 rounded-lg p-3 focus:border-yellow-400 focus:ring focus:ring-yellow-200 transition"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </>
              )}
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
                disabled={creating || loadingCart || finalTotal === 0 || !address.trim() || (!isAuthenticated && (!guestName.trim() || !guestPhone.trim()))}
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


