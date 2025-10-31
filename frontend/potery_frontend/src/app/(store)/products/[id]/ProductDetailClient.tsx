'use client';
import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { productApi } from '../../../../api/modules/products'; // Import productApi
// import { StoreSelectorClient } from './StoreSelectorClient'; // Đã thay thế bằng UI radio
import { ReviewsClient } from '../[id]/reviews-client';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // Import Link từ 'next/link'
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Archive
} from 'lucide-react'; // 👈 THÊM 1: Thêm các icon cam kết

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
  const ACCENT_COLOR = '#A67C52'; // Nâu Vàng Trầm (cho nút và giá tiền)
  const DARK_TEXT = 'text-gray-900';
  const LIGHT_TEXT = 'text-gray-500';
  const BG_COLOR = 'bg-gray-50'; // Nền trang nhẹ
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Lấy 4 sản phẩm gợi ý
        const { products: fetchedProducts } = await productApi.getProducts({ limit: 5 });
        // Loại bỏ sản phẩm hiện tại khỏi danh sách gợi ý và chỉ lấy 4 sản phẩm
        setRelatedProducts(fetchedProducts.filter(p => p.id !== product.id).slice(0, 4));
      } catch (err) {
        console.error('Không thể tải sản phẩm gợi ý:', err);
      }
    })();
  }, [product.id]);
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
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img: string, idx: number) => (
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
          {/* Breadcrumbs, Tên, Rating */}
          <div>
            <div className="text-sm text-gray-500 mb-1">{product.category || 'Chén, bát'}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24]">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{product.rating.toFixed(1)}</span>
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
              <span className="border-l pl-3">Đã bán {product.soldCount || 25}</span>
            </div>
          </div>

          {/* --- Box chứa Price, Variants, Store, Quantity, Buttons --- */}
          <div className="p-5 rounded-2xl bg-white shadow space-y-5">
            {/* Price */}
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
            </div>

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
              <div className="space-y-3">
                <label className="font-medium text-gray-800">Chọn cửa hàng còn hàng:</label>
                {product.stores.map((store: any) => (
                  <div
                    key={store.store_id}
                    onClick={() => handleStoreChange(store.store_id)}
                    className={`border p-3 rounded-lg cursor-pointer transition-all ${selectedStoreId === store.store_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="store"
                        value={store.store_id}
                        checked={selectedStoreId === store.store_id}
                        onChange={() => handleStoreChange(store.store_id)}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">{store.store_name}</div>
                        <div className="text-sm text-gray-600">{store.address}</div>
                        <div className="text-sm text-green-600">{store.quantity_stock} sản phẩm có sẵn</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Số lượng */}
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

            {/* Nút Mua Ngay và Giỏ hàng */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 min-h-[60px] sm:items-start">
              {/* Bạn cần style lại nút bên trong AddToCartClient để nó có màu nâu (#8B5E3C) */}
              <div className="w-full sm:flex-grow">
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

              <button
                className="w-full sm:w-auto flex-none px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-center"
                onClick={() => alert('Đã thêm vào giỏ hàng (logic demo)')}
                title="Thêm vào giỏ hàng"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 👇 SỬA 2: Di chuyển "4 Ô CAM KẾT" vào đây 
            Và thay đổi style để khớp với ảnh
          */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Item 1 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <Truck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Miễn phí vận chuyển</div>
                <div className="text-xs text-gray-600">Đơn hàng từ 400K</div>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Cam kết chất lượng</div>
                <div className="text-xs text-gray-600">Sản phẩm đạt chuẩn</div>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Đổi trả 7 ngày</div>
                <div className="text-xs text-gray-600">Chưa hài lòng</div>
              </div>
            </div>
            {/* Item 4 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Kiểm tra nhận hàng</div>
                <div className="text-xs text-gray-600">Nhận trước trả sau</div>
              </div>
            </div>
          </div>

        </div> {/* <-- Kết thúc của <div className="space-y-6"> */}
      </div> {/* <-- Kết thúc của <div className="grid grid-cols-1 lg:grid-cols-2"> */}

      {/* Các phần MÔ TẢ, ĐÁNH GIÁ, SẢN PHẨM LIÊN QUAN
        giờ sẽ nằm bên dưới 2 cột chính 
      */}

      {/* === MÔ TẢ SẢN PHẨM === */}
      <div className="bg-white rounded-2xl shadow p-6 md:p-8 my-10">
        <h2 className="text-2xl font-semibold text-[#2C2A24] mb-4">
          Mô tả sản phẩm
        </h2>
        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-3"
        >
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
          ) : (
            <p>Sản phẩm này hiện chưa có mô tả.</p>
          )}
        </div>
      </div>

      {/* === PHẦN ĐÁNH GIÁ === */}
      <ReviewsClient
        productId={product.id}
        productRating={product.rating}
        productReviewCount={product.reviewCount}
      />

      {/* === Popup Layer (Giữ nguyên) === */}
      {isAuthenticated && user?.id && (
        <>
          {/* (Code Modal và Nút bấm giữ nguyên) ... */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-30">
              <VoucherModal
                customerId={user.id}
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
              />
            </div>
          )}

          {isChatOpen && (
            <ChatModal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              userId={Number(user.id)}
              storeId={0}
              conversationId={conversationId}
            />
          )}

          <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col items-end gap-4 z-[100]">
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              🎁
            </button>

            <button
              onClick={async () => {
                if (!isAuthenticated || !user?.id) return;
                try {
                  console.log('%c💬 Tạo conversation...', 'color:deepskyblue');
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

      {/* Khối Sản phẩm liên quan (Giữ nguyên) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto mt-20 px-4 md:px-6 lg:px-8 bg-white rounded-2xl shadow-2xl shadow-gray-300/50 p-6 md:p-10">

          <h2 className={`text-2xl font-serif font-light mb-10 ${DARK_TEXT}`}>
            Sản phẩm liên quan
            <p className={`mt-3 text-sm text-gray-600`}>
              Khám phá thêm những sản phẩm gốm khác
            </p>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <RelatedProductCard key={p.id} p={p} ACCENT_COLOR={ACCENT_COLOR} DARK_TEXT={DARK_TEXT} />
            ))}
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// Component Card sản phẩm liên quan (Giữ nguyên)
function RelatedProductCard({ p, ACCENT_COLOR, DARK_TEXT }: { p: any, ACCENT_COLOR: string, DARK_TEXT: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-lg shadow-gray-100/50 hover:shadow-xl transition duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${p.id}`} className="cursor-pointer">
        <img
          src={p.images?.[0] || '/pott.jpg'}
          alt={p.name}
          className="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="mt-3 text-center">
        <Link
          href={`/products/${p.id}`}
          className={`font-medium ${DARK_TEXT} line-clamp-1 transition cursor-pointer`}
          style={{ color: isHovered ? ACCENT_COLOR : undefined }}
        >
          {p.name}
        </Link>
        <p
          className="font-bold text-lg mt-1 mb-3"
          style={{ color: ACCENT_COLOR }}
        >
          {formatPrice(p.price)}
        </p>
        <button
          className="w-full border text-sm font-medium py-2 rounded-lg transition"
          style={{
            borderColor: ACCENT_COLOR,
            color: isHovered ? '#FFFFFF' : ACCENT_COLOR,
            backgroundColor: isHovered ? ACCENT_COLOR : 'transparent',
          }}
          onClick={() => {
            alert(`Thêm sản phẩm ${p.name} vào giỏ hàng.`);
          }}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}