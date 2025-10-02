'use client';

import React from 'react';
import { AuthProvider } from '../contexts';
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

export default function HomePage() {
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts(8);
  const { flashSales, loading: flashSaleLoading, error: flashSaleError } = useFlashSale();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const handleAddToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
  };

  const handleViewDetails = (product: Product) => {
    // TODO: Implement view details functionality
    console.log('View details:', product);
  };

  const handleCategoryClick = (category: ProductCategory) => {
    // TODO: Implement category navigation
    console.log('Category clicked:', category);
  };

  return (
    <AuthProvider>
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
              <div className="text-center mt-16">
                <button className="inline-flex items-center px-8 py-4 bg-[#65604E] text-white font-semibold rounded-lg hover:bg-[#3D3A2F] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Xem Tất Cả Sản Phẩm
                  <img src="/pott.jpg" alt="arrow" className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* Journal Section */}
          <JournalSection />

          {/* Newsletter Section */}
           
      </BaseLayout>
    </AuthProvider>
  );
}