'use client';

import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

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
  columns = 3,
}) => {
  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
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

  const gridCols =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-8`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
};
