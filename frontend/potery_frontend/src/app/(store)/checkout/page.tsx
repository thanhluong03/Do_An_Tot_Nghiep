'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { orderApi } from '../../../api/modules/orders';
import { paymentApi } from '../../../api/modules/payments';
import { mailApi } from '../../../api/modules/mail';
import { formatPrice } from '../../../utils/format';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';
import { voucherApi, Voucher } from '../../../api/modules/voucher';
import { customersApi } from '../../../api/modules/customers';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { 
  ShoppingBag, 
  Tag, 
  MapPin, 
  CreditCard, 
  Wallet, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  X, 
  Clock 
} from 'lucide-react';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, clear: clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // 🧹 Function để xóa sạch thông tin guest
  const clearGuestData = useCallback(() => {
    console.log('🧹 Xóa sạch thông tin guest...');
    localStorage.removeItem('guest_id');
    localStorage.removeItem('guest_name');
    localStorage.removeItem('guest_phone');
    localStorage.removeItem('guest_email');
    localStorage.removeItem('auth_type');
    
    // Reset state về rỗng
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    
    console.log('✅ Đã xóa sạch thông tin guest');
  }, []);

  // Function để gửi email xác nhận đơn hàng
  const sendOrderConfirmationEmail = useCallback(async (orderId: number) => {
    try {
      // Lấy email khách hàng
      let customerEmail = '';

      if (isAuthenticated && user?.email) {
        customerEmail = user.email;
      } else {
        // Với khách hàng guest, lấy email từ localStorage hoặc state hiện tại
        const storedEmail = localStorage.getItem('guest_email');
        customerEmail = storedEmail || guestEmail.trim() || `guest_${Date.now()}@example.com`;
      }

      console.log('🔄 Đang gửi email xác nhận đơn hàng tới:', customerEmail);

      // Gửi email xác nhận đơn hàng
      await mailApi.sendOrderMail({
        to: customerEmail,
        orderId: orderId,
      });

      console.log('✅ Email xác nhận đơn hàng đã được gửi thành công tới:', customerEmail);
      toast.success('📧 Email xác nhận đơn hàng đã được gửi!');
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      console.error('❌ Chi tiết lỗi:', error);
      toast.error(' Có lỗi khi gửi email xác nhận');
    }
  }, [isAuthenticated, user?.email, guestEmail]);

  async function handleGuestCheckout(customerInfo: any) {
    const savedCart = Cookies.get('cart_session');
    if (!savedCart) {
      toast.error('Giỏ hàng trống!');
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
      toast.success('Đặt hàng thành công!');
    } else {
      toast.error('Đặt hàng thất bại!');
    }
  }

  /** ===================== LOAD CART & VOUCHERS ===================== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCart(true);
      try {
        // 🔥 NẾU NGƯỜI DÙNG THẬT ĐĂNG NHẬP → XÓA THÔNG TIN GUEST CŨ
        if (isAuthenticated && user?.id) {
          const authType = localStorage.getItem('auth_type');
          if (authType !== 'user') {
            console.log('🧹 Phát hiện user thật đăng nhập → Xóa thông tin guest cũ');
            clearGuestData();
            localStorage.setItem('auth_type', 'user');
          }
        }
        
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
        
        // Load cart cho user đã đăng nhập
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
          // Load cart cho guest
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

        /** 🔥 TẢI DANH SÁCH VOUCHER */
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
  }, [isAuthenticated, user?.id, clearGuestData]);

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
      console.log('✅ Response từ API thanh toán:', pay);
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
      let customerId: number | null = null;
      const authType = localStorage.getItem('auth_type');
      const storedGuestId = localStorage.getItem('guest_id');

      // ✅ Nếu user thật (đã đăng nhập)
      if (isAuthenticated && authType === 'user') {
        // Lấy customerId từ localStorage (được lưu khi đăng nhập)
        const storedCustomerId = localStorage.getItem('customerId');
        if (storedCustomerId) {
          customerId = Number(storedCustomerId);
        } else {
          throw new Error('Không tìm thấy customerId. Vui lòng đăng xuất và đăng nhập lại.');
        }
      }
      // ✅ Nếu là guest
      else {
        if (storedGuestId) {
          customerId = Number(storedGuestId);
        } else {
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

          // 🧩 Lưu thông tin guest để lần sau dùng lại
          localStorage.setItem('guest_id', String(customerId));
          localStorage.setItem('guest_name', guestName.trim());
          localStorage.setItem('guest_phone', guestPhone.trim());
          localStorage.setItem('guest_email', fallbackEmail);
          localStorage.setItem('auth_type', 'guest');
        }
      }

      // ✅ Build payload sau khi có customerId
      const totalBeforeDiscount = total;
      const totalAfterDiscount = finalTotal;
      const discount = totalBeforeDiscount - totalAfterDiscount;

      const payloadItems = cartItems.map(ci => {
        const pid = 'product_id' in ci ? Number((ci as any).product_id) : Number((ci as any).product?.id ?? 0);
        const basePrice = Number(serverProducts[pid]?.price ?? (ci as any).product?.price ?? 0);
        const share = totalBeforeDiscount > 0 ? (basePrice * ci.quantity) / totalBeforeDiscount : 0;
        const discountedPrice = basePrice - (share * discount) / ci.quantity;
        const storeId = 'store_id' in ci ? Number((ci as any).store_id) : 1;

        return {
          product_id: pid,
          quantity: ci.quantity,
          price_at_order: Math.round(discountedPrice),
          store_id: Number(storeId),
        };
      });

      const payload = {
        customer_id: customerId,
        shipping_address: address,
        voucher_id: selectedVoucher ? Number(selectedVoucher.id) : null,
        payment_method: paymentMethod === 'COD' ? 'ONSITE' : 'CARD',
        items: payloadItems,
        total_amount: totalAfterDiscount,
        discount_amount: discount,
        original_amount: totalBeforeDiscount,
      };

      console.log('📦 Gửi đơn hàng:', payload);

      const res = await orderApi.createOrder(payload);
      const createdId = Number(res?.data?.id ?? res?.id);

      if (!createdId) {
        const backendMsg = res?.data?.error || res?.data?.message || 'Không lấy được ID đơn hàng';
        throw new Error(backendMsg);
      }

      if (paymentMethod === 'VNPAY') {
        // Với VNPay, chỉ chuyển hướng thanh toán, email sẽ được gửi từ backend nếu là guest
        // 🧹 XÓA THÔNG TIN GUEST NGAY TRƯỚC KHI CHUYỂN SANG VNPAY
        if (!isAuthenticated) {
          clearGuestData();
        }
        await handlePayment(createdId, totalAfterDiscount);
      } else {
        // Với COD, chỉ gửi email cho guest, user đăng nhập không cần email
        if (!isAuthenticated) {
          await sendOrderConfirmationEmail(createdId);
          
          // 🧹 XÓA SẠCH THÔNG TIN GUEST SAU KHI ĐẶT HÀNG THÀNH CÔNG
          clearGuestData();
          window.location.href = `/confirmation?orderId=${createdId}`;
             return;
        }
        
        clearCart();
        try {
          sessionStorage.removeItem('cart_session');
          Cookies.remove('cart_session');
        } catch { }
        window.location.href = '/orders';
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Không thể tạo đơn hàng';
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

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
      {/* Container chính: Thu hẹp tối đa (max-w-3xl) và màu nền tinh tế */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white min-h-screen shadow-sm rounded-lg">
        
        {/* Tiêu đề: Đơn giản, font serif */}
        <h1 className="text-3xl font-serif font-bold mb-8 text-[#8B7D6B] text-center tracking-wide relative pb-2 border-b border-[#D4C3A3]/50">
          Xác nhận Thanh toán
        </h1>

        {/* Cấu trúc Layout: Đổi sang 2 cột cho màn hình lớn hơn */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left: Cart Items + Voucher (3/5 width) */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* Giỏ hàng */}
            <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5"> {/* Giảm padding, border, shadow */}
              <h2 className="text-lg font-semibold mb-4 text-[#2C2A24] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#A38D64]" /> Chi tiết đơn hàng
              </h2>
              
              {loadingCart ? (
                <div className="text-center text-[#65604E] py-6 text-sm flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin text-[#A38D64]"/> Đang tải giỏ hàng...
                </div>
              ) : (serverItems.length === 0 && items.length === 0) ? (
                <div className="text-center text-gray-400 py-6 text-sm">Giỏ hàng trống</div>
              ) : (
                <div className="divide-y divide-[#F5F3EF]">
                  {(serverItems.length > 0 ? serverItems : items.map((i, idx) => ({ id: `guest-${idx}`, product_id: Number(i.product.id), quantity: i.quantity, store_id: Number(i.product.store?.id || 0) }))).map(ci => {
                    const p = serverProducts[ci.product_id] || contextProducts[ci.product_id];
                    if (!p) return null;
                    return (
                      <div key={ci.id} className="flex justify-between py-3 items-center">
                        <div className="flex items-center gap-3"> {/* Giảm khoảng cách */}
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-[#F1F0E8]" />} {/* Ảnh 48x48 */}
                          <div>
                            <div className="font-medium text-sm text-[#2C2A24]">{p.name}</div>
                            <div className="text-xs text-[#7C7768]">SL: {ci.quantity}</div>
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-[#2C2A24]">{formatPrice(p.price * ci.quantity)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Voucher - Tiếp tục tinh chỉnh thẻ, sử dụng màu sắc tối giản */}
            <div className="bg-[#EFE9DC] rounded-lg shadow-inner p-4 border border-[#D4C3A3]/50"> {/* Giảm padding, shadow */}
              <h2 className="text-lg font-semibold mb-3 text-[#2C2A24] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#A38D64]" /> Mã ưu đãi
              </h2>
              {loadingVouchers ? (
                <div className="text-center text-[#65604E] py-4 text-sm">Đang tải...</div>
              ) : availableVouchers.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                        className={`p-3 rounded-md transition border-2 ${selected ? 'bg-[#D6C5A9] border-[#A38D64] shadow-md' : eligible ? 'bg-white border-[#D4C3A3]/50 hover:bg-[#F9F7F3]' : 'bg-[#F3F1ED] border-[#E0DCCA] cursor-not-allowed opacity-70'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-bold text-sm text-[#2C2A24] truncate">
                              {v.code}
                            </div>
                            <p className="text-xs text-[#7C7768] mt-0.5 truncate">{v.description || 'Ưu đãi đặc biệt'}</p>
                          </div>
                          <div className="text-right flex flex-col items-end pl-2">
                            <p className="font-bold text-base text-[#A38D64]">
                              {type === 'PERCENT' || type === 'PERCENTAGE' ? `${discountVal}%` : formatPrice(discountVal)}
                            </p>
                            <p className={`text-xs mt-0.5 ${eligible ? 'text-[#3D6647]' : 'text-red-600'}`}>
                              {eligible ? <CheckCircle className='w-3 h-3 inline-block mr-0.5'/> : <X className='w-3 h-3 inline-block mr-0.5'/>} 
                              {eligible ? 'Đủ ĐK' : `Min: ${formatPrice(minOrder)}`}
                            </p>
                          </div>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-[#65604E] py-4 text-sm">Bạn chưa có mã ưu đãi nào.</div>
              )}
            </div>
          </div>

          {/* Right: Summary + Form (2/5 width) */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Tổng cộng */}
            <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5 sticky top-4"> {/* Giảm padding, border, shadow */}
              <h2 className="text-lg font-semibold mb-4 text-[#2C2A24]">💰 Tóm tắt đơn hàng</h2>
              <div className="space-y-2"> {/* Giảm khoảng cách */}
                <div className="flex justify-between text-sm text-[#5A5547]">
                  <span>Tổng tiền hàng</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#3D6647] text-sm font-semibold border-t border-dashed border-gray-200 pt-2">
                    <span>Mã giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-3 items-center">
                  <span className="text-base font-bold text-[#2C2A24]">Thành tiền</span>
                  <div className="text-right">
                    {discountAmount > 0 && <div className="text-xs text-gray-400 line-through">{formatPrice(total)}</div>}
                    <span className="text-xl font-bold text-[#A38D64]">{formatPrice(finalTotal)}</span> {/* Font 2xl -> xl */}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5 space-y-4"> {/* Giảm padding, border, shadow */}
              <h2 className="text-lg font-semibold text-[#2C2A24] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#A38D64]" /> Thông tin giao nhận
              </h2>
              
              {/* Guest Info */}
              {!isAuthenticated && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User className='w-3 h-3'/> Họ và tên *
                    </label>
                    <input
                      className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Phone className='w-3 h-3'/> SĐT *
                      </label>
                      <input
                        className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="090xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Mail className='w-3 h-3'/> Email (Không bắt buộc)
                      </label>
                      <input
                        className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className='w-3 h-3'/> Địa chỉ giao hàng *
                </label>
                <textarea
                  className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                  rows={3}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
                />
              </div>
              
              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <CreditCard className='w-3 h-3'/> Phương thức thanh toán
                </label>
                <select
                  title='payment'
                  className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition bg-white"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as 'COD' | 'VNPAY')}
                >
                  <option value="COD">🏠 Thanh toán khi nhận hàng (COD)</option>
                  <option value="VNPAY">💳 Thanh toán qua VNPay</option>
                </select>
              </div>
              
              {error && <div className="bg-red-50 border border-red-300 text-red-700 text-xs px-3 py-2 rounded-md">{error}</div>}
              
              {/* Submit Button */}
              <button
                disabled={creating || loadingCart || finalTotal === 0 || !address.trim() || (!isAuthenticated && (!guestName.trim() || !guestPhone.trim()))}
                onClick={handleCreate}
                className="w-full bg-[#A38D64] text-white px-6 py-3 rounded-md text-base font-bold disabled:opacity-50 hover:bg-[#8D7A58] transition shadow-md hover:shadow-lg"
              >
                {creating ? <span className='flex items-center justify-center gap-2'><Clock className='w-4 h-4 animate-spin'/> Đang xử lý...</span> : paymentMethod === 'VNPAY' ? `THANH TOÁN ${formatPrice(finalTotal)}` : `ĐẶT HÀNG COD ${formatPrice(finalTotal)}`}
              </button>
              
              <p className="text-center text-xs text-gray-500 pt-1">
                  *Bằng việc đặt hàng, bạn đồng ý với Điều khoản và Điều kiện của chúng tôi.
              </p>

            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
