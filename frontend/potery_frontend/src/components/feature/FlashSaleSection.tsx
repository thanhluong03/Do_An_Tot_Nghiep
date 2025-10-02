'use client';

import React, { useState, useEffect } from 'react';
import { FlashSale } from '../../types';
import { ProductGrid } from './ProductGrid';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatTimeRemaining } from '../../utils/format';
import { cn } from '../../utils/cn';

interface FlashSaleSectionProps {
  flashSales: FlashSale[];
  loading?: boolean;
  error?: string | null;
  onAddToCart?: (product: any) => void;
  onViewDetails?: (product: any) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  flashSales,
  loading = false,
  error = null,
  onAddToCart,
  onViewDetails,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error || flashSales.length === 0) {
    return null;
  }

  const activeFlashSale = flashSales.find(sale => sale.isActive);

  if (!activeFlashSale) {
    return null;
  }

  const timeRemaining = formatTimeRemaining(activeFlashSale.endTime);

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Flash Sale
            </h2>
          </div>
          
          <h3 className="text-xl text-gray-700 mb-6">
            {activeFlashSale.title}
          </h3>

          {/* Countdown Timer */}
          <div className="inline-flex items-center space-x-4 bg-white rounded-lg px-6 py-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {timeRemaining}
              </div>
              <div className="text-sm text-gray-600">Thời gian còn lại</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {activeFlashSale.products.length}
              </div>
              <div className="text-sm text-gray-600">Sản phẩm</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={activeFlashSale.products}
          columns={4}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Xem tất cả Flash Sale
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
