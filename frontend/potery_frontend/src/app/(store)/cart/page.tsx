'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../contexts/AuthContext';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';
import Link from 'next/link';

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

  // Lấy giỏ hàng từ server
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user?.id) return;
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
      } catch {
        if (mounted) setError('Không thể tải giỏ hàng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  // Lấy thông tin sản phẩm từ API để hiển thị
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
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [serverItems, serverProducts]);

  // Tính tổng tiền
  const total = React.useMemo(() => {
    if (serverItems.length > 0) {
      return serverItems.reduce((acc, ci) => acc + (serverProducts[String(ci.product_id)]?.price ?? 0) * (ci.quantity ?? 1), 0);
    }
    return subtotal;
  }, [serverItems, serverProducts, subtotal]);

  // Component hiển thị một sản phẩm
  const renderCartItem = (product: any, quantity: number, id?: string | number) => (
    <div key={id || product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded p-4 gap-3">
      <div className="flex items-center gap-4">
        <img
          src={product.images?.[0] || '/pott.jpg'}
          alt={product.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-gray-600">{formatPrice(product.price)}</div>
          <div className="text-sm text-gray-500">Số lượng: {quantity}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <Link
          href={`/checkout?product_id=${product.id}&quantity=${quantity}`}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
        >
          Đặt hàng
        </Link>

        <button
          className="text-red-600 hover:text-red-700"
          onClick={async () => {
            if (id) {
              try {
                await cartApi.remove(id);
                setServerItems(prev => prev.filter(x => x.id !== id));
              } catch {
                alert('Không thể xóa sản phẩm khỏi giỏ');
              }
            } else {
              removeItem(product.id);
            }
          }}
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Giỏ hàng</h1>

        {loading && <div className="text-gray-600">Đang tải giỏ hàng…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {/* Server items */}
            {serverItems.length > 0 && (
              <div className="space-y-4">
                {serverItems.map(ci => {
                  const product = serverProducts[String(ci.product_id)];
                  if (!product) return null;
                  return renderCartItem(product, ci.quantity, ci.id);
                })}
              </div>
            )}

            {/* Local items fallback */}
            {serverItems.length === 0 && (
              items.length === 0 ? (
                <div className="text-gray-600">Chưa có sản phẩm trong giỏ hàng.</div>
              ) : (
                <div className="space-y-4">
                  {items.map(({ product, quantity }) => renderCartItem(product, quantity))}
                </div>
              )
            )}
          </>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span>Tổng tiền</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="block text-center bg-[#65604E] text-white py-2 rounded mt-4">
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
