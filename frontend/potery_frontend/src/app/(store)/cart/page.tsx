'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../contexts/AuthContext';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [address, setAddress] = useState('');
  const [serverItems, setServerItems] = useState<Array<{ id: string; product_id: string | number; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverProducts, setServerProducts] = useState<Record<string, {
    id: string;
    name: string;
    price: number;
    images: string[];
  }>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user || !user.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await cartApi.getByCustomer(user.id as string);
        if (mounted) {
          const mapped = (Array.isArray(data) ? data : []).map((ci: any) => ({
            id: String(ci.id ?? ci._id ?? ''),
            product_id: ci.product_id,
            quantity: Number(ci.quantity ?? 1),
          }));
          setServerItems(mapped);
        }
      } catch (e) {
        if (mounted) setError('Không thể tải giỏ hàng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  // Fetch product details for serverItems so we can render image/name/price
  useEffect(() => {
    let mounted = true;
    (async () => {
      const missing = serverItems
        .map((ci) => String(ci.product_id))
        .filter((pid) => !serverProducts[pid]);
      if (missing.length === 0) return;
      try {
        const results = await Promise.allSettled(missing.map((pid) => productApi.getProductById(pid)));
        if (!mounted) return;
        const next: Record<string, any> = { ...serverProducts };
        results.forEach((r, idx) => {
          const pid = missing[idx];
          if (r.status === 'fulfilled' && r.value) {
            next[pid] = {
              id: r.value.id,
              name: r.value.name,
              price: r.value.price,
              images: r.value.images,
            };
          }
        });
        setServerProducts(next);
      } catch {
        // ignore; rows without details will render with placeholders
      }
    })();
    return () => { mounted = false; };
  }, [serverItems, serverProducts]);

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Giỏ hàng</h1>

        {(loading && <div className="text-gray-600">Đang tải giỏ hàng…</div>)}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (serverItems.length > 0 ? (
          <div className="space-y-4">
            {serverItems.map((ci) => (
              <div key={ci.id} className="flex items-center justify-between border rounded p-4">
                <div className="flex items-center gap-4">
                  <img src={(serverProducts[String(ci.product_id)]?.images?.[0]) || '/pott.jpg'} alt={`Sản phẩm ${ci.product_id}`} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-medium">{serverProducts[String(ci.product_id)]?.name || `Sản phẩm #${ci.product_id}`}</div>
                    <div className="text-sm text-gray-600">{formatPrice(serverProducts[String(ci.product_id)]?.price ?? 0)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">x{ci.quantity}</div>
              </div>
            ))}
          </div>
        ) : (
          items.length === 0 ? (
            <div className="text-gray-600">Chưa có sản phẩm trong giỏ hàng.</div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between border rounded p-4">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0] || '/pott.jpg'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{formatPrice(product.price)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20"
                      min={1}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, Math.max(1, Number(e.target.value)))}
                    />
                    <button className="text-red-600" onClick={() => removeItem(product.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-2">Địa chỉ giao hàng</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded p-3"
              rows={4}
              placeholder="Nhập địa chỉ giao hàng của bạn"
            />
          </div>
          <div className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span>Tạm tính</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <a href="/checkout" className="block text-center bg-[#65604E] text-white py-2 rounded mt-4">Tiến hành thanh toán</a>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}


