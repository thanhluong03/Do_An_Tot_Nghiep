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
import { reviewsApi } from '../../api/modules/reviews';

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
  // State for actual rating from reviews
  const [actualRating, setActualRating] = useState<number>(0);
  const [ratingLoaded, setRatingLoaded] = useState(false);
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
      quantity_stock: product.stock ?? 10,
      classifications: []
    }];

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Load actual rating from reviews
  React.useEffect(() => {
    let mounted = true;
    const loadActualRating = async () => {
      try {
        const reviews = await reviewsApi.list(String(product.id));
        if (mounted && Array.isArray(reviews) && reviews.length > 0) {
          const totalRating = reviews.reduce((sum: number, review) => sum + (review.rating || 0), 0);
          const averageRating = totalRating / reviews.length;
          setActualRating(averageRating);
        } else if (mounted) {
          setActualRating(0);
        }
        if (mounted) setRatingLoaded(true);
      } catch {
        if (mounted) {
          setActualRating(0);
          setRatingLoaded(true);
        }
      }
    };
    loadActualRating();
    return () => { mounted = false; };
  }, [product.id]);

  // Classification state for popup
  const [selectedClassifications, setSelectedClassifications] = useState<{
    attribute1_id: number | null;
    attribute2_id: number | null;
    attribute1_name: string;
    attribute2_name: string;
  }>({
    attribute1_id: null,
    attribute2_id: null,
    attribute1_name: '',
    attribute2_name: ''
  });

  // Get current store data
  const getCurrentStore = () => {
    return stores.find(s => s.store_id === selectedStoreId);
  };

  // Get unique attributes and classification names from detail
  const getUniqueAttributesAndNames = () => {
    let attribute1: Array<{ id: number; name: string }> = [];
    let attribute2: Array<{ id: number; name: string }> = [];
    let attribute1Name = 'Phân loại 1';
    let attribute2Name = 'Phân loại 2';

    if (detail?.classifications && Array.isArray(detail.classifications)) {
      if (detail.classifications[0]) {
        attribute1Name = detail.classifications[0].name;
        attribute1 = detail.classifications[0].attributes || [];
      }
      if (detail.classifications[1]) {
        attribute2Name = detail.classifications[1].name;
        attribute2 = detail.classifications[1].attributes || [];
      }
    }
    return { attribute1, attribute2, attribute1Name, attribute2Name };
  };

  // Find selected classification and its price
  const getSelectedClassificationData = () => {
    const currentStore = getCurrentStore();
    if (!currentStore || !selectedClassifications.attribute1_id || !selectedClassifications.attribute2_id) {
      return { price: product.price, quantity_stock: 0, originalPrice: product.price };
    }

    const selectedClassification = currentStore.classifications.find(c =>
      c.attribute1_id === selectedClassifications.attribute1_id &&
      c.attribute2_id === selectedClassifications.attribute2_id
    );

    if (selectedClassification) {
      const originalPrice = selectedClassification.price;
      let finalPrice = selectedClassification.price;

      // Apply promotion discount if exists
      if (detail?.promotion && detail.promotion.discount_type && detail.promotion.discount_value) {
        const discountValue = Number(detail.promotion.discount_value);
        if (detail.promotion.discount_type === 'PERCENTAGE') {
          finalPrice = originalPrice * (1 - discountValue / 100);
        } else if (detail.promotion.discount_type === 'FIXED_AMOUNT') {
          finalPrice = Math.max(0, originalPrice - discountValue);
        }
      }

      return {
        price: finalPrice,
        originalPrice: originalPrice,
        quantity_stock: selectedClassification.quantity_stock
      };
    }

    return { price: product.price, originalPrice: product.price, quantity_stock: 0 };
  };

  // Check if a specific attribute combination is available in current store
  const isAttributeAvailable = (attributeId: number, type: 'attribute1' | 'attribute2') => {
    const currentStore = getCurrentStore();
    if (!currentStore) return false;

    // For attribute1, check if there's any classification with this attribute1_id and any attribute2_id in current store
    if (type === 'attribute1') {
      return currentStore.classifications.some(c =>
        c.attribute1_id === attributeId && c.quantity_stock > 0
      );
    }

    // For attribute2, check if there's any classification with this attribute2_id and any attribute1_id in current store
    if (type === 'attribute2') {
      return currentStore.classifications.some(c =>
        c.attribute2_id === attributeId && c.quantity_stock > 0
      );
    }

    return false;
  };

  // Handle classification selection
  const handleClassificationChange = (type: 'attribute1' | 'attribute2', attributeId: number, attributeName: string) => {
    // Check if this selection is available
    if (!isAttributeAvailable(attributeId, type)) {
      return; // Don't allow selection of unavailable attributes
    }

    const newClassifications = {
      ...selectedClassifications,
      [`${type}_id`]: attributeId,
      [`${type}_name`]: attributeName
    };

    // If both attributes are selected, get names from relationships
    if (newClassifications.attribute1_id && newClassifications.attribute2_id) {
      const { attribute1_name, attribute2_name } = getAttributeNames(
        newClassifications.attribute1_id,
        newClassifications.attribute2_id
      );
      newClassifications.attribute1_name = attribute1_name;
      newClassifications.attribute2_name = attribute2_name;
    }

    setSelectedClassifications(newClassifications);
  };

  // Helper function to get attribute names from relationships
  const getAttributeNames = (attribute1_id: number | null, attribute2_id: number | null) => {
    if (!detail?.relationships || !attribute1_id || !attribute2_id) {
      return { attribute1_name: '', attribute2_name: '' };
    }

    const relationship = detail.relationships.find(r =>
      r.product_attribute_id_1 === attribute1_id && r.product_attribute_id_2 === attribute2_id
    );

    return {
      attribute1_name: relationship?.attribute1_name || '',
      attribute2_name: relationship?.attribute2_name || ''
    };
  };

  // Handle store change in popup
  const handleStoreChangeInPopup = (storeId: string) => {
    setSelectedStoreId(storeId);

    // Find the new store
    const newStore = stores.find(s => s.store_id === storeId);
    if (!newStore) return;

    // Find the cheapest available combination in the new store
    const availableClassifications = newStore.classifications?.filter(c => c.quantity_stock > 0) || [];

    if (availableClassifications.length > 0) {
      // Sort by price to find cheapest
      const cheapestClassification = availableClassifications.reduce((cheapest, current) =>
        current.price < cheapest.price ? current : cheapest
      );

      // Get names from relationships
      const { attribute1_name, attribute2_name } = getAttributeNames(
        cheapestClassification.attribute1_id,
        cheapestClassification.attribute2_id
      );

      // Auto-select the cheapest combination
      setSelectedClassifications({
        attribute1_id: cheapestClassification.attribute1_id,
        attribute2_id: cheapestClassification.attribute2_id,
        attribute1_name,
        attribute2_name
      });
    } else {
      // Reset classifications if no available combinations
      setSelectedClassifications({
        attribute1_id: null,
        attribute2_id: null,
        attribute1_name: '',
        attribute2_name: ''
      });
    }
  };
  // Fetch product detail when opening popup
  const fetchDetailForPopup = async () => {
    if (!detail && product.id) {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const fetched = await productApi.getProductById(String(product.id));
        setDetail(fetched);

        // Initialize with cheapest store and classification
        const defaultStore = fetched.cheapestStore || fetched.stores?.find(s => s.quantity_stock > 0) || fetched.stores?.[0];
        if (defaultStore) {
          setSelectedStoreId(defaultStore.store_id);

          // Initialize with cheapest classification if available
          if (fetched.cheapestClassification) {
            const { attribute1_name, attribute2_name } = getAttributeNames(
              fetched.cheapestClassification.attribute1_id,
              fetched.cheapestClassification.attribute2_id
            );
            setSelectedClassifications({
              attribute1_id: fetched.cheapestClassification.attribute1_id || null,
              attribute2_id: fetched.cheapestClassification.attribute2_id || null,
              attribute1_name,
              attribute2_name
            });
          } else if (defaultStore.classifications && defaultStore.classifications.length > 0) {
            // Find cheapest classification in default store
            const availableClassifications = defaultStore.classifications.filter(c => c.quantity_stock > 0);
            if (availableClassifications.length > 0) {
              const cheapest = availableClassifications.reduce((prev, current) =>
                current.price < prev.price ? current : prev
              );
              const { attribute1_name, attribute2_name } = getAttributeNames(
                cheapest.attribute1_id,
                cheapest.attribute2_id
              );
              setSelectedClassifications({
                attribute1_id: cheapest.attribute1_id,
                attribute2_id: cheapest.attribute2_id,
                attribute1_name,
                attribute2_name
              });
            }
          }
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
    // Check stock based on whether we have classifications
    let stockToCheck = 0;
    const currentStore = getCurrentStore();
    const classificationData = getSelectedClassificationData();
    const currentStock = classificationData.quantity_stock;
    const storeClassifications = currentStore?.classifications || [];

    // If there are classifications, check specific combo stock
    if (currentStore && storeClassifications.length > 0 && selectedClassifications.attribute1_id && selectedClassifications.attribute2_id) {
      stockToCheck = currentStock;
    } else {
      // Otherwise check general store stock
      const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
      stockToCheck = selectedStore?.quantity_stock ?? 0;
    }

    if (quantity > stockToCheck) {
      toast.error('Số lượng không đủ trong cửa hàng.');
      return;
    }

    // Build query params with classification info
    const queryParams = new URLSearchParams({
      productId: String(product.id),
      storeId: selectedStoreId || '',
      quantity: String(quantity),
      price: String(classificationData.price) // Add combo price
    });

    // Add classification info if available
    if (selectedClassifications.attribute1_id && selectedClassifications.attribute2_id) {
      // Get names from relationships instead of using selectedClassifications names
      const { attribute1_name, attribute2_name } = getAttributeNames(
        selectedClassifications.attribute1_id,
        selectedClassifications.attribute2_id
      );

      queryParams.append('attribute1_id', String(selectedClassifications.attribute1_id));
      queryParams.append('attribute2_id', String(selectedClassifications.attribute2_id));
      queryParams.append('attribute1_name', encodeURIComponent(attribute1_name));
      queryParams.append('attribute2_name', encodeURIComponent(attribute2_name));

      // Find classification ID
      const classificationId = storeClassifications.find(c =>
        c.attribute1_id === selectedClassifications.attribute1_id &&
        c.attribute2_id === selectedClassifications.attribute2_id
      )?.id;

      if (classificationId) {
        queryParams.append('classificationId', String(classificationId));
      }

      console.log('🏷️ Adding classification to URL:', {
        attribute1_id: selectedClassifications.attribute1_id,
        attribute2_id: selectedClassifications.attribute2_id,
        attribute1_name,
        attribute2_name,
        classificationId
      });
    } else {
      console.log('⚠️ No valid classifications selected:', selectedClassifications);
    }    // Redirect to checkout with all necessary info
    router.push(`/checkout?${queryParams.toString()}`);
  };

  const handleAddCartConfirm = async () => {
    // Find selected store's stock
    let stockToCheck = 0;
    const currentStore = getCurrentStore();
    const classificationData = getSelectedClassificationData();
    const currentStock = classificationData.quantity_stock;
    const storeClassifications = currentStore?.classifications || [];

    // If there are classifications, check specific combo stock
    if (currentStore && storeClassifications.length > 0 && selectedClassifications.attribute1_id && selectedClassifications.attribute2_id) {
      stockToCheck = currentStock;
    } else {
      // Otherwise check general store stock
      const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
      stockToCheck = selectedStore?.quantity_stock ?? 0;
    }

    if (quantity > stockToCheck) {
      toast.error('Số lượng không đủ trong cửa hàng.');
      return;
    }
    setLoading(true);
    try {
      if (!isAuthenticated || !user?.id) {
        // Create product with updated price for guest cart
        const productWithComboPrice = {
          ...product,
          price: classificationData.price, // Use combo price instead of original product price
          originalPrice: classificationData.originalPrice
        };

        // Pass classification info to cart only if there are valid classifications
        const hasValidClassifications = selectedClassifications.attribute1_id && selectedClassifications.attribute2_id;

        const classificationOptions = hasValidClassifications ? {
          storeId: selectedStoreId || undefined,
          classifications: {
            attribute1_id: selectedClassifications.attribute1_id,
            attribute2_id: selectedClassifications.attribute2_id,
            attribute1_name: selectedClassifications.attribute1_name,
            attribute2_name: selectedClassifications.attribute2_name
          },
          price: classificationData.price,
          classificationId: storeClassifications.find(c =>
            c.attribute1_id === selectedClassifications.attribute1_id &&
            c.attribute2_id === selectedClassifications.attribute2_id
          )?.id
        } : {
          storeId: selectedStoreId || undefined,
          price: classificationData.price
        };

        addItem(productWithComboPrice, quantity, classificationOptions);
        toast.success('Đã thêm vào giỏ hàng!');
      } else {
        await cartApi.add({
          customer_id: user.id,
          product_id: product.id,
          store_id: selectedStoreId || '',
          quantity,
          classification_attribute_relationship_id: storeClassifications.find(c =>
            c.attribute1_id === selectedClassifications.attribute1_id &&
            c.attribute2_id === selectedClassifications.attribute2_id
          )?.id || null,
        });
        if (window.reloadCartCount) {
          window.reloadCartCount();
        }
        toast.success('Đã thêm vào giỏ hàng!');
      }
      setShowAddCart(false);
    } catch {
      toast.error('Không thể thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  // Use detail if available, else fallback to product
  const displayProduct = detail || product;

  // Get current classification data for price display
  const classificationData = getSelectedClassificationData();
  const currentPrice = classificationData.price;
  const comboOriginalPrice = classificationData.originalPrice;
  const currentStock = classificationData.quantity_stock;

  // Get unique attributes
  const { attribute1, attribute2, attribute1Name, attribute2Name } = getUniqueAttributesAndNames();

  // Get current store
  const currentStore = getCurrentStore();
  const storeClassifications = currentStore?.classifications || [];

  // Calculate discount percentage for real promotions
  const getDiscountPercentage = () => {
    if ((detail?.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice) {
      return Math.round(((comboOriginalPrice - currentPrice) / comboOriginalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all h-fit">
      <div
        className="relative aspect-[3/3] cursor-pointer"
        onClick={() => onViewDetails?.(product)}
      >
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="object-cover w-full h-full"
          width={250}
          height={280}
          priority
        />
      </div>

      <div className="pt-3 pb-3 px-2 text-left">

        {/* 1. Category */}
        <p className="text-xs text-gray-500 mb-0.5">{product.category_name || 'Ly, Cốc'}</p>

        {/* 2. Product Name */}
        <p className="text-sm text-gray-900 mb-1 line-clamp-2 leading-tight h-9">
          {product.name}
        </p>

        {/* 3. Price Line */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 mb-1">
          <span className="text-sm font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          {/* Giá gốc thực tế: nếu có discount thì tính ngược lại từ giá khuyến mãi */}
          {product.discount && product.discount > 0 ?
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(Math.round(product.price / (1 - product.discount)))}
            </span>
            : null}
          {/* Badge phần trăm giảm giá nếu có khuyến mãi dạng phần trăm */}
          {product.discount && product.discount > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              -{Math.round(product.discount * 100)}%
            </span>
          )}
        </div>

        {/* 4. Rating/Sales Line (MỚI) */}
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <div className="flex items-center gap-0.5">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="font-medium text-gray-800">
              {ratingLoaded ? actualRating.toFixed(1) : (product.rating || 0).toFixed(1)}
            </span>
          </div>
          <span className="text-xs">Đã bán {product.total_quantity_sold ?? 0}</span>
        </div>

        {/* 5. Button Line */}
        <div className="flex gap-1">
          {/* === NÚT GIỎ HÀNG (ĐÃ SỬA) === */}
          <button
            onClick={handleAddCartPopup}
            className="flex items-center justify-center p-1.5 h-8 w-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            title="Thêm vào giỏ hàng"
          >
            <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </button>

          {/* === NÚT MUA NGAY (ĐÃ SỬA) === */}
          <button
            onClick={handleOrderNow}
            className="flex-1 h-8 bg-[#8D806F] hover:bg-[#7a6f61] text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
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
                      {/* Only show original price and discount for real promotions */}
                      {detail?.promotion && comboOriginalPrice && comboOriginalPrice > currentPrice && (
                        <div className="text-sm text-gray-400 line-through font-semibold">{formatPrice(comboOriginalPrice)}</div>
                      )}
                      <div className={`text-lg font-extrabold ${detail?.promotion && comboOriginalPrice && comboOriginalPrice > currentPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                        {formatPrice(currentPrice)}
                      </div>
                      {getDiscountPercentage() > 0 && (
                        <div className="text-sm text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-semibold">
                          -{getDiscountPercentage()}%
                        </div>
                      )}
                    </div>

                    {/* Product Classifications - Only show if current store has classifications */}
                    {currentStore && storeClassifications.length > 0 && (
                      <div className="space-y-4 border-t pt-4 mb-4">
                        {/* Phân loại 1 */}
                        {attribute1.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              {attribute1Name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {attribute1.map((attr) => {
                                const isAvailable = isAttributeAvailable(attr.id, 'attribute1');
                                const isSelected = selectedClassifications.attribute1_id === attr.id;

                                return (
                                  <button
                                    key={attr.id}
                                    onClick={() => handleClassificationChange('attribute1', attr.id, attr.name)}
                                    disabled={!isAvailable}
                                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                                      ? 'border-[#c4975a] bg-[#fdf7ee] text-[#c4975a]'
                                      : isAvailable
                                        ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    {attr.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Phân loại 2 */}
                        {attribute2.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              {attribute2Name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {attribute2.map((attr) => {
                                const isAvailable = isAttributeAvailable(attr.id, 'attribute2');
                                const isSelected = selectedClassifications.attribute2_id === attr.id;

                                return (
                                  <button
                                    key={attr.id}
                                    onClick={() => handleClassificationChange('attribute2', attr.id, attr.name)}
                                    disabled={!isAvailable}
                                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                                      ? 'border-[#c4975a] bg-[#fdf7ee] text-[#c4975a]'
                                      : isAvailable
                                        ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    {attr.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Show stock for selected combination */}
                        {selectedClassifications.attribute1_id && selectedClassifications.attribute2_id && (
                          <div className="text-sm text-gray-600">
                            Còn lại: <span className="font-medium text-gray-900">{currentStock}</span> sản phẩm
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="font-semibold mb-2 text-base text-[#a3764a]">Chọn cửa hàng</div>
                      <div className="space-y-2">
                        {stores.map((store) => (
                          <label key={store.store_id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedStoreId === store.store_id ? 'border-[#c4975a] bg-[#fdf7ee]' : 'border-gray-100 bg-white'}`}>
                            <input
                              type="radio"
                              name="store"
                              checked={selectedStoreId === store.store_id}
                              onChange={() => handleStoreChangeInPopup(store.store_id)}
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
                      <div className="text-lg font-extrabold">{formatPrice(currentPrice * quantity)}</div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowOrderNow(false)}
                        className="px-5 py-2 border rounded-lg text-sm font-semibold bg-white hover:bg-[#fffaf5]"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleOrderNowConfirm}
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
                      {/* Only show original price and discount for real promotions */}
                      {detail?.promotion && comboOriginalPrice && comboOriginalPrice > currentPrice && (
                        <div className="text-sm text-gray-400 line-through font-semibold">{formatPrice(comboOriginalPrice)}</div>
                      )}
                      <div className={`text-lg font-extrabold ${detail?.promotion && comboOriginalPrice && comboOriginalPrice > currentPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                        {formatPrice(currentPrice)}
                      </div>
                      {getDiscountPercentage() > 0 && (
                        <div className="text-sm text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-semibold">
                          -{getDiscountPercentage()}%
                        </div>
                      )}
                    </div>

                    {/* Product Classifications - Only show if current store has classifications */}
                    {currentStore && storeClassifications.length > 0 && (
                      <div className="space-y-4 border-t pt-4 mb-4">
                        {/* Phân loại 1 */}
                        {attribute1.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              {attribute1Name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {attribute1.map((attr) => {
                                const isAvailable = isAttributeAvailable(attr.id, 'attribute1');
                                const isSelected = selectedClassifications.attribute1_id === attr.id;

                                return (
                                  <button
                                    key={attr.id}
                                    onClick={() => handleClassificationChange('attribute1', attr.id, attr.name)}
                                    disabled={!isAvailable}
                                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                                      ? 'border-[#c4975a] bg-[#fdf7ee] text-[#c4975a]'
                                      : isAvailable
                                        ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    {attr.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Phân loại 2 */}
                        {attribute2.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              {attribute2Name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {attribute2.map((attr) => {
                                const isAvailable = isAttributeAvailable(attr.id, 'attribute2');
                                const isSelected = selectedClassifications.attribute2_id === attr.id;

                                return (
                                  <button
                                    key={attr.id}
                                    onClick={() => handleClassificationChange('attribute2', attr.id, attr.name)}
                                    disabled={!isAvailable}
                                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                                      ? 'border-[#c4975a] bg-[#fdf7ee] text-[#c4975a]'
                                      : isAvailable
                                        ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    {attr.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Show stock for selected combination */}
                        {selectedClassifications.attribute1_id && selectedClassifications.attribute2_id && (
                          <div className="text-sm text-gray-600">
                            Còn lại: <span className="font-medium text-gray-900">{currentStock}</span> sản phẩm
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="font-semibold mb-2 text-base text-[#a3764a]">Chọn cửa hàng</div>
                      <div className="space-y-2">
                        {stores.map((store) => (
                          <label key={store.store_id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedStoreId === store.store_id ? 'border-[#c4975a] bg-[#fdf7ee]' : 'border-gray-100 bg-white'}`}>
                            <input
                              type="radio"
                              name="store"
                              checked={selectedStoreId === store.store_id}
                              onChange={() => handleStoreChangeInPopup(store.store_id)}
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
                      <div className="text-lg font-extrabold">{formatPrice(currentPrice * quantity)}</div>
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