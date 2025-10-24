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
import toast from 'react-hot-toast';

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
      toast.error('Số lượng không đủ trong cửa hàng.');
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
      toast.error('Số lượng không đủ trong cửa hàng.');
      return;
    }
    setLoading(true);
    try {
      if (!isAuthenticated || !user?.id) {
        addItem(product, quantity);
        toast.success('Đã thêm vào giỏ hàng!');
      } else {
        await cartApi.add({
          customer_id: user.id,
          product_id: product.id,
          store_id: selectedStoreId || '',
          quantity,
        });
        toast.success('Đã thêm vào giỏ hàng!');
      }
      setShowAddCart(false);
    } catch {
      toast.error('Không thể thêm sản phẩm.');
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
        toast.success('Đã thêm vào giỏ hàng!');
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
    if (!storeId) return toast.error('Cửa hàng không hợp lệ');

    setLoading(true);
    try {
      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: storeId,
        quantity: 1,
      });
      toast.success('Đã thêm vào giỏ hàng!');
    } catch {
      toast.error('Không thể thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };


  // Use detail if available, else fallback to product
  const displayProduct = detail || product;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div
        className="relative aspect-square cursor-pointer" // Gần với ảnh hơn
        onClick={() => onViewDetails?.(product)}
      >
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="object-cover w-full h-full"
          width={400}
          height={400} // Cập nhật để khớp aspect-square
          priority
        />
        {/* Đã xóa nút checkmark/trái tim ở góc trên bên phải để khớp với ảnh */}
      </div>

      <div className="p-4 text-left"> 
        
        {/* 1. Category */}
        <p className="text-sm text-gray-500 mb-1">{product.category_name|| 'Ly, Cốc'}</p>
        
        {/* 2. Product Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
          {product.name}
        </h3>

        {/* 3. Price Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          {/* Current Price */}
          <span className="text-xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          
          {/* Original Price */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          
          {/* === THAY THẾ PILL GIẢM GIÁ === */}
          {product.originalPrice && product.originalPrice > product.price && product.discount && (
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              Giảm {Math.round(product.discount * 100)}%
            </span>
          )}
          {/* === KẾT THÚC THAY THẾ === */}
        </div>

        {/* 4. Rating/Sales Line (MỚI) */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span> 
            <span className="font-medium text-gray-800">{product.rating || '5.0'}</span>
          </div>
          <span>Đã bán {product.total_quantity_sold ?? 0}</span>
        </div>

        {/* 5. Button Line */}
        <div className="flex gap-3">
          {/* === NÚT GIỎ HÀNG (ĐÃ SỬA) === */}
          <button
            onClick={handleAddCartPopup}
            className="flex items-center justify-center p-3 h-12 w-12 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
            title="Thêm vào giỏ hàng"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </button>
          
          {/* === NÚT MUA NGAY (ĐÃ SỬA) === */}
          <button
            onClick={handleOrderNow}
            className="flex-1 h-12 bg-[#8D806F] hover:bg-[#7a6f61] text-white rounded-lg text-base font-semibold shadow transition-all"
          >
            Mua Ngay
          </button>
        </div>

        {/* === PHẦN MODAL (POPUP) GIỮ NGUYÊN === */}
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
                          title='number'
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
                          if (!sel || (sel.quantity_stock ?? 0) < quantity) return toast.error('Hết hàng trong cửa hàng đã chọn.');
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
                          title='number'
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