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
  const [serverItems, setServerItems] = useState<
    Array<{ id: string; product_id: string | number; quantity: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverProducts, setServerProducts] = useState<Record<string, any>>({});
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  // 🔹 Fetch cart from server
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
  useEffect(() => {
  (async () => {
    try {
      // Gọi API lấy 4 sản phẩm gợi ý
      const { products } = await productApi.getProducts({ limit: 4 });
      setRelatedProducts(products);
    } catch (err) {
      console.error("Không thể tải sản phẩm gợi ý:", err);
    }
  })();
}, []);

  // 🔹 Fetch product info
  useEffect(() => {
    let mounted = true;
    (async () => {
      const missing = serverItems
        .map((ci) => String(ci.product_id))
        .filter((pid) => !serverProducts[pid]);
      if (missing.length === 0) return;
      try {
        const results = await Promise.allSettled(
          missing.map((pid) => productApi.getProductById(pid))
        );
        if (!mounted) return;
        const next: Record<string, any> = { ...serverProducts };
        results.forEach((r, idx) => {
          const pid = missing[idx];
          if (r.status === 'fulfilled' && r.value) {
            next[pid] = {
              id: r.value.id,
              name: r.value.name,
              price: r.value.price,
              originalPrice: r.value.originalPrice,
              images: r.value.images,
            };
          }
        });
        setServerProducts(next);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [serverItems, serverProducts]);

  // 🔹 Total
  const total = React.useMemo(() => {
    if (serverItems.length > 0) {
      return serverItems.reduce(
        (acc, ci) =>
          acc +
          (serverProducts[String(ci.product_id)]?.price ?? 0) *
            (ci.quantity ?? 1),
        0
      );
    }
    return subtotal;
  }, [serverItems, serverProducts, subtotal]);

  return (
    <BaseLayout>
      <section className="bg-[#FAF9F7] min-h-screen py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Tiêu đề */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#2C2A24]">
              Giỏ hàng của bạn
            </h1>
            <p className="text-[#8C8674] text-sm mt-2">
              Nơi lưu giữ những món gốm bạn yêu thích
            </p>
          </div>

          {loading && (
            <div className="text-center text-gray-500">Đang tải giỏ hàng...</div>
          )}
          {error && <div className="text-center text-red-600">{error}</div>}

          {!loading && !error && (
            <>
              {serverItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                  {/* Bên trái: danh sách sản phẩm */}
                  <div className="space-y-4">
                    {serverItems.map((ci) => {
                      const product = serverProducts[String(ci.product_id)];
                      if (!product) return null;
                      const totalPrice = product.price * ci.quantity;
                      return (
                        <div
                          key={ci.id}
                          className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={product.images?.[0] || '/pott.jpg'}
                              alt={product.name}
                              className="w-20 h-20 rounded-md object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-[#2C2A24]">
                                {product.name}
                              </h3>
                              <p className="text-sm text-[#8C8674]">
                                {formatPrice(product.price)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(product.id, ci.quantity - 1)
                                  }
                                  className="border rounded px-2 text-sm"
                                >
                                  −
                                </button>
                                <span className="px-2">{ci.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(product.id, ci.quantity + 1)
                                  }
                                  className="border rounded px-2 text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#2C2A24]">
                              {formatPrice(totalPrice)}
                            </p>
                            <button
                              onClick={async () => {
                                await cartApi.remove(ci.id);
                                setServerItems((prev) =>
                                  prev.filter((x) => x.id !== ci.id)
                                );
                              }}
                              className="text-red-500 text-sm mt-1 hover:underline"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bên phải: Tóm tắt đơn hàng */}
                  <div className="bg-white border rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-[#2C2A24] mb-4">
                      Tóm tắt đơn hàng
                    </h3>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(total - 30000)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span>Phí vận chuyển:</span>
                      <span>{formatPrice(30000)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-[#A67C52] text-lg">
                      <span>Tổng cộng:</span>
                      <span>{formatPrice(total)}</span>
                    </div>

                    {/* Mã giảm giá */}
                    

                    <Link
                      href="/checkout"
                      className="block text-center mt-6 bg-[#A67C52] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
                    >
                      Tiến hành thanh toán
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-12 text-lg">
                  Chưa có sản phẩm trong giỏ hàng.
                </div>
              )}
            </>
          )}
        </div>
        {/* Gợi ý sản phẩm */}
{relatedProducts.length > 0 && (
  <div className="max-w-6xl mx-auto mt-16 px-4">
    <h2 className="text-2xl font-semibold text-center mb-8 text-[#2C2A24]">
      Có thể bạn sẽ thích
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {relatedProducts.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition"
        >
          <Link href={`/products/${p.id}`}>
            <img
              src={p.images?.[0] || '/pott.jpg'}
              alt={p.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </Link>
          <div className="mt-3">
            <h3 className="font-medium text-[#2C2A24] line-clamp-1">
              {p.name}
            </h3>
            <p className="text-[#A67C52] font-semibold mt-1">
              {formatPrice(p.price)}
            </p>
            <button
              className="mt-3 w-full bg-[#A67C52] text-white py-2 rounded-md text-sm hover:opacity-90 transition"
              onClick={() => {
                updateQuantity(p.id, 1); // hoặc thêm hàm addToCart riêng nếu có
              }}
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      </section>
      
    </BaseLayout>
  );
}
