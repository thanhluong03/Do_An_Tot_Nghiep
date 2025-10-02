'use client';

import React from 'react';
import Image from 'next/image';
import { ProductCategory } from '../../types';
import { cn } from '../../utils/cn';

interface CategorySectionProps {
  categories: ProductCategory[];
  loading?: boolean;
  error?: string | null;
  onCategoryClick?: (category: ProductCategory) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  loading = false,
  error = null,
  onCategoryClick,
}) => {
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-full aspect-square mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá các loại gốm sứ đa dạng, từ truyền thống đến hiện đại
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => onCategoryClick?.(category)}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-2">
                <Image
                  src={category.image || '/placeholder-category.jpg'}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
              
              <div className="text-center mt-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {category.productCount} sản phẩm
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors duration-200">
            Xem tất cả danh mục
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
