'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from './add-to-cart-client';
import { productApi } from '../../../../api/modules/products';
import { cartApi } from '../../../../api/modules/cart';
// import { StoreSelectorClient } from './StoreSelectorClient'; // Đã thay thế bằng UI radio
import { ReviewsClient } from './reviews-client';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton, AIChatModal } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // Import Link từ 'next/link'
import { Bot, Gift, MessageSquare, User } from 'lucide-react';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Archive,
  Minus, Plus,
  ArrowLeft
} from 'lucide-react'; // 👈 THÊM 1: Thêm các icon cam kết
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/dist/client/components/navigation';

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const DESCRIPTION_MAX_LENGTH = 500;
  const descriptionText = product.description || '';
  const isLongDescription = descriptionText.length > DESCRIPTION_MAX_LENGTH;
  const descriptionRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Auto-select the cheapest store and classification from API
  const defaultStore = product.cheapestStore || product.stores?.find((s: ProductStore) => s.quantity_stock > 0);
  console.log('🎯 Default store:', defaultStore);

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(defaultStore?.store_id || null);
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/placeholder-product.jpg');

  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const { addItem } = useCart();

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

  const handleAdd = async () => {
    const disabled = !isAvailable || (storeClassifications.length > 0 && currentStock === 0);
    if (disabled) return;

    // Guest: save to cookie via context (no store requirement)
    if (!isAuthenticated || !user?.id) {
      setLoading(true);
      try {
        // Pass classification data to guest cart
        addItem(product, quantity, {
          storeId: selectedStoreId ?? undefined,
          classifications: selectedClassifications && (selectedClassifications.attribute1_id || selectedClassifications.attribute2_id) ? {
            attribute1_id: selectedClassifications.attribute1_id,
            attribute2_id: selectedClassifications.attribute2_id,
            attribute1_name: selectedClassifications.attribute1_name,
            attribute2_name: selectedClassifications.attribute2_name
          } : undefined,
          price: currentPrice || product.price
        });
        toast.success(`Đã thêm vào giỏ hàng!`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Logged-in: yêu cầu chọn cửa hàng
    if (!selectedStoreId) {
      toast.error('Vui lòng chọn cửa hàng trước khi thêm vào giỏ hàng');
      return;
    }

    setLoading(true);
    postMessage(null);

    try {
      // Find classification_attribute_relationship_id based on selected classifications
      let classificationId = null;
      if (selectedClassifications && product.stores) {
        const selectedStore = product.stores.find((store: ProductStore) => store.store_id === selectedStoreId);
        if (selectedStore && selectedStore.classifications) {
          const matchingClassification = selectedStore.classifications.find(
            (classification: StoreClassification) =>
              classification.attribute1_id === selectedClassifications.attribute1_id &&
              classification.attribute2_id === selectedClassifications.attribute2_id
          );
          if (matchingClassification) {
            // @ts-ignore
            classificationId = matchingClassification.id || null;
          }
        }
      }

      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: Number(selectedStoreId),
        quantity,
        classification_attribute_relationship_id: classificationId,
      });
      if (window.reloadCartCount) {
        window.reloadCartCount();
      }
      toast.success(`Đã thêm vào giỏ hàng!`);
    } catch (e) {
      console.error(e);
      const error = e as Error;
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };
  const [reviewStats, setReviewStats] = useState<{ average: number; count: number }>({ average: product.rating, count: product.reviewCount });
  const handleReviewStatsUpdate = (average: number, count: number) => {
    setReviewStats({ average, count });
  };
  const renderStars = (averageRating: number, size = 16) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          let starType: 'full' | 'half' | 'quarter' | 'empty' = 'empty';
          const fullStars = Math.floor(averageRating);
          const decimal = averageRating - fullStars;
          if (i < fullStars) {
            starType = 'full';
          } else if (i === fullStars) {
            if (decimal >= 0.8) starType = 'full';
            else if (decimal >= 0.5) starType = 'half';
            else if (decimal >= 0.1) starType = 'quarter';
            else starType = 'empty';
          } else {
            starType = 'empty';
          }
          if (starType === 'half') {
            return (
              <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <defs>
                  <linearGradient id={`half-star-${i}`} x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="50%" stopColor="#ffdc7bff" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill={`url(#half-star-${i})`}
                  stroke="#ffdc7bff"
                  strokeWidth={1.25}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            );
          }
          if (starType === 'quarter') {
            return (
              <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <defs>
                  <linearGradient id={`quarter-star-${i}`} x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="25%" stopColor="#ffdc7bff" />
                    <stop offset="25%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill={`url(#quarter-star-${i})`}
                  stroke="#ffdc7bff"
                  strokeWidth={1.25}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            );
          }
          // Full or empty star
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={starType === 'full' ? '#ffdc7bff' : 'transparent'}
                stroke="#ffdc7bff"
                strokeWidth={1.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <div className="product-detail-page relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <button
        onClick={() => router.back()}
        aria-label="Quay lại"
        className="absolute top-3 sm:top-4 -left-5 sm:-left-8 z-20 w-12 h-12 flex items-center justify-center rounded-full border border-[#F0D9BF] bg-white text-[#D67F2A] shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="mt-4 grid grid-cols-4 gap-3 w-full">
              {product.images.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`overflow-hidden cursor-pointer transition-all duration-200 rounded-lg ${mainImage === img
                    ? 'border-2 border-[#D4A017] scale-105 shadow-md'
                    : 'border border-transparent hover:border-gray-200'
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Info --- */}
        <div className="space-y-4 bg-white pt-2 pb-4 px-4 rounded-2xl shadow">
          {/* Breadcrumbs, Tên, Rating */}
          <div>
            <div className="text-sm text-gray-500 mb-1">
              <span className="inline-block bg-[#F3F5EF] text-[#7E735E] px-3 py-1 rounded-full text-sm font-medium">{product.category_name || 'Chén, bát'}</span>
            </div>
            <h1 className="text-base md:text-2xl font-semibold text-[#2C2A24] leading-tight">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-800">{reviewStats.average.toFixed(1)}</span>
                {renderStars(reviewStats.average, 16)}
              </div>
              <span className="h-5 w-px bg-gray-300 mx-2 inline-block" />
              <div className="text-sm text-gray-600">Đã bán: <span className="font-medium text-gray-800">{product.total_quantity_sold || 25}</span></div>
            </div>
          </div>

          {/* --- Box chứa Price, Variants, Store, Quantity, Buttons --- */}
          <div className="rounded-2xl bg-white space-y-3">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`text-2xl font-bold ${(product.isFlashSale || product.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice ? 'text-[#ff2d2d]' : 'text-[#2C2A24]'}`}>
                {formatPrice(currentPrice)}
              </span>
              {(product.isFlashSale || product.promotion) && comboOriginalPrice && comboOriginalPrice > currentPrice && (
                <span className="text-1xl text-gray-400 line-through ml-2">
                  {formatPrice(comboOriginalPrice)}
                </span>
              )}
              {getDiscountPercentage() > 0 && (
                <span className="text-xs font-medium text-[#FB2C36] bg-[#FEF2F2] px-3 py-1 rounded-[8px] border border-[#ffdce0] ml-3">
                  -{getDiscountPercentage()}%
                </span>
              )}
            </div>

            {/* Product Classifications - Only show if current store has classifications */}
            {currentStore && storeClassifications.length > 0 && (
              <div className="space-y-2">
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
                            className={`px-10 py-2 text-sm rounded-[10px] transition-all border ${isSelected
                              ? 'border-[#968A71] bg-[#fff8ec] text-[#8B5E3C] shadow-sm'
                              : isAvailable
                                ? 'border-[#E9E0D3] text-[#8B7D6B] bg-white hover:shadow-sm hover:border-[#D9CDBA]'
                                : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                              }`}
                            style={{ boxShadow: isSelected ? '0 2px 6px rgba(212,160,23,0.12)' : undefined }}
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
                            className={`px-10 py-2 text-sm rounded-[10px] transition-all border ${isSelected
                              ? 'border-[#968A71] bg-[#fff8ec] text-[#8B5E3C] shadow-sm'
                              : isAvailable
                                ? 'border-[#E9E0D3] text-[#8B7D6B] bg-white hover:shadow-sm hover:border-[#D9CDBA]'
                                : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                              }`}
                            style={{ boxShadow: isSelected ? '0 2px 6px rgba(212,160,23,0.12)' : undefined }}
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
              <div className="space-y-2">
                <label className="font-semibold text-gray-800 text-base tracking-wide mb-3">
                  Chọn cửa hàng còn hàng
                </label>

                <div className="mt-2 space-y-2">
                  {product.stores.map((store: any) => (
                    <div
                      key={store.store_id}
                      onClick={() => handleStoreChange(store.store_id)}
                      className={`rounded-xl pt-2 pl-4 pr-4 pb-2 cursor-pointer transition-all duration-200 flex items-center gap-3 shadow-sm border ${selectedStoreId === store.store_id ? 'border-[#D4A017] bg-white ring-1 ring-[#FFF3E0]' : 'border-gray-200 bg-white hover:shadow-md'}`}
                    >
                      {/* Radio Button (custom UI) */}
                      <input
                        title='store'
                        type="radio"
                        name="store"
                        value={store.store_id}
                        checked={selectedStoreId === store.store_id}
                        onChange={() => handleStoreChange(store.store_id)}
                        className="sr-only"
                      />
                      <span className="flex-shrink-0 flex items-center">
                        <span className={`flex items-center justify-center w-4 h-4 rounded-full border ${selectedStoreId === store.store_id ? 'border-blue-500' : 'border-gray-300'}`}>
                          {selectedStoreId === store.store_id ? <span className="w-2 h-2 bg-blue-500 rounded-full" /> : null}
                        </span>
                      </span>

                      {/* Nội dung cửa hàng */}
                      <div>
                        <div className={`font-medium text-lg sm:text-base ${selectedStoreId === store.store_id ? 'text-[#D67F2A]' : 'text-gray-900'}`}>
                          {store.store_name}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{store.address || store.store_address}</div>
                        <div
                          className={`text-sm font-medium mt-1 ${store.quantity_stock > 0 ? 'text-green-600' : 'text-red-500'
                            }`}
                        >
                          {store.quantity_stock > 0
                            ? `${store.quantity_stock} sản phẩm có sẵn`
                            : 'Hết hàng'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            )}

            {/* Số lượng */}
            <div className="flex items-center gap-5 mt-5">
              <span className="font-semibold text-gray-800 text-base tracking-wide">Số lượng:</span>

              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white transition-all duration-200 hover:shadow-md">
                {/* Nút giảm */}
                <button
                  title='minus'
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                >
                  <Minus className="w-5 h-5" />
                </button>

                {/* Ô nhập số */}
                <input
                  title='numer'
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]+$/.test(val)) {
                      setQuantity(val === '' ? '' : Number(val));
                    }
                  }}
                  onBlur={(e) => {
                    let val = Number(e.target.value);
                    if (isNaN(val) || val < 1) val = 1;
                    setQuantity(val);
                  }}
                  className="w-20 text-center text-gray-800 font-medium border-x border-gray-200 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  min={1}
                />

                {/* Nút tăng */}
                <button
                  title='plus'
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 text-right">
                {storeClassifications.length > 0 && quantity > currentStock ? (
                  <div className="text-sm text-red-600">Số lượng sản phẩm của cửa hàng không đủ</div>
                ) : null}
              </div>

              {/* Disable buttons if not enough stock */}
              {storeClassifications.length > 0 && quantity > currentStock && (
                <style>{`
                .product-detail-page .disable-on-stock {
                  pointer-events: none;
                  opacity: 0.5;
                  cursor: not-allowed;
                }
              `}</style>
              )}
            </div>


            {/* Nút Mua Ngay và Giỏ hàng */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 min-h-[60px] sm:items-start">
              {/* Bạn cần style lại nút bên trong AddToCartClient để nó có màu nâu (#8B5E3C) */}
              <div className={`w-full sm:flex-grow ${(storeClassifications.length > 0 && quantity > currentStock) ? 'disable-on-stock' : ''}`}>
                <AddToCartClient
                  product={product as any}
                  storeId={selectedStoreId ?? undefined}
                  quantity={quantity}
                  selectedClassifications={{
                    attribute1_id: selectedClassifications.attribute1_id,
                    attribute2_id: selectedClassifications.attribute2_id,
                    attribute1_name: selectedClassifications.attribute1_name,
                    attribute2_name: selectedClassifications.attribute2_name
                  }}
                  currentPrice={currentPrice}
                  disabled={!isAvailable || (storeClassifications.length > 0 && currentStock === 0) || (storeClassifications.length > 0 && quantity > currentStock)}
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!isAvailable || (storeClassifications.length > 0 && currentStock === 0) || loading || (storeClassifications.length > 0 && quantity > currentStock)}
                className={`w-12 h-12 sm:w-12 sm:h-12 flex-none px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 flex items-center justify-center ${(storeClassifications.length > 0 && quantity > currentStock) ? 'disable-on-stock' : ''}`}
                title="Thêm vào giỏ hàng"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 👇 SỬA 2: Di chuyển "4 Ô CAM KẾT" vào đây 
            Và thay đổi style để khớp với ảnh
          */}
          <div className="grid grid-cols-2 gap-4 mt-3 bg-white p-4 rounded-2xl">
            {/* Item 1 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-[#fff8ec] rounded-full p-2 mr-3 border border-[#F0E3C9]">
                <Truck className="w-5 h-5 text-[#9a7a44]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Miễn phí vận chuyển</div>
                <div className="text-xs text-gray-600">Đơn hàng từ 400K</div>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-[#eef7f0] rounded-full p-2 mr-3 border border-[#e6f2e6]">
                <ShieldCheck className="w-5 h-5 text-[#2f8a49]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Cam kết chất lượng</div>
                <div className="text-xs text-gray-600">Sản phẩm đạt chuẩn</div>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-[#fff4f6] rounded-full p-2 mr-3 border border-[#fde8ef]">
                <RefreshCw className="w-5 h-5 text-[#c85b6a]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Đổi trả 7 ngày</div>
                <div className="text-xs text-gray-600">Chưa hài lòng</div>
              </div>
            </div>
            {/* Item 4 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-[#f0f7ff] rounded-full p-2 mr-3 border border-[#e6f0ff]">
                <Archive className="w-5 h-5 text-[#336fae]" />
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
      <div className="bg-white rounded-2xl shadow md:p-5" ref={descriptionRef}>
        <h2 className="text-2xl font-semibold text-[#2C2A24] mb-4">
          Mô tả sản phẩm
        </h2>
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-3 relative">
          {descriptionText ? (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: showFullDescription || !isLongDescription
                    ? descriptionText.replace(/\n/g, '<br />')
                    : descriptionText.slice(0, DESCRIPTION_MAX_LENGTH).replace(/\n/g, '<br />') + '...'
                }}
              />
              {isLongDescription && (
                <div className="flex justify-end">
                  <button
                    className="mt-3 px-4 py-2 bg-[#F3F5EF] text-[#7E735E] rounded-lg text-sm font-medium hover:bg-[#e6e3d6] transition"
                    onClick={() => {
                      if (showFullDescription && descriptionRef.current) {
                        descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                      setShowFullDescription((prev) => !prev);
                    }}
                  >
                    {showFullDescription ? 'Ẩn bớt' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </>
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
        onStatsChange={handleReviewStatsUpdate}
      />

      {/* === Popup Layer (Giữ nguyên) === */}
      {isAuthenticated && user?.id && (
        <>
          {/* (Code Modal và Nút bấm giữ nguyên) ... */}
          {/* Voucher Modal */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/10">
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
              conversationId={conversationId} // ✅ truyền id xuống
            />
          )}

          {/* AI Chat Modal */}
          <AIChatModal
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
          />

          {/* Floating Buttons */}
          <div
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${isChatDropdownOpen ? 'right-1' : 'right-1'
              }`}
          >
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              <Gift className="w-6 h-6" />
            </button>

            {/* Chat Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChatDropdownOpen(prev => !prev)}
                className="bg-[#8B7D6B] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                title="Bắt đầu trò chuyện"
              >
                <MessageSquare className="w-6 h-6" />
              </button>

              {isChatDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 flex flex-col gap-3 transition-all duration-300 ease-out transform origin-top-right">
                  {/* Nút Chat với Admin */}
                  <div className="relative group">
                    <button
                      onClick={async () => {
                        if (!isAuthenticated || !user?.id) return;
                        try {
                          const created = await conversationApi.createConversation({
                            sender_id: Number(user.id),
                            sender_type: 'USER',
                            content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                            user_id: Number(user.id),
                            store_id: 1,
                          });
                          const conv = created?.conversation || created?.data || created;
                          setConversationId(conv?.id || null);
                          setIsChatOpen(true);
                          setIsChatDropdownOpen(false);
                        } catch (err) {
                          console.error('❌ Lỗi tạo conversation:', err);
                        }
                      }}
                      className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với Admin"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Nút Chat với AI */}
                  <div className="relative group">
                    <button
                      onClick={() => {
                        setIsAIChatOpen(true); // 2. Mở popup AI chat
                        setIsChatDropdownOpen(false);
                      }}
                      className="bg-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với AI"
                    >
                      <Bot className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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