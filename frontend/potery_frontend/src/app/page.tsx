'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { BaseLayout } from '../layouts';
import { HeroSection } from '../components/feature/HeroSection';
import { LifestyleSection } from '../components/feature/LifestyleSection';
import { FeaturedCollectionsSection } from '../components/feature/FeaturedCollectionsSection';
import { FeaturedProductSection } from '../components/feature/FeaturedProductSection';
import { ProductGrid } from '../components/feature/ProductGrid';
import { FlashSaleSection } from '../components/feature/FlashSaleSection';
import { CategorySection } from '../components/feature/CategorySection';
import { ValuePropositionSection, TestimonialsSection, JournalSection } from '../components/feature/HomeExtraSections';
import { useFeaturedProducts, useFlashSale, useCategories } from '../hooks/useProducts';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cartApi } from '../api/modules/cart';

export default function HomePage() {
  const router = useRouter();
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts(8);
  const { flashSales, loading: flashSaleLoading, error: flashSaleError } = useFlashSale();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [addingId, setAddingId] = React.useState<string | null>(null);

  const handleAddToCart = async (product: Product) => {
    // Local add as fallback
    addItem(product, 1);
    // Server add when logged in
    if (isAuthenticated && user && user.id) {
      try {
        setAddingId(product.id);
        await cartApi.add({ customer_id: user.id as string, product_id: product.id, quantity: 1 });
      } finally {
        setAddingId(null);
      }
    }
  };

  const handleViewDetails = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleCategoryClick = (category: ProductCategory) => {
    // TODO: Implement category navigation
    console.log('Category clicked:', category);
  };

  return (
    <BaseLayout>
          {/* Hero Section */}
          <HeroSection />

          {/* Lifestyle Section */}
          <LifestyleSection />

          {/* Featured Collections Section */}
          <FeaturedCollectionsSection />

          {/* Featured Product Section */}
          <FeaturedProductSection />

          {/* Value Proposition Section */}
          <ValuePropositionSection />

          {/* Categories Section */}
          <CategorySection
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onCategoryClick={handleCategoryClick}
          />

          {/* Flash Sale Section */}
          <FlashSaleSection
            flashSales={flashSales}
            loading={flashSaleLoading}
            error={flashSaleError}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
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
           
      </BaseLayout>
  );
}