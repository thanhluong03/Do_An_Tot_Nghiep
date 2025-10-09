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
    <div className={cn(
      'group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden',
      className
    )}>
      {/* Image Container */}
      <a href={`/products/${product.id}`} className="relative aspect-square overflow-hidden block">
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {isFlashSale && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              Flash Sale
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Flash Sale Timer */}
        {isFlashSale && product.flashSaleEndTime && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              <div className="flex items-center justify-between">
                <span>Kết thúc sau:</span>
                <span className="font-mono">{formatTimeRemaining(product.flashSaleEndTime)}</span>
              </div>
            </div>
          </div>
        )}
      </a>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {product.category}
        </div>

        {/* Product Name */}
        <a href={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </a>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.floor(product.rating) ? '/images/star-filled.png' : '/images/star-empty.png'}
                alt="star"
                className="w-4 h-4"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatPrice(product.price)}
          </span>
          {/* Chỉ hiển thị giá gốc gạch ngang nếu có discount */}
          {discount > 0 && product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-sm text-gray-600">
          {product.stock > 0 ? (
            <span className="text-green-600">Còn {product.stock} sản phẩm</span>
          ) : (
            <span className="text-red-600">Hết hàng</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleNavigateToDetail}
          >
            Xem chi tiết
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
          >
            Thêm giỏ
          </Button>
        </div>
      </div>
    </div>
  );
};
