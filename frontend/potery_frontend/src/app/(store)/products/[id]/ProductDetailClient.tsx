'use client';

import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { StoreSelectorClient } from './StoreSelectorClient';
import { ReviewsClient } from '../[id]/reviews-client';

export function ProductDetailClient({ product }: { product: any }) {
  const defaultStore = product.stores.find((s: any) => s.quantity_stock > 0);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(defaultStore?.store_id || null);
const handleStoreChange = (storeId: number) => setSelectedStoreId(storeId);

  const hasStores = product.stores && product.stores.length > 0;
  const isAvailable = product.stock > 0 && !!defaultStore;
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/placeholder-product.jpg');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Gallery --- */}
        <div className="flex flex-col items-center">
          {/* Ảnh chính */}
          <div className="aspect-square bg-white rounded-2xl shadow overflow-hidden w-full">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnail ảnh nhỏ */}
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {product.images.slice(0, 10).map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    mainImage === img
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

          {/* --- Price --- */}
          <div className="p-5 rounded-2xl bg-white shadow space-y-5">
            <div className="flex items-baseline gap-3">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span
                className={`text-3xl font-bold ${
                  product.originalPrice ? 'text-red-600' : 'text-[#2C2A24]'
                }`}
              >
                {formatPrice(product.price)}
              </span>
              {product.isFlashSale && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  🔥 SALE
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {product.description ||
                'Sản phẩm gốm sứ chất lượng, chế tác thủ công tinh xảo.'}
            </p>

            {hasStores && (
              <StoreSelectorClient
                stores={product.stores}
                initialStoreId={defaultStore?.store_id}
                onStoreChange={handleStoreChange}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-3 min-h-[60px] sm:items-start"> {/* SỬA items-center thành items-start */}
  
  {/* Wrapper cho AddToCartClient: Đặt w-full sm:w-auto để kiểm soát độ rộng */}
  <div className="w-full sm:w-auto"> 
    <AddToCartClient
      product={product}
      storeId={selectedStoreId ?? undefined}
      disabled={!isAvailable}
    />
  </div>
  
  {/* Nút Quay lại: Đặt w-full sm:w-auto và flex-none */}
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

      {/* --- Reviews --- */}
      <ReviewsClient
        productId={product.id}
        productRating={product.rating}
        productReviewCount={product.reviewCount}
      />
    </div>
  );
}
