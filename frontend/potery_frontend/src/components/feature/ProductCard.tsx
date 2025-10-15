'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { cartApi } from '../../api/modules/cart';

export const ProductCard: React.FC<{ product: Product; onViewDetails?: (p: Product) => void }> = ({
  product,
  onViewDetails,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!isAuthenticated || !user) return alert('Vui lòng đăng nhập');
    if (!user.id) return alert('Tài khoản không hợp lệ (missing id)');
    const storeId = product.store?.id;
    if (!storeId) return alert('Cửa hàng không hợp lệ');

    setLoading(true);
    try {
      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: storeId,
        quantity: 1,
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch {
      alert('Không thể thêm sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div
        className="relative aspect-[4/3] cursor-pointer"
        onClick={() => onViewDetails?.(product)}
      >
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="object-cover w-full h-full"
        />
        <button className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="p-5 text-left">
        <p className="text-sm text-black-500 mb-1">{product.category}</p>
        <h3 className="font-semibold text-2xl text-gray-900 mb-2">{product.name}</h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-[#c4975a] font-semibold text-base">
            {formatPrice(product.price)}
          </span>
        </div>

       <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full py-3 bg-[#c4975a] hover:bg-[#a3764a] text-white rounded-lg text-base font-semibold disabled:opacity-50 transition"
        >
          {loading ? 'Đang thêm...' : 'Mua ngay'}
        </button>
      </div>
      </div>
    </div>
  );
};
