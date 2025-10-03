'use client';

import React from 'react';
import { BaseLayout } from '../../../layouts';
import { useCart } from '../../../contexts';
import { formatPrice } from '../../../utils/format';

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();

  const placeOrder = () => {
    // TODO: Integrate with backend order API
    alert('Thanh toán demo thành công!');
    clear();
  };

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between border rounded p-4">
                <div className="flex items-center gap-4">
                  <img src={product.images[0] || '/pott.jpg'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">x{quantity}</div>
                  </div>
                </div>
                <div className="font-semibold">{formatPrice(product.price * quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span>Tạm tính</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <button onClick={placeOrder} className="w-full bg-[#65604E] text-white py-2 rounded mt-4">Đặt hàng</button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}


