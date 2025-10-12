'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { BaseLayout } from '../layouts';
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cartApi } from '../api/modules/cart';
import { LifestyleSection } from '@/components/feature/LifestyleSection';
import {
  VoucherModal,
  HeroSection,
  AboutSection,
  FeaturedCollectionsSection,
  FeaturedProductSection,
  CategorySection,
  ProductGrid,
  NewsletterSection,
  ChatModal
} from '@/components/feature';
import { ValuePropositionSection, TestimonialsSection, JournalSection } from '@/components/feature/ValueProppositionSection';
import { ScrollToTopButton } from '@/components/feature/ScrollToTopButton';

const VOUCHER_MODAL_SHOWN_KEY = 'voucher_modal_shown';

export default function HomePage() {
  const router = useRouter();
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts(8);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
              storeId={0}            />
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
              onClick={() => setIsChatOpen(prev => !prev)}
              className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
              title="Chat với Admin"
            >
              💬
            </button>
          </div>
        </>
      )}

      {/* Scroll to Top (luôn hiển thị riêng biệt) */}
      <ScrollToTopButton />

      {/* === Content === */}
      <HeroSection />
      <AboutSection />
      <ValuePropositionSection />
      <FeaturedCollectionsSection />
      <FeaturedProductSection />
      <LifestyleSection />

      <CategorySection
        categories={categories}
        loading={categoriesLoading}
        error={categoriesError}
        onCategoryClick={handleCategoryClick}
      />

      {/* Featured Products Section */}
      <section className="py-20 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-xl text-[#65604E] max-w-3xl mx-auto leading-relaxed">
              Những tác phẩm gốm sứ được yêu thích nhất, được chọn lọc kỹ lưỡng từ các nghệ nhân tài hoa
            </p>
          </div>

          <ProductGrid
            products={featuredProducts}
            loading={featuredLoading}
            error={featuredError}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            columns={4}
          />

          <div className="text-center mt-16 flex items-center justify-center gap-4">
            <a
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-[#65604E] text-white font-semibold rounded-lg hover:bg-[#3D3A2F] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Xem Tất Cả Sản Phẩm
              <img src="/pott.jpg" alt="arrow" className="ml-2 w-4 h-4" />
            </a>
            <a
              href="/cart"
              className="inline-flex items-center px-6 py-4 border-2 border-[#65604E] text-[#65604E] font-semibold rounded-lg hover:bg-[#F5F1EB] transition-colors duration-200"
            >
              Đi tới Giỏ Hàng
            </a>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <JournalSection />
      <NewsletterSection />
    </BaseLayout>
  );
}
