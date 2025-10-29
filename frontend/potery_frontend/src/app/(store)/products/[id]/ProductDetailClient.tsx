'use client';
import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { StoreSelectorClient } from './StoreSelectorClient';
import { ReviewsClient } from '../[id]/reviews-client';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';

interface Attribute {
  id: number;
  name: string;
}

interface StoreClassification {
  attribute1_id: number;
  attribute2_id: number;
  attribute1_name: string;
  attribute2_name: string;
  price: number;
  quantity_stock: number;
}

interface ProductStore {
  store_id: string; // Changed from number to string to match API
  store_name: string;
  store_address: string;
  quantity_stock: number;
  classifications: StoreClassification[];
}

interface ProductRelationship {
  id: number;
  product_attribute_id_1: number;
  product_attribute_id_2: number;
  price: string;
  quantity: number;
  attribute1_name: string;
  attribute2_name: string;
}

export function ProductDetailClient({ product }: { product: any }) {
  console.log('🔍 Product data:', product);
  console.log('🏪 Product stores:', product.stores);
  console.log('💰 Cheapest store:', product.cheapestStore);
  console.log('🏷️ Cheapest classification:', product.cheapestClassification);

  // Auto-select the cheapest store and classification from API
  const defaultStore = product.cheapestStore || product.stores?.find((s: ProductStore) => s.quantity_stock > 0);
  console.log('🎯 Default store:', defaultStore);

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(defaultStore?.store_id || null);
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/placeholder-product.jpg');

  const [quantity, setQuantity] = useState<number>(1);

  // Get attribute name from relationships
  const getAttributeName = (attributeId: number, type: 'attribute1' | 'attribute2') => {
    if (product.relationships && Array.isArray(product.relationships)) {
      const relationship = product.relationships.find((rel: ProductRelationship) => {
        if (type === 'attribute1') {
          return rel.product_attribute_id_1 === attributeId;
        } else {
          return rel.product_attribute_id_2 === attributeId;
        }
      });

      if (relationship) {
        return type === 'attribute1' ? relationship.attribute1_name : relationship.attribute2_name;
      }
    }
    return '';
  };

  // Auto-select cheapest classification if available
  const getInitialClassifications = () => {
    const defaultClassification = product.cheapestClassification;

    // If we have a default classification from the cheapest combo, use it
    if (defaultClassification) {
      return {
        attribute1_id: defaultClassification.attribute1_id || null,
        attribute2_id: defaultClassification.attribute2_id || null,
        attribute1_name: defaultClassification.attribute1_name || getAttributeName(defaultClassification.attribute1_id || 0, 'attribute1'),
        attribute2_name: defaultClassification.attribute2_name || getAttributeName(defaultClassification.attribute2_id || 0, 'attribute2')
      };
    }

    // Otherwise, try to find cheapest combo in default store
    if (defaultStore?.classifications && defaultStore.classifications.length > 0) {
      const availableClassifications = defaultStore.classifications.filter((c: StoreClassification) => c.quantity_stock > 0);
      if (availableClassifications.length > 0) {
        const cheapest = availableClassifications.reduce((cheapest: StoreClassification, current: StoreClassification) =>
          current.price < cheapest.price ? current : cheapest
        );

        return {
          attribute1_id: cheapest.attribute1_id || null,
          attribute2_id: cheapest.attribute2_id || null,
          attribute1_name: cheapest.attribute1_name || getAttributeName(cheapest.attribute1_id, 'attribute1'),
          attribute2_name: cheapest.attribute2_name || getAttributeName(cheapest.attribute2_id, 'attribute2')
        };
      }
    }

    // Fallback to empty state
    return {
      attribute1_id: null,
      attribute2_id: null,
      attribute1_name: '',
      attribute2_name: ''
    };
  };

  // Classification state - store selected classification combination
  const [selectedClassifications, setSelectedClassifications] = useState(getInitialClassifications());  // Get current store data
  const currentStore = product.stores?.find((s: ProductStore) => s.store_id === selectedStoreId);
  const storeClassifications = currentStore?.classifications || [];

  console.log('🏪 Current store:', currentStore);
  console.log('📦 Store classifications:', storeClassifications);

  // Get unique attributes and classification names from product.classifications
  const getUniqueAttributesAndNames = () => {
    let attribute1: Attribute[] = [];
    let attribute2: Attribute[] = [];
    let attribute1Name = 'Phân loại 1';
    let attribute2Name = 'Phân loại 2';

    if (product.classifications && Array.isArray(product.classifications)) {
      if (product.classifications[0]) {
        attribute1Name = product.classifications[0].name;
        attribute1 = product.classifications[0].attributes || [];
      }
      if (product.classifications[1]) {
        attribute2Name = product.classifications[1].name;
        attribute2 = product.classifications[1].attributes || [];
      }
    }
    return { attribute1, attribute2, attribute1Name, attribute2Name };
  };

  const { attribute1, attribute2, attribute1Name, attribute2Name } = getUniqueAttributesAndNames();

  console.log('🎨 Attribute1 (colors):', attribute1);
  console.log('📏 Attribute2 (sizes):', attribute2);

  // Find selected classification and its price
  const getSelectedClassificationData = () => {
    if (!selectedClassifications.attribute1_id || !selectedClassifications.attribute2_id) {
      return { price: product.price, quantity_stock: 0, originalPrice: product.price };
    }

    const selectedClassification = storeClassifications.find((c: StoreClassification) =>
      c.attribute1_id === selectedClassifications.attribute1_id &&
      c.attribute2_id === selectedClassifications.attribute2_id
    );

    if (selectedClassification) {
      const originalPrice = selectedClassification.price;
      let finalPrice = selectedClassification.price;

      // Apply promotion discount if exists
      if (product.promotion && product.promotion.discount_type && product.promotion.discount_value) {
        const discountValue = Number(product.promotion.discount_value);
        if (product.promotion.discount_type === 'PERCENTAGE') {
          finalPrice = originalPrice * (1 - discountValue / 100);
        } else if (product.promotion.discount_type === 'FIXED_AMOUNT') {
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

  const classificationData = getSelectedClassificationData();
  const currentPrice = classificationData.price;
  const comboOriginalPrice = classificationData.originalPrice;
  const currentStock = classificationData.quantity_stock;

  // Check if a specific attribute combination is available in current store
  const isAttributeAvailable = (attributeId: number, type: 'attribute1' | 'attribute2') => {
    if (!currentStore) return false;

    // For attribute1, check if there's any classification with this attribute1_id and any attribute2_id in current store
    if (type === 'attribute1') {
      return storeClassifications.some((c: StoreClassification) =>
        c.attribute1_id === attributeId && c.quantity_stock > 0
      );
    }

    // For attribute2, check if there's any classification with this attribute2_id and any attribute1_id in current store
    if (type === 'attribute2') {
      return storeClassifications.some((c: StoreClassification) =>
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

    setSelectedClassifications(prev => ({
      ...prev,
      [`${type}_id`]: attributeId,
      [`${type}_name`]: attributeName
    }));
  };

  // Calculate discount percentage only for real promotions (not for combo selection)
  const getDiscountPercentage = () => {
    // Only show discount if there's a real promotion (flash sale, promotion, etc.)
    if ((product.isFlashSale || product.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice) {
      return Math.round(((comboOriginalPrice - currentPrice) / comboOriginalPrice) * 100);
    }
    return 0;
  };

  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);

    // Find the new store
    const newStore = product.stores?.find((s: ProductStore) => s.store_id === storeId);
    if (!newStore) return;

    // Find the cheapest available combination in the new store
    const availableClassifications = newStore.classifications?.filter((c: StoreClassification) => c.quantity_stock > 0) || [];

    if (availableClassifications.length > 0) {
      // Sort by price to find cheapest
      const cheapestClassification = availableClassifications.reduce((cheapest: StoreClassification, current: StoreClassification) =>
        current.price < cheapest.price ? current : cheapest
      );

      // Auto-select the cheapest combination
      setSelectedClassifications({
        attribute1_id: cheapestClassification.attribute1_id,
        attribute2_id: cheapestClassification.attribute2_id,
        attribute1_name: cheapestClassification.attribute1_name || getAttributeName(cheapestClassification.attribute1_id, 'attribute1'),
        attribute2_name: cheapestClassification.attribute2_name || getAttributeName(cheapestClassification.attribute2_id, 'attribute2')
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
  const hasStores = product.stores && product.stores.length > 0;
  const isAvailable = product.stock > 0 && !!defaultStore;
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Gallery --- */}
        <div className="flex flex-col items-center">
          <div className="aspect-square bg-white rounded-2xl shadow overflow-hidden w-full">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {product.images.slice(0, 10).map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${mainImage === img
                    ? 'border-[#D4A017] scale-105 shadow-md'
                    : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Info --- */}
        <div className="space-y-6">
          {/* Tên và trạng thái */}
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-[#F5F1EB] text-[#65604E]">
                {product.category || 'Gốm sứ'}
              </span>
              {isAvailable ? (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Còn hàng
                </span>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                  Hết hàng
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24]">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(product.rating) ? '/star.png' : '/star-empti.png'}
                    alt="star"
                    className="w-4 h-4"
                  />
                ))}
              </div>
              <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
            </div>
          </div>

          {/* --- Price & mô tả --- */}
          <div className="p-5 rounded-2xl bg-white shadow space-y-5">
            <div className="flex items-baseline gap-3">
              {/* Only show original price and discount for real promotions */}
              {(product.isFlashSale || product.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(comboOriginalPrice)}
                </span>
              )}
              <span className={`text-3xl font-bold ${(product.isFlashSale || product.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                {formatPrice(currentPrice)}
              </span>
              {getDiscountPercentage() > 0 && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  -{getDiscountPercentage()}%
                </span>
              )}
              {product.isFlashSale && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  🔥 SALE
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {product.description || 'Sản phẩm gốm sứ chất lượng, chế tác thủ công tinh xảo.'}
            </p>

            {/* Product Classifications - Only show if current store has classifications */}
            {currentStore && storeClassifications.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                {/* Phân loại 1 */}
                {attribute1.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {attribute1Name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attribute1.map((attr: Attribute) => {
                        const isAvailable = isAttributeAvailable(attr.id, 'attribute1');
                        const isSelected = selectedClassifications.attribute1_id === attr.id;

                        return (
                          <button
                            key={attr.id}
                            onClick={() => handleClassificationChange('attribute1', attr.id, attr.name)}
                            disabled={!isAvailable}
                            className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
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
                      {attribute2.map((attr: Attribute) => {
                        const isAvailable = isAttributeAvailable(attr.id, 'attribute2');
                        const isSelected = selectedClassifications.attribute2_id === attr.id;

                        return (
                          <button
                            key={attr.id}
                            onClick={() => handleClassificationChange('attribute2', attr.id, attr.name)}
                            disabled={!isAvailable}
                            className={`px-3 py-2 text-sm border rounded-md transition-colors ${isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
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

            {hasStores && (
              <StoreSelectorClient
                stores={product.stores}
                initialStoreId={defaultStore?.store_id}
                onStoreChange={handleStoreChange}
              />
            )}

            {/* --- Chọn số lượng --- */}
            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium text-[#2C2A24]">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 text-center border-x outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* --- Thêm vào giỏ + Quay lại --- */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 min-h-[60px] sm:items-start">
              <div className="w-full sm:w-auto">
                <AddToCartClient
                  product={product}
                  storeId={selectedStoreId ?? undefined}
                  quantity={quantity}
                  selectedClassifications={{
                    attribute1_id: selectedClassifications.attribute1_id,
                    attribute2_id: selectedClassifications.attribute2_id,
                    attribute1_name: selectedClassifications.attribute1_name,
                    attribute2_name: selectedClassifications.attribute2_name
                  }}
                  currentPrice={currentPrice}
                  disabled={!isAvailable || (storeClassifications.length > 0 && currentStock === 0)}
                />
              </div>

              <a
                href="/products"
                className="px-6 py-3 border-2 border-[#65604E] text-[#65604E] rounded-lg hover:bg-[#F5F1EB] text-center w-full sm:w-auto flex-none"
              >
                Quay lại
              </a>
            </div>
          </div>
        </div>
      </div>

      <ReviewsClient
        productId={product.id}
        productRating={product.rating}
        productReviewCount={product.reviewCount}
      />
      {/* === Popup Layer === */}
      {isAuthenticated && user?.id && (
        <>
          {/* Voucher Modal */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-30">
              <VoucherModal
                customerId={user.id}
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
              />
            </div>
          )}

          {/* Chat Modal */}
          {isChatOpen && (
            <ChatModal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              userId={Number(user.id)}
              storeId={0}
              conversationId={conversationId}
            />
          )}

          {/* Floating Buttons */}
          <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col items-end gap-4 z-[100]">
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              🎁
            </button>

            {/* Chat Button */}
            <button
              onClick={async () => {
                if (!isAuthenticated || !user?.id) return;
                try {
                  console.log('%c💬 Tạo conversation trước khi mở chat...', 'color:deepskyblue');
                  const created = await conversationApi.createConversation({
                    sender_id: Number(user.id),
                    sender_type: 'USER',
                    content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                    user_id: Number(user.id),
                    store_id: 1,
                  });

                  const conv = created?.conversation || created?.data || created;
                  console.log('%c✅ Conversation created:', 'color:limegreen', conv);
                  setConversationId(conv?.id || null);
                  setIsChatOpen(true);
                } catch (err) {
                  console.error('❌ Lỗi tạo conversation:', err);
                }
              }}
              className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
              title="Chat với Admin"
            >
              💬
            </button>
          </div>
        </>
      )}

      <ScrollToTopButton />
    </div>
  );
}
