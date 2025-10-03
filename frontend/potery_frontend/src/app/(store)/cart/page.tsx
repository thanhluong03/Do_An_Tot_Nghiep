'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/format';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [address, setAddress] = useState('');

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="text-gray-600">Chưa có sản phẩm trong giỏ hàng.</div>
        ) : (
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between border rounded p-4">
                <div className="flex items-center gap-4">
                  <img src={product.images[0] || '/pott.jpg'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{formatPrice(product.price)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20"
                    min={1}
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, Math.max(1, Number(e.target.value)))}
                  />
                  <button className="text-red-600" onClick={() => removeItem(product.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-2">Địa chỉ giao hàng</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded p-3"
              rows={4}
              placeholder="Nhập địa chỉ giao hàng của bạn"
            />
          </div>
          <div className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span>Tạm tính</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <a href="/checkout" className="block text-center bg-[#65604E] text-white py-2 rounded mt-4">Tiến hành thanh toán</a>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}


