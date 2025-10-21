'use client';

import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onViewDetails?: (product: Product) => void;
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  onViewDetails,
  columns = 4,
}) => {
  const gridCols =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : columns === 2
        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';

  // Show loading skeleton to prevent layout shift
  if (loading)
    return (
      <div className="w-full max-w-none">
        <div className={`grid ${gridCols} gap-6 lg:gap-8 auto-rows-fr`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-[320px] animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return <div className="text-center text-red-600 py-8">Có lỗi xảy ra: {error}</div>;

  if (products.length === 0)
    return (
      <div className="text-center py-12 text-gray-600">
        Không tìm thấy sản phẩm nào
      </div>
    );

  return (
    <div className="w-full max-w-none">
      <div className={`grid ${gridCols} gap-4 lg:gap-6 auto-rows-fr`}>
        {products.map((p) => (
          <div key={p.id} className="flex justify-center">
            <ProductCard product={p} onViewDetails={onViewDetails} />
          </div>
        ))}
      </div>
    </div>
  );
};
