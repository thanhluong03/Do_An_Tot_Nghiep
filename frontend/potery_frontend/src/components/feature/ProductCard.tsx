'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { formatPrice, calculateDiscount } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { cartApi } from '../../api/modules/cart';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  className,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const handleNavigateToDetail = (product: Product) => {
    if (onViewDetails) {
      onViewDetails(product);
      return;
    }
    router.push(`/products/${product.id}`);
  };

  // ✅ Hàm thêm vào giỏ hàng — dùng logic bạn gửi
  const handleAdd = async () => {
    if (loading) return;
    if (!isAuthenticated || !user || !user.id) {
      setMessage('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const storeId = product.store?.id;
      const customerId = user.id as string;
      await cartApi.add({
        customer_id: customerId,
        product_id: product.id,
        store_id: storeId,
        quantity: 1,
      });
      setMessage('Đã thêm vào giỏ hàng');
    } catch (e) {
      console.error(e);
      setMessage('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${className || ''}`}
    >
      <div
        className="aspect-[4/5] relative cursor-pointer"
        onClick={() => handleNavigateToDetail(product)}
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
          onClick={() => handleNavigateToDetail(product)}
          className="w-full mt-2 bg-[#c4975a] hover:bg-[#a3764a] text-white py-2 rounded transition-all"
        >
          Xem chi tiết
        </button>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full mt-2 bg-[#c4975a] hover:bg-[#a3764a] text-white py-2 rounded transition-all disabled:opacity-50"
        >
          {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>

        {message && (
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};
