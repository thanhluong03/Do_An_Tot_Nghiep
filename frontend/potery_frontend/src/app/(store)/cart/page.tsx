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
  const [serverItems, setServerItems] = useState<Array<{ id: string; product_id: string | number; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverProducts, setServerProducts] = useState<Record<string, any>>({});

  // 🔹 Lấy giỏ hàng từ server
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
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  // 🔹 Lấy thông tin sản phẩm (bao gồm giá giảm)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const missing = serverItems.map(ci => String(ci.product_id)).filter(pid => !serverProducts[pid]);
      if (missing.length === 0) return;
      try {
        const results = await Promise.allSettled(missing.map(pid => productApi.getProductById(pid)));
        if (!mounted) return;
        const next: Record<string, any> = { ...serverProducts };
        results.forEach((r, idx) => {
          const pid = missing[idx];
          if (r.status === 'fulfilled' && r.value) {
            next[pid] = {
              id: r.value.id,
              name: r.value.name,
              price: r.value.price, // ✅ giá đã giảm
              originalPrice: r.value.originalPrice,
              images: r.value.images,
            };
          }
        });
        setServerProducts(next);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serverItems, serverProducts]);

  // 🔹 Tổng tiền (giá sau giảm)
  const total = React.useMemo(() => {
    if (serverItems.length > 0) {
      return serverItems.reduce(
        (acc, ci) =>
          acc + (serverProducts[String(ci.product_id)]?.price ?? 0) * (ci.quantity ?? 1),
        0
      );
    }
    return subtotal;
  }, [serverItems, serverProducts, subtotal]);

  // ✅ Hiển thị item có giá giảm
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

          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="text-red-600 font-semibold">{formatPrice(product.price)}</span>
            </div>
          ) : (
            <div className="text-gray-800 font-semibold">{formatPrice(product.price)}</div>
          )}

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
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-4xl font-serif font-bold mb-8 text-center">Giỏ Hàng</h1>

    {loading && <div className="text-gray-500 text-center">Đang tải giỏ hàng…</div>}
    {error && <div className="text-red-600 text-center">{error}</div>}

    {!loading && !error && (
      <>
        {serverItems.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {serverItems.map(ci => {
              const product = serverProducts[String(ci.product_id)];
              if (!product) return null;
              return (
                <div key={ci.id} className="border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition">
                  <img src={product.images?.[0] || '/pott.jpg'} alt={product.name} className="w-28 h-28 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
                        <span className="text-red-600 font-bold">{formatPrice(product.price)}</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-gray-800 font-bold">{formatPrice(product.price)}</div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Số lượng: {ci.quantity}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/checkout?product_id=${product.id}&quantity=${ci.quantity}`}
                      className="px-4 py-2 bg-[#65604E] text-white rounded-lg text-sm text-center hover:bg-[#524c3f] transition"
                    >
                      Đặt hàng
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-700 text-lg"
                      onClick={async () => {
                        if (ci.id) {
                          try {
                            await cartApi.remove(ci.id);
                            setServerItems(prev => prev.filter(x => x.id !== ci.id));
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
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12 text-lg">Chưa có sản phẩm trong giỏ hàng.</div>
        )}
        {/* Tổng tiền */}
        <div className="mt-12 flex justify-end">
          <div className="border rounded-2xl p-6 w-full md:w-1/3 shadow-sm">
            <div className="flex justify-between text-lg mb-4">
              <span>Tổng tiền</span>
              <span className="font-bold">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block text-center bg-[#65604E] text-white py-3 rounded-lg font-semibold hover:bg-[#524c3f] transition"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      </>
    )}
  </div>
</BaseLayout>

  );
}
