'use client';
import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { StoreSelectorClient } from './StoreSelectorClient';
import { ReviewsClient } from '../[id]/reviews-client';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';

export function ProductDetailClient({ product }: { product: any }) {
  const defaultStore = product.stores.find((s: any) => s.quantity_stock > 0);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(defaultStore?.store_id || null);
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/placeholder-product.jpg');

  const [quantity, setQuantity] = useState<number>(1); // ✅ thêm

  const handleStoreChange = (storeId: number) => setSelectedStoreId(storeId);
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
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className={`text-3xl font-bold ${product.originalPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                {formatPrice(product.price)}
              </span>
              {product.isFlashSale && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  🔥 SALE
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {product.description || 'Sản phẩm gốm sứ chất lượng, chế tác thủ công tinh xảo.'}
            </p>

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
                  quantity={quantity} // ✅ truyền thêm số lượng
                  disabled={!isAvailable}
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
