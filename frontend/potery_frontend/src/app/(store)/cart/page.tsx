'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../contexts/AuthContext';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'; // Import icons

export default function CartPage() {
  // Constants for styling
  const ACCENT_COLOR = '#A67C52'; // Nâu Vàng Trầm (cho nút và giá tiền)
  const DARK_TEXT = 'text-gray-900';
  const LIGHT_TEXT = 'text-gray-500';
  const BG_COLOR = 'bg-gray-50'; // Nền trang nhẹ

  const { items, addItem, updateQuantity, removeItem, subtotal } = useCart();
  const [cookieItems, setCookieItems] = useState<typeof items>([]);
  const { user, isAuthenticated } = useAuth();
  const [serverItems, setServerItems] = useState<
    Array<{
      id: string;
      product_id: string | number;
      quantity: number;
      store_id: number | string;
      classifications?: {
        attribute1_id?: number;
        attribute2_id?: number;
        attribute1_name?: string;
        attribute2_name?: string;
      };
      classificationId?: number;
      price?: number;
      classificationPrice?: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverProducts, setServerProducts] = useState<Record<string, any>>({});
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // 🔹 Fetch cart from server (Logic giữ nguyên)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await cartApi.getByCustomer(user.id as string);
        console.log('🛒 Raw cart data from backend:', data);
        if (mounted) {
          const mapped = (Array.isArray(data) ? data : []).map((ci: any) => {
            console.log('🔍 Cart item data:', {
              id: ci.id,
              product_id: ci.product_id,
              classification_id: ci.classification_attribute_relationship_id,
              classificationPrice: ci.classificationPrice,
              classificationRelationship: ci.classificationRelationship,
              attribute1_name: ci.attribute1_name,
              attribute2_name: ci.attribute2_name
            });

            return {
              id: String(ci.id ?? ci._id ?? ''),
              product_id: ci.product_id,
              quantity: Number(ci.quantity ?? 1),
              store_id: ci.store?.id || ci.store_id || '',
              // Add classification info from server cart
              classificationId: ci.classification_attribute_relationship_id,
              classifications: ci.classification_attribute_relationship_id ? {
                attribute1_id: ci.attribute1_id,
                attribute2_id: ci.attribute2_id,
                attribute1_name: ci.attribute1_name || '',
                attribute2_name: ci.attribute2_name || ''
              } : undefined,
              // Use classification price from the classification relationship
              price: ci.classificationPrice || null,
              classificationPrice: ci.classificationPrice || null
            };
          });
          console.log('🛒 Mapped cart items:', mapped);
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

  // 🔹 Guest: read session cart (fallback cookie) as fallback if context empty
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      let parsed: any[] | null = null;
      if (typeof window !== 'undefined') {
        const ss = sessionStorage.getItem('cart_session');
        if (ss) parsed = JSON.parse(ss);
      }
      if (!parsed) {
        const saved = Cookies.get('cart_session');
        if (saved) parsed = JSON.parse(saved || '[]');
      }
      if (parsed) {
        if (Array.isArray(parsed)) setCookieItems(parsed);
      }
    } catch { }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    if (items.length > 0) return;
    if (cookieItems.length === 0) return;
    cookieItems.forEach(ci => {
      if (ci?.product) addItem(ci.product, ci.quantity ?? 1);
    });
    // Do not set cookieItems here to avoid loops; addItem will persist cookie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, cookieItems.length]);

  // 🔹 Fetch related products (Logic giữ nguyên)
  useEffect(() => {
    (async () => {
      try {
        const { products } = await productApi.getProducts({ limit: 4 });
        setRelatedProducts(products);
      } catch (err) {
        console.error('Không thể tải sản phẩm gợi ý:', err);
      }
    })();
  }, []);

  // 🔹 Fetch product info (Logic giữ nguyên)
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
      } catch { }
    })();
    return () => {
      mounted = false;
    };
  }, [serverItems, serverProducts]);

  // 🔹 Total calculation - Updated to use classification prices
  const total = React.useMemo(() => {
    if (serverItems.length > 0) {
      const calculatedTotal = serverItems.reduce(
        (acc, ci) => {
          const product = serverProducts[String(ci.product_id)];
          if (!product) return acc;
          // Use classification price if available, otherwise use product base price
          const actualPrice = ci.classificationPrice || ci.price || product.price;
          return acc + actualPrice * (ci.quantity ?? 1);
        },
        0
      );
      return calculatedTotal + 30000;
    }
    return subtotal + 30000;
  }, [serverItems, serverProducts, subtotal]);

  const subTotalOnly = React.useMemo(() => total - 30000, [total]);

  // 🔹 Handlers
  // Hàm xử lý tăng/giảm số lượng
  const handleUpdateQuantity = async (ciId: string, currentQuantity: number, delta: 1 | -1) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (newQuantity === currentQuantity) return;

    try {
      await cartApi.update(ciId, { quantity: newQuantity });
      setServerItems((prev) =>
        prev.map((item) =>
          item.id === ciId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error(`Lỗi khi ${delta > 0 ? 'tăng' : 'giảm'} số lượng:`, err);
    }
  };

  // Hàm xử lý xóa sản phẩm
  const handleRemoveItem = async (ciId: string) => {
    try {
      await cartApi.remove(ciId);
      setServerItems((prev) => prev.filter((x) => x.id !== ciId));
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
    }
  };

  return (
    <BaseLayout>
      {/* DIV bao ngoài cùng (Nền trang) */}
      <div className={`${BG_COLOR} min-h-screen py-16`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

          {/* KHỐI NỘI DUNG CHÍNH: Nền trắng, bóng mờ sang trọng */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/50 p-6 md:p-10">

            {/* Tiêu đề */}
            <div className="text-center mb-12 border-b border-gray-100 pb-6">
              <h1 className={`text-5xl font-serif font-light tracking-wide ${DARK_TEXT}`}>
                Giỏ Hàng
              </h1>
              <p className={`text-md ${LIGHT_TEXT} mt-3`}>
                Kiểm tra lại những tác phẩm thủ công bạn đã chọn
              </p>
            </div>

            {loading && (
              <div className="text-center text-gray-500 py-10">Đang tải giỏ hàng...</div>
            )}
            {error && <div className="text-center text-red-600 py-10">{error}</div>}

            {!loading && !error && (
              <>
                {isAuthenticated && serverItems.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-10">
                    {/* Bên trái: Danh sách sản phẩm */}
                    <div className="space-y-6">
                      {serverItems.map((ci) => {
                        const product = serverProducts[String(ci.product_id)];
                        if (!product) return null;

                        // Use classification price if available, otherwise use product base price
                        const actualPrice = ci.classificationPrice || ci.price || product.price;
                        const totalPrice = actualPrice * ci.quantity;

                        console.log('🔍 Cart item pricing:', {
                          productId: ci.product_id,
                          productName: product.name,
                          productBasePrice: product.price,
                          classificationPrice: ci.classificationPrice,
                          fallbackPrice: ci.price,
                          actualPrice: actualPrice,
                          classifications: ci.classifications
                        });

                        // Debug log for pricing
                        console.log('🔍 Cart item pricing:', {
                          productName: product.name,
                          basePrice: product.price,
                          classificationPrice: ci.price,
                          actualPrice: actualPrice,
                          classifications: ci.classifications,
                          classificationId: ci.classificationId
                        });

                        return (
                          // KHỐI SẢN PHẨM
                          <div
                            key={ci.id}
                            className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row items-center gap-5 shadow-lg shadow-gray-100/50"
                          >
                            {/* Ảnh sản phẩm */}
                            <Link href={`/products/${product.id}`} className="flex-shrink-0">
                              <img
                                src={product.images?.[0] || '/pott.jpg'}
                                alt={product.name}
                                className="w-24 h-24 rounded-lg object-cover transition-transform hover:scale-105"
                              />
                            </Link>

                            {/* Thông tin & Số lượng */}
                            <div className="flex-grow flex justify-between items-center w-full md:w-auto">
                              <div className="flex-grow">
                                <Link href={`/products/${product.id}`}>
                                  <h3 className={`font-medium text-lg ${DARK_TEXT} hover:underline transition`}>
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className={`text-sm ${LIGHT_TEXT}`}>
                                  Đơn giá: {formatPrice(actualPrice)}
                                </p>

                                {/* Show classification info if available */}
                                {ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id) && (
                                  <div className="flex gap-2 mt-2">
                                    {ci.classifications.attribute1_name && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-md">
                                        {ci.classifications.attribute1_name}
                                      </span>
                                    )}
                                    {ci.classifications.attribute2_name && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-md">
                                        {ci.classifications.attribute2_name}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Bộ đếm số lượng */}
                                <div className="flex items-center mt-3 border border-gray-300 rounded-lg w-fit">
                                  <button
                                    title='update'
                                    onClick={() => handleUpdateQuantity(ci.id, ci.quantity, -1)}
                                    disabled={ci.quantity === 1}
                                    className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className={`px-3 font-semibold ${DARK_TEXT}`}>
                                    {ci.quantity}
                                  </span>
                                  <button
                                    title='update'
                                    onClick={() => handleUpdateQuantity(ci.id, ci.quantity, 1)}
                                    className="p-2 text-gray-700 hover:bg-gray-100 transition"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Tổng tiền và Nút xóa */}
                              <div className="text-right flex flex-col items-end gap-2">
                                <p className={`font-bold text-lg text-[${ACCENT_COLOR}]`}>
                                  {formatPrice(totalPrice)}
                                </p>
                                <button
                                  onClick={() => handleRemoveItem(ci.id)}
                                  className={`text-sm ${LIGHT_TEXT} hover:text-red-600 transition flex items-center gap-1`}
                                >
                                  <Trash2 className="w-4 h-4" /> Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bên phải: Tóm tắt đơn hàng */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-6 h-fit">
                      <h3 className={`text-xl font-serif font-semibold ${DARK_TEXT} mb-5 border-b pb-3`}>
                        Tóm tắt đơn hàng
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className={`flex justify-between text-base ${DARK_TEXT}`}>
                          <span>Tạm tính ({serverItems.length} sản phẩm):</span>
                          <span>{formatPrice(subTotalOnly)}</span>
                        </div>
                        <div className={`flex justify-between text-base ${DARK_TEXT}`}>
                          <span>Phí vận chuyển:</span>
                          <span>{formatPrice(30000)}</span>
                        </div>
                      </div>

                      {/* Tổng cộng */}
                      <div className={`border-t border-gray-300 pt-4 flex justify-between font-bold text-xl text-[${ACCENT_COLOR}]`}>
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(total)}</span>
                      </div>

                      <Link
                        href="/checkout"
                        className="block text-center mt-8 bg-[#A0522D] text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-[#8B4513] shadow-md hover:shadow-lg"
                      >
                        Tiến hành thanh toán
                      </Link>
                    </div>
                  </div>
                ) : !isAuthenticated && (items.length > 0 || cookieItems.length > 0) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-10">
                    {/* Left: Guest items from cookie */}
                    <div className="space-y-6">
                      {(items.length > 0 ? items : cookieItems).map((ci) => {
                        const product = ci.product;
                        const actualPrice = ci.price || product.price; // Use classification price if available
                        const totalPrice = actualPrice * (ci.quantity ?? 1);

                        // Generate unique key including classification info
                        const uniqueKey = ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id)
                          ? `${product.id}-${ci.classifications.attribute1_id || 'null'}-${ci.classifications.attribute2_id || 'null'}`
                          : product.id;

                        return (
                          <div
                            key={uniqueKey}
                            className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row items-center gap-5 shadow-lg shadow-gray-100/50"
                          >
                            <Link href={`/products/${product.id}`} className="flex-shrink-0">
                              <img
                                src={product.images?.[0] || '/pott.jpg'}
                                alt={product.name}
                                className="w-24 h-24 rounded-lg object-cover transition-transform hover:scale-105"
                              />
                            </Link>
                            <div className="flex-grow flex justify-between items-center w-full md:w-auto">
                              <div className="flex-grow">
                                <Link href={`/products/${product.id}`}>
                                  <h3 className={`font-medium text-lg ${DARK_TEXT} hover:underline transition`}>
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className={`text-sm ${LIGHT_TEXT}`}>
                                  Đơn giá: {formatPrice(actualPrice)}
                                </p>

                                {/* Show classification info if available */}
                                {ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id) && (
                                  <div className="flex gap-2 mt-2">
                                    {ci.classifications.attribute1_name && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-md">
                                        {ci.classifications.attribute1_name}
                                      </span>
                                    )}
                                    {ci.classifications.attribute2_name && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-md">
                                        {ci.classifications.attribute2_name}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Bộ đếm số lượng */}
                                <div className="flex items-center mt-3 border border-gray-300 rounded-lg w-fit">
                                  <button
                                    title='update'
                                    onClick={() => {
                                      const cartKey = ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id)
                                        ? `${product.id}-${ci.classifications.attribute1_id || 'null'}-${ci.classifications.attribute2_id || 'null'}`
                                        : undefined;
                                      updateQuantity(product.id, Math.max(1, (ci.quantity ?? 1) - 1), cartKey);
                                    }}
                                    disabled={ci.quantity === 1}
                                    className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className={`px-3 font-semibold ${DARK_TEXT}`}>
                                    {ci.quantity}
                                  </span>
                                  <button
                                    title='update'
                                    onClick={() => {
                                      const cartKey = ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id)
                                        ? `${product.id}-${ci.classifications.attribute1_id || 'null'}-${ci.classifications.attribute2_id || 'null'}`
                                        : undefined;
                                      updateQuantity(product.id, (ci.quantity ?? 1) + 1, cartKey);
                                    }}
                                    className="p-2 text-gray-700 hover:bg-gray-100 transition"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                <p className={`font-bold text-lg text-[${ACCENT_COLOR}]`}>
                                  {formatPrice(totalPrice)}
                                </p>
                                <button
                                  onClick={() => {
                                    const cartKey = ci.classifications && (ci.classifications.attribute1_id || ci.classifications.attribute2_id)
                                      ? `${product.id}-${ci.classifications.attribute1_id || 'null'}-${ci.classifications.attribute2_id || 'null'}`
                                      : undefined;
                                    removeItem(product.id, cartKey);
                                  }}
                                  className={`text-sm ${LIGHT_TEXT} hover:text-red-600 transition flex items-center gap-1`}
                                >
                                  <Trash2 className="w-4 h-4" /> Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Right: Summary for guest */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-6 h-fit">
                      <h3 className={`text-xl font-serif font-semibold ${DARK_TEXT} mb-5 border-b pb-3`}>
                        Tóm tắt đơn hàng
                      </h3>
                      <div className="space-y-3 mb-6">
                        <div className={`flex justify-between text-base ${DARK_TEXT}`}>
                          <span>Tạm tính ({(items.length > 0 ? items : cookieItems).length} sản phẩm):</span>
                          <span>{formatPrice(items.length > 0 ? subtotal : (cookieItems.reduce((s, ci) => s + (ci.price || ci.product.price) * (ci.quantity ?? 1), 0)))}</span>
                        </div>
                        <div className={`flex justify-between text-base ${DARK_TEXT}`}>
                          <span>Phí vận chuyển:</span>
                          <span>{formatPrice(30000)}</span>
                        </div>
                      </div>
                      <div className={`border-t border-gray-300 pt-4 flex justify-between font-bold text-xl text-[${ACCENT_COLOR}]`}>
                        <span>Tổng cộng:</span>
                        <span>{formatPrice((items.length > 0 ? subtotal : (cookieItems.reduce((s, ci) => s + (ci.price || ci.product.price) * (ci.quantity ?? 1), 0))) + 30000)}</span>
                      </div>
                      <Link
                        href="/checkout"
                        className={`block text-center mt-8 bg-[${ACCENT_COLOR}] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#8B4513] transition-all duration-300`}
                      >
                        Tiến hành thanh toán
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className={`text-xl ${LIGHT_TEXT} mt-4`}>
                      Giỏ hàng của bạn đang trống.
                    </p>
                    <Link href="/products" className={`text-sm mt-3 inline-block font-medium hover:underline text-[${ACCENT_COLOR}]`}>
                      Quay lại trang sản phẩm
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>
          {/* KẾT THÚC THẺ DIV BỌC NỘI DUNG CHÍNH */}

        </div>

        {/* ======================================================= */}
        {/* KHỐI GỢI Ý SẢN PHẨM - ĐÃ TINH CHỈNH CSS */}
        {/* ======================================================= */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto mt-20 px-4 md:px-6 lg:px-8 bg-white rounded-2xl shadow-2xl shadow-gray-300/50 p-6 md:p-10">

            {/* Tiêu đề Khối Gợi ý: Font serif, nhẹ nhàng, có đường phân cách */}
            <h2 className={`text-3xl font-serif font-light text-center mb-10 ${DARK_TEXT} border-b border-gray-200 pb-4`}>
              Có thể bạn sẽ thích
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  // CSS CARD GỢI Ý: Nền trắng, bo góc, bóng mờ nhẹ, hover shadow lớn hơn
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-lg shadow-gray-100/50 hover:shadow-xl transition duration-300"
                >
                  <Link href={`/products/${p.id}`}>
                    <img
                      src={p.images?.[0] || '/pott.jpg'}
                      alt={p.name}
                      // Ảnh bo góc
                      className="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="mt-3 text-center">
                    <Link href={`/products/${p.id}`}>
                      {/* Tên sản phẩm */}
                      <h3 className={`font-medium ${DARK_TEXT} line-clamp-1 hover:text-[${ACCENT_COLOR}] transition`}>
                        {p.name}
                      </h3>
                    </Link>
                    {/* Giá: Màu accent, font đậm */}
                    <p className={`text-[${ACCENT_COLOR}] font-bold text-lg mt-1 mb-3`}>
                      {formatPrice(p.price)}
                    </p>
                    {/* Nút Thêm vào giỏ: Outline, màu accent, hover lấp đầy */}
                    <button
                      className={`w-full border border-[${ACCENT_COLOR}] text-[${ACCENT_COLOR}] py-2 rounded-lg text-sm font-medium hover:bg-[${ACCENT_COLOR}] hover:text-white transition`}
                      onClick={() => {
                        // Tạm thời dùng alert, cần thay bằng logic thêm vào giỏ hàng
                        alert(`Thêm sản phẩm ${p.name} vào giỏ hàng.`);
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
      </div>

    </BaseLayout>
  );
}