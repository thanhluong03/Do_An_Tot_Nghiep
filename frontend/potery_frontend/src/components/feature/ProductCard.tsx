'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { formatPrice, calculateDiscount, formatTimeRemaining } from '../../utils/format';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  className,
}) => {
  const router = useRouter();
  const discount = product.originalPrice 
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const isFlashSale = product.isFlashSale && product.flashSaleEndTime;

  const handleNavigateToDetail = () => {
    if (onViewDetails) {
      onViewDetails(product);
      return;
    }
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
  <div
    className="aspect-[4/5] relative cursor-pointer"
    onClick={() => onViewDetails?.(product)}
  >
    <img
      src={product.images[0] || '/placeholder-product.jpg'}
      alt={product.name}
      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
    />
  </div>
  <div className="p-4 text-center space-y-2">
    <div className="text-xs text-gray-500">{product.category}</div>
    <h3 className="font-medium text-gray-900">{product.name}</h3>
    <div className="text-[#c4975a] font-semibold">{formatPrice(product.price)}</div>
    <button
      onClick={() => onAddToCart?.(product)}
      className="w-full mt-2 bg-[#c4975a] hover:bg-[#a3764a] text-white py-2 rounded transition-all"
    >
      Thêm vào giỏ
    </button>
  </div>
</div>
  );
};
