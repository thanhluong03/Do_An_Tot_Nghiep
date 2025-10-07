'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { cartApi } from '../../../../api/modules/cart';
import { Product } from '../../../../types';

export function AddToCartClient({ product, disabled } : { product: Product; disabled?: boolean; }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (disabled) return;
    if (!isAuthenticated || !user || !user.id) {
      setMessage('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const customerId = user.id as string; // guarded above
      await cartApi.add({
        customer_id: customerId,
        product_id: product.id,
        quantity: 1,
      });
      setMessage('Đã thêm vào giỏ hàng');
    } catch (e) {
      setMessage('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button onClick={handleAdd} className="px-6 py-3 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F] disabled:opacity-50" disabled={disabled || loading}>
        {loading ? 'Đang thêm…' : 'Thêm vào giỏ'}
      </button>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}


