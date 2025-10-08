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

  // Load server-side cart items for authenticated user
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
          product_id: ci.product_id,
          quantity: Number(ci.quantity ?? 1),
        }));
        setServerItems(mapped);
      } catch (e) {
        // ignore, fallback to local items
      } finally {
        if (mounted) setLoadingCart(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated, user?.id]);

  // Load product details for server items
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

  const total = useMemo(() => {
    if (serverItems.length > 0) {
      return serverItems.reduce((acc, ci) => acc + (serverProducts[String(ci.product_id)]?.price ?? 0) * (ci.quantity ?? 1), 0);
    }
    return items.reduce((acc, cur) => acc + cur.product.price * cur.quantity, 0);
  }, [items, serverItems, serverProducts]);

  const handleCreate = async () => {
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
      };
      const res = await orderApi.createOrder(payload);
      const order = res?.data || res; // backend wraps in { success, data }
      const createdId = Number(order?.id ?? order?.data?.id);
      if (!createdId) throw new Error('Không lấy được ID đơn hàng');
      setOrderId(createdId);
      if (paymentMethod === 'VNPAY') {
        const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/orders` : undefined;
        const pay = await paymentApi.createVnPayPayment(createdId, total, returnUrl);
        console.log('VNPay response:', pay);
        const paymentUrl = pay?.paymentUrl || pay?.data?.paymentUrl || pay?.url || pay?.redirectUrl || pay?.data?.redirectUrl;
        if (!paymentUrl) throw new Error('Không lấy được đường dẫn thanh toán');
        window.location.href = paymentUrl;
      } else {
        // COD: giữ trạng thái chưa thanh toán, chuyển sang trang đơn hàng của tôi
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

        {/* Hiển thị danh sách sản phẩm trong giỏ hàng */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Sản phẩm</h2>
          {loadingCart ? (
            <div className="text-gray-600">Đang tải giỏ hàng…</div>
          ) : serverItems.length > 0 ? (
            <div className="space-y-3">
              {serverItems.map((ci) => (
                <div key={ci.id} className="flex items-center justify-between border rounded p-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={(serverProducts[String(ci.product_id)]?.images?.[0]) || '/pott.jpg'} alt={`Sản phẩm ${ci.product_id}`} className="w-14 h-14 object-cover rounded" />
                    <div>
                      <div className="font-medium">{serverProducts[String(ci.product_id)]?.name || `Sản phẩm #${ci.product_id}`}</div>
                      <div className="text-sm text-gray-600">x{ci.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatPrice((serverProducts[String(ci.product_id)]?.price ?? 0) * ci.quantity)}</div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between border rounded p-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.images[0] || '/pott.jpg'} alt={product.name} className="w-14 h-14 object-cover rounded" />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">x{quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatPrice(product.price * quantity)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">Giỏ hàng trống</div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Tổng tiền</span>
            <span className="text-xl font-semibold">{formatPrice(total)}</span>
          </div>
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
          <button disabled={creating || loadingCart} onClick={handleCreate} className="bg-[#65604E] text-white px-5 py-3 rounded disabled:opacity-50">
            {creating ? 'Đang xử lý…' : paymentMethod === 'VNPAY' ? 'Tạo đơn & Thanh toán VNPay' : 'Tạo đơn (COD)'}
          </button>
        </div>
      </div>
    </BaseLayout>
  );
}



