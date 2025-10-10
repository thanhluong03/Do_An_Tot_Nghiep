// pages/index.js
'use client';

import React, { useState, useEffect } from 'react'; // Import useState và useEffect
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { BaseLayout } from '../layouts';
// ... (Các imports khác giữ nguyên)
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cartApi } from '../api/modules/cart';
import { LifestyleSection } from '@/components/feature/LifestyleSection';
import { VoucherModal,HeroSection, AboutSection, FeaturedCollectionsSection, FeaturedProductSection, CategorySection, FlashSaleSection, ProductGrid, NewsletterSection } from '@/components/feature';
import { ValuePropositionSection, TestimonialsSection, JournalSection } from '@/components/feature/ValueProppositionSection';

// Định danh key lưu trữ trong Local Storage
const VOUCHER_MODAL_SHOWN_KEY = 'voucher_modal_shown';

export default function HomePage() {
  const router = useRouter();
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts(8);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [addingId, setAddingId] = React.useState<string | null>(null);

  // STATE MỚI CHO MODAL
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false); 

  // LOGIC HIỂN THỊ MODAL CHỈ MỘT LẦN
  useEffect(() => {
    // 1. Kiểm tra nếu người dùng đã đăng nhập
    if (isAuthenticated && user?.id) {
      // 2. Tạo ID duy nhất cho người dùng (để pop-up chỉ hiện 1 lần cho ID này)
      const userKey = `${VOUCHER_MODAL_SHOWN_KEY}_${user.id}`;
      
      // 3. Kiểm tra Local Storage
      const hasSeenModal = localStorage.getItem(userKey);

      if (!hasSeenModal) {
        // Nếu chưa từng thấy, hiển thị modal
        setIsVoucherModalOpen(true);
        
        // Lưu cờ vào Local Storage ngay lập tức để không hiện lại
        localStorage.setItem(userKey, 'true');
      }
    } else {
        // Nếu chưa đăng nhập hoặc đăng xuất, reset trạng thái
        // Tuy nhiên, việc reset có thể phức tạp. Tốt nhất là chỉ kiểm tra khi đăng nhập.
        // Nếu muốn reset cờ khi đăng xuất:
        // if (!isAuthenticated) { 
        //     // Logic này cần chạy trong AuthContext hook hoặc nơi xử lý logout
        // }
    }
  }, [isAuthenticated, user?.id]); // Phụ thuộc vào trạng thái đăng nhập và ID người dùng

  const handleAddToCart = async (product: Product) => {
    // ... (Logic giỏ hàng giữ nguyên)
    addItem(product, 1);
    if (isAuthenticated && user && user.id) {
      try {
        setAddingId(product.id);
        // Determine store id safely whether product.store is an array or an object
        const storeId = Array.isArray(product.store)
          ? (product.store[0]?.store_id ?? product.store[0]?.id ?? 1)
          : ((product.store as any)?.store_id ?? (product.store as any)?.id ?? 1);
        await cartApi.add({ customer_id: user.id as string, product_id: product.id, quantity: 1, store_id: storeId }); // Giả sử chọn cửa hàng đầu tiên
      } finally {
        setAddingId(null);
      }
    }
  };

  const handleViewDetails = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleCategoryClick = (category: ProductCategory) => {
    console.log('Category clicked:', category);
  };
  
  // Hàm đóng Modal
  const handleCloseModal = () => {
      setIsVoucherModalOpen(false);
      // Khi người dùng đóng, cờ đã được lưu trong useEffect, nên không cần làm gì thêm
  };
  return (
    <BaseLayout>
      {/* TÍCH HỢP VOUCHER MODAL VÀO CUỐI TRANG */}
      {isAuthenticated && user?.id && (
      <VoucherModal
              customerId={user.id}
              isOpen={isVoucherModalOpen}
              onClose={handleCloseModal}
      />
        )}
 
          {/* 🎁 NÚT HỘP QUÀ RUNG RINH NỔI BẬT 🎁 */}
          {isAuthenticated && (
           <div className="fixed bottom-10 right-10 z-50"> 
               <button 
                 onClick={() => setIsVoucherModalOpen(true)} 
                 className="
                      ... (Các class khác giữ nguyên)
                      text-3xl
                      animate-bounce // 👈 Thay thế ở đây
                       "
                      title="Nhận Voucher Giảm Giá!"
                       >
                      🎁
                       {/* ... (Các span hiệu ứng ping giữ nguyên) */}
                </button>
            </div>
       )}

      {/* Hero Section */}
      <HeroSection />

      {/* ... (Các sections khác giữ nguyên) ... */}
      
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
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-xl text-[#65604E] max-w-3xl mx-auto leading-relaxed">
              Những tác phẩm gốm sứ được yêu thích nhất, được chọn lọc kỹ lưỡng từ các nghệ nhân tài hoa
            </p>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={featuredProducts}
            loading={featuredLoading}
            error={featuredError}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            columns={4}
          />

          {/* View All Button */}
          <div className="text-center mt-16 flex items-center justify-center gap-4">
            <a href="/products" className="inline-flex items-center px-8 py-4 bg-[#65604E] text-white font-semibold rounded-lg hover:bg-[#3D3A2F] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Xem Tất Cả Sản Phẩm
              <img src="/pott.jpg" alt="arrow" className="ml-2 w-4 h-4" />
            </a>
            <a href="/cart" className="inline-flex items-center px-6 py-4 border-2 border-[#65604E] text-[#65604E] font-semibold rounded-lg hover:bg-[#F5F1EB] transition-colors duration-200">
              Đi tới Giỏ Hàng
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Journal Section */}
      <JournalSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </BaseLayout>
  );
}