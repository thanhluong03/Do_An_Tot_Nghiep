'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { BaseLayout } from '../layouts';
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cartApi } from '../api/modules/cart';
import { Gift, MessageSquare, User, Bot } from 'lucide-react';
import { LifestyleSection } from '@/components/feature/LifestyleSection';
import {
  VoucherModal,
  HeroSection,
  AboutSection,
  FeaturedCollectionsSection,
  FeaturedProductSection,
  NewsletterSection,
  ChatModal,
  AIChatModal,
} from '@/components/feature';
import {
  ValuePropositionSection,
  TestimonialsSection,
  JournalSection,
} from '@/components/feature/ValueProppositionSection';
import { ScrollToTopButton } from '@/components/feature/ScrollToTopButton';
import { conversationApi } from '@/api/modules/conversation';

const VOUCHER_MODAL_SHOWN_KEY = 'voucher_modal_shown';

export default function HomePage() {
  const router = useRouter();
  const { products: featuredProducts } = useFeaturedProducts(8);
  const { categories } = useCategories();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false); // 1. Thêm state cho AI chat
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Hiển thị voucher modal 1 lần duy nhất cho mỗi user
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const userKey = `${VOUCHER_MODAL_SHOWN_KEY}_${user.id}`;
      const hasSeenModal = localStorage.getItem(userKey);
      if (!hasSeenModal) {
        setIsVoucherModalOpen(true);
        localStorage.setItem(userKey, 'true');
      }
    }
  }, [isAuthenticated, user?.id]);

  const handleAddToCart = async (product: Product) => {
    addItem(product, 1);
    if (isAuthenticated && user?.id) {
      try {
        setAddingId(product.id);
        const storeId = Array.isArray(product.store)
          ? (product.store[0]?.store_id ?? product.store[0]?.id ?? 1)
          : ((product.store as any)?.store_id ?? (product.store as any)?.id ?? 1);
        await cartApi.add({ customer_id: user.id, product_id: product.id, quantity: 1, store_id: storeId });
      } finally {
        setAddingId(null);
      }
    }
  };

  const handleViewDetails = (product: Product) => router.push(`/products/${product.id}`);
  const handleCategoryClick = (category: ProductCategory) => console.log('Category clicked:', category);

  return (
    <BaseLayout>
      {/* === Popup Layer === */}
      {isAuthenticated && user?.id && (
        <>
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
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${
              isChatDropdownOpen ? 'right-1' : 'right-1'
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

      <ScrollToTopButton />

      {/* === Content === */}
      <HeroSection />
      <AboutSection />
      <ValuePropositionSection />
      <FeaturedCollectionsSection />
      <FeaturedProductSection />
      <LifestyleSection />
      <TestimonialsSection />
      <JournalSection />
      <NewsletterSection />
    </BaseLayout>
  );
}
