'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import type { ProductDetail, StoreInventory } from '../../api/modules/products';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { cartApi } from '../../api/modules/cart';
import { useCart } from '../../contexts/CartContext';
import { productApi } from '../../api/modules/products';
import { Modal } from '../common/Modal';

export const ProductCard: React.FC<{ product: Product; onViewDetails?: (p: Product) => void }> = ({
  product,
  onViewDetails,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [showOrderNow, setShowOrderNow] = useState(false);
  const [showAddCart, setShowAddCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // State for product detail (for popup)
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  // Default stores from list, will be replaced by detail if loaded
  const stores: StoreInventory[] = detail?.stores && detail.stores.length > 0
    ? detail.stores
    : [{
      store_id: product.store?.id || '',
      store_name: product.store?.name || 'Cửa hàng mặc định',
      store_address: product.store?.address || '',
      quantity_stock: product.stock ?? 10
    }];
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id || null);
  // Fetch product detail when opening popup
  const fetchDetailForPopup = async () => {
    if (!detail && product.id) {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const fetched = await productApi.getProductById(String(product.id));
        setDetail(fetched);
        // If stores exist, set default selected store
        if (fetched.stores && fetched.stores.length > 0) {
          setSelectedStoreId(fetched.stores[0].store_id);
        }
      } catch {
        setDetailError('Không thể tải chi tiết sản phẩm.');
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleOrderNow = async () => {
    setShowOrderNow(true);
    await fetchDetailForPopup();
  };

  const handleAddCartPopup = async () => {
    setShowAddCart(true);
    await fetchDetailForPopup();
  };

  const handleOrderNowConfirm = () => {
    // Find selected store's stock
    const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
    const stock = selectedStore?.quantity_stock ?? 0;
    if (quantity > stock) {
      alert('Số lượng không đủ trong cửa hàng.');
      return;
    }
    // Redirect to checkout with product id, store id, quantity as query param
    router.push(`/checkout?productId=${product.id}&storeId=${selectedStoreId}&quantity=${quantity}`);
  };

  const handleAddCartConfirm = async () => {
    // Find selected store's stock
    const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
    const stock = selectedStore?.quantity_stock ?? 0;
    if (quantity > stock) {
      alert('Số lượng không đủ trong cửa hàng.');
      return;
    }
    setLoading(true);
    try {
      if (!isAuthenticated || !user?.id) {
        addItem(product, quantity);
        alert('Đã thêm vào giỏ hàng!');
      } else {
        await cartApi.add({
          customer_id: user.id,
          product_id: product.id,
          store_id: selectedStoreId || '',
          quantity,
        });
        alert('Đã thêm vào giỏ hàng!');
      }
      setShowAddCart(false);
    } catch {
      alert('Không thể thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Guest: save to cookie via context, do NOT require store id
    if (!isAuthenticated || !user?.id) {
      setLoading(true);
      try {
        addItem(product, 1);
        alert('Đã thêm vào giỏ hàng!');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Logged-in: need store id for backend cart API
    // Resolve store id: prefer from list item, fallback to product detail's first store
    let storeId = product.store?.id;
    if (!storeId) {
      try {
        const detail = await productApi.getProductById(String(product.id));
        const fallback = detail?.stores?.[0]?.store_id;
        if (fallback) {
          storeId = fallback;
        }
      } catch { }
    }
    if (!storeId) return alert('Cửa hàng không hợp lệ');

    setLoading(true);
    try {
      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: storeId,
        quantity: 1,
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch {
      alert('Không thể thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };


  // Use detail if available, else fallback to product
  const displayProduct = detail || product;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div
        className="relative aspect-[4/3] cursor-pointer"
        onClick={() => onViewDetails?.(product)}
      >
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="object-cover w-full h-full"
          width={400}
          height={300}
          priority
        />
        <button className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="p-5 text-left">
        <p className="text-sm text-black-500 mb-1">{product.category}</p>
        <h3 className="font-semibold text-2xl text-gray-900 mb-2">{product.name}</h3>

        {/* Giá sản phẩm với khuyến mãi */}
        <div className="flex items-center gap-2 mb-4">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-base text-gray-400 line-through font-semibold">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={`text-lg font-bold ${product.originalPrice && product.originalPrice > product.price ? 'text-red-600' : 'text-[#c4975a]'}`}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && product.discount && (
            <span className="ml-1">
              <style>{`
                /* Slightly smaller percent number and tighter arrows */
                .promo-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,77,79,0.08); color: inherit; padding: 2px 6px; border-radius: 9999px; font-weight: 700; font-size: 0.72rem; border: 1px solid rgba(255,77,79,0.14); }
                .three-arrows { display: inline-flex; flex-direction: column; gap: 0; align-items: center; justify-content: center; margin-left: 0; }
                .arrow { width: 11px; height: 11px; color: #ff4d4f; display: inline-block; }
                .arrow svg { width: 100%; height: 100%; display: block; }
                /* pull arrows even closer: use more negative top margin to overlap slightly */
                .arrow + .arrow { margin-top: -6px; }
                @keyframes arrowDrop1 { 0% { transform: translateY(-5px); opacity: 0; } 60% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(1px); opacity: 0.8; } }
                @keyframes arrowDrop2 { 0% { transform: translateY(-7px); opacity: 0; } 60% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(2px); opacity: 0.6; } }
                .arrow-1 { animation: arrowDrop1 1.2s ease-in-out infinite; }
                .arrow-2 { animation: arrowDrop2 1.2s ease-in-out 80ms infinite; }
                .promo-percent { color: #ff4d4f; position: relative; font-size: 0.86rem; font-weight: 800; padding: 0 2px; line-height: 1; }
              `}</style>

              <span className="promo-pill" role="status" aria-label={`Giảm ${Math.round(product.discount * 100)} phần trăm`}>
                <span className="promo-percent">{Math.round(product.discount * 100)}%</span>
                <span className="three-arrows" aria-hidden>
                  <span className="arrow arrow-1">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="arrow arrow-2">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddCartPopup}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 bg-[#e9d3b3] hover:bg-[#c4975a] rounded-lg disabled:opacity-50 transition"
            title="Thêm vào giỏ hàng"
            style={{ minWidth: '48px' }}
          >
            {loading ? (
              <span className="text-white text-base font-semibold">Đang thêm...</span>
            ) : (
              <span className="inline-block">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="6" width="20" height="14" rx="4" fill="#fff" stroke="#c4975a" strokeWidth="1.5" />
                  <path d="M7 10V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V10" stroke="#c4975a" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="9" cy="17" r="1.5" fill="#c4975a" />
                  <circle cx="15" cy="17" r="1.5" fill="#c4975a" />
                </svg>
              </span>
            )}
          </button>
          <button
            onClick={handleOrderNow}
            className="flex-1 py-3 bg-[#c4975a] hover:bg-[#a3764a] text-white rounded-lg text-base font-extrabold shadow transition-all tracking-wider"
          >
            Đặt hàng ngay
          </button>
        </div>
        <Modal isOpen={showOrderNow} onClose={() => setShowOrderNow(false)} title="Đặt hàng nhanh" size="full">
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="flex-shrink-0 w-full md:w-[300px] bg-[#faf7f2] p-6 rounded-2xl flex items-center justify-center">
              <Image
                src={displayProduct.images?.[0] || '/placeholder-product.jpg'}
                alt={displayProduct.name}
                className="aspect-square w-full max-w-[240px] rounded-2xl shadow-lg object-cover border border-[#f3e6d0]"
                width={280}
                height={280}
                priority
              />
            </div>

            <div className="flex-1 w-full p-6 md:p-8 flex flex-col justify-between min-h-[300px] bg-white rounded-2xl">
              {detailLoading ? (
                <div className="text-center py-12 text-lg text-gray-500">Đang tải chi tiết sản phẩm...</div>
              ) : detailError ? (
                <div className="text-center py-12 text-red-500">{detailError}</div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs rounded-full bg-[#f3e6d0] text-[#a3764a] font-semibold tracking-wide">{displayProduct.category || 'Gốm sứ'}</span>
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Còn hàng</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2C2A24] mb-2">{displayProduct.name}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      {displayProduct.originalPrice && displayProduct.originalPrice > displayProduct.price && (
                        <div className="text-sm text-gray-400 line-through font-semibold">{formatPrice(displayProduct.originalPrice)}</div>
                      )}
                      <div className="text-lg font-extrabold text-[#2C2A24]">{formatPrice(displayProduct.price)}</div>
                      {displayProduct.discount && (
                        <div className="text-sm text-[#a3764a]">Giảm {Math.round(displayProduct.discount * 100)}%</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="font-semibold mb-2 text-base text-[#a3764a]">Chọn cửa hàng</div>
                      <div className="space-y-2">
                        {stores.map((store) => (
                          <label key={store.store_id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedStoreId === store.store_id ? 'border-[#c4975a] bg-[#fdf7ee]' : 'border-gray-100 bg-white'}`}>
                            <input
                              type="radio"
                              name="store"
                              checked={selectedStoreId === store.store_id}
                              onChange={() => setSelectedStoreId(store.store_id)}
                              className="accent-[#c4975a]"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-base text-[#2C2A24]">{store.store_name || 'Cửa hàng'}</div>
                              <div className="text-sm text-gray-500">{store.store_address}</div>
                            </div>
                            <div className={`text-xs font-semibold ${store.quantity_stock > 0 ? 'text-green-600' : 'text-gray-400'}`}>{store.quantity_stock > 0 ? `Còn ${store.quantity_stock}` : 'Hết hàng'}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-semibold">Số lượng</span>
                      <div className="flex items-center border rounded-xl bg-white shadow-sm">
                        <button aria-label="Giảm" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-xl font-bold text-[#c4975a]">−</button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-20 text-center border-x outline-none text-base font-semibold"
                          min={1}
                        />
                        <button aria-label="Tăng" onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-xl font-bold text-[#c4975a]">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div className="text-sm text-gray-500">Tổng</div>
                      <div className="text-lg font-extrabold">{formatPrice((displayProduct.price || 0) * quantity)}</div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowOrderNow(false)}
                        className="px-5 py-2 border rounded-lg text-sm font-semibold bg-white hover:bg-[#fffaf5]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          const sel = stores.find((s) => s.store_id === selectedStoreId);
                          if (!sel || (sel.quantity_stock ?? 0) < quantity) return alert('Số lượng không đủ trong cửa hàng.');
                          handleOrderNowConfirm();
                        }}
                        className="px-6 py-2 bg-[#c4975a] hover:bg-[#a3764a] text-white rounded-lg font-bold"
                      >
                        Đặt hàng ngay
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
        {/* Popup thêm giỏ hàng, giống popup đặt hàng */}
        <Modal isOpen={showAddCart} onClose={() => setShowAddCart(false)} title="Thêm vào giỏ hàng" size="full">
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="flex-shrink-0 w-full md:w-[300px] bg-[#faf7f2] p-6 rounded-2xl flex items-center justify-center">
              <Image
                src={displayProduct.images?.[0] || '/placeholder-product.jpg'}
                alt={displayProduct.name}
                className="aspect-square w-full max-w-[240px] rounded-2xl shadow-lg object-cover border border-[#f3e6d0]"
                width={280}
                height={280}
                priority
              />
            </div>

            <div className="flex-1 w-full p-6 md:p-8 flex flex-col justify-between min-h-[300px] bg-white rounded-2xl">
              {detailLoading ? (
                <div className="text-center py-12 text-lg text-gray-500">Đang tải chi tiết sản phẩm...</div>
              ) : detailError ? (
                <div className="text-center py-12 text-red-500">{detailError}</div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs rounded-full bg-[#f3e6d0] text-[#a3764a] font-semibold tracking-wide">{displayProduct.category || 'Gốm sứ'}</span>
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Còn hàng</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2C2A24] mb-2">{displayProduct.name}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      {displayProduct.originalPrice && displayProduct.originalPrice > displayProduct.price && (
                        <div className="text-sm text-gray-400 line-through font-semibold">{formatPrice(displayProduct.originalPrice)}</div>
                      )}
                      <div className="text-lg font-extrabold text-[#2C2A24]">{formatPrice(displayProduct.price)}</div>
                      {displayProduct.discount && (
                        <div className="text-sm text-[#a3764a]">Giảm {Math.round(displayProduct.discount * 100)}%</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="font-semibold mb-2 text-base text-[#a3764a]">Chọn cửa hàng</div>
                      <div className="space-y-2">
                        {stores.map((store) => (
                          <label key={store.store_id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedStoreId === store.store_id ? 'border-[#c4975a] bg-[#fdf7ee]' : 'border-gray-100 bg-white'}`}>
                            <input
                              type="radio"
                              name="store"
                              checked={selectedStoreId === store.store_id}
                              onChange={() => setSelectedStoreId(store.store_id)}
                              className="accent-[#c4975a]"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-base text-[#2C2A24]">{store.store_name || 'Cửa hàng'}</div>
                              <div className="text-sm text-gray-500">{store.store_address}</div>
                            </div>
                            <div className={`text-xs font-semibold ${store.quantity_stock > 0 ? 'text-green-600' : 'text-gray-400'}`}>{store.quantity_stock > 0 ? `Còn ${store.quantity_stock}` : 'Hết hàng'}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-semibold">Số lượng</span>
                      <div className="flex items-center border rounded-xl bg-white shadow-sm">
                        <button aria-label="Giảm" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-xl font-bold text-[#c4975a]">−</button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-20 text-center border-x outline-none text-base font-semibold"
                          min={1}
                        />
                        <button aria-label="Tăng" onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-xl font-bold text-[#c4975a]">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div className="text-sm text-gray-500">Tổng</div>
                      <div className="text-lg font-extrabold">{formatPrice((displayProduct.price || 0) * quantity)}</div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAddCart(false)}
                        className="px-5 py-2 border rounded-lg text-sm font-semibold bg-white hover:bg-[#fffaf5]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddCartConfirm}
                        disabled={loading}
                        className="px-6 py-2 bg-[#c4975a] hover:bg-[#a3764a] text-white rounded-lg font-bold"
                      >
                        {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
