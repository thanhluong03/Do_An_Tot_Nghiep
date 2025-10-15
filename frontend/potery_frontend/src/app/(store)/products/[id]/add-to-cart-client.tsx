'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { cartApi } from '../../../../api/modules/cart';
import { Product } from '../../../../types';

interface AddToCartClientProps {
  product: Product;
  storeId?: number;
  disabled?: boolean;
}

export function AddToCartClient({ product, storeId, disabled }: AddToCartClientProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (disabled) return;
    if (!isAuthenticated || !user?.id) {
      setMessage('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    if (!storeId) {
      setMessage('Vui lòng chọn cửa hàng trước khi thêm vào giỏ hàng');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: Number(storeId), // ✅ lấy từ props, không dùng product.store.id
        quantity: 1,
      });
      setMessage('Đã thêm vào giỏ hàng');
    } catch (e) {
      console.error(e);
      setMessage('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAdd}
        className="px-6 py-3 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F] disabled:opacity-50"
        disabled={disabled || loading}
      >
        {loading ? 'Đang thêm…' : 'Thêm vào giỏ'}
      </button>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}
