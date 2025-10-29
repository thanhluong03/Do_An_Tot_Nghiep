'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { cartApi } from '../../../../api/modules/cart';
import { Product } from '../../../../types';
import { useCart } from '../../../../contexts/CartContext';
import Cookies from 'js-cookie';

interface AddToCartClientProps {
  product: Product;
  storeId?: string; // Changed from number to string
  quantity?: number;
  disabled?: boolean;
  selectedClassifications?: {
    attribute1_id: number | null;
    attribute2_id: number | null;
    attribute1_name: string;
    attribute2_name: string;
  };
  currentPrice?: number;
}

export function AddToCartClient({
  product,
  storeId,
  quantity = 1, // ✅ mặc định là 1 nếu chưa chọn
  disabled,
  selectedClassifications,
  currentPrice,
}: AddToCartClientProps) {
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [navigating, setNavigating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (disabled) return;

    // Guest: save to cookie via context (no store requirement)
    if (!isAuthenticated || !user?.id) {
      setLoading(true);
      setMessage(null);
      try {
        // Pass classification data to guest cart
        addItem(product, quantity, {
          storeId,
          classifications: selectedClassifications && (selectedClassifications.attribute1_id || selectedClassifications.attribute2_id) ? {
            attribute1_id: selectedClassifications.attribute1_id,
            attribute2_id: selectedClassifications.attribute2_id,
            attribute1_name: selectedClassifications.attribute1_name,
            attribute2_name: selectedClassifications.attribute2_name
          } : undefined,
          price: currentPrice || product.price
        });

        const classificationText = selectedClassifications && (selectedClassifications.attribute1_id || selectedClassifications.attribute2_id)
          ? ` (${selectedClassifications.attribute1_name || ''} ${selectedClassifications.attribute2_name || ''})`
          : '';
        setMessage(`Đã thêm ${quantity} sản phẩm${classificationText} vào giỏ hàng`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Logged-in: require store selection for backend cart
    if (!storeId) {
      setMessage('Vui lòng chọn cửa hàng trước khi thêm vào giỏ hàng');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Find classification_attribute_relationship_id based on selected classifications
      let classificationId = null;
      if (selectedClassifications && product.stores) {
        const selectedStore = product.stores.find(store => store.store_id === storeId);
        if (selectedStore && selectedStore.classifications) {
          const matchingClassification = selectedStore.classifications.find(
            classification =>
              classification.attribute1_id === selectedClassifications.attribute1_id &&
              classification.attribute2_id === selectedClassifications.attribute2_id
          );
          if (matchingClassification) {
            classificationId = matchingClassification.id || null;
          }
        }
      }

      await cartApi.add({
        customer_id: user.id,
        product_id: product.id,
        store_id: Number(storeId),
        quantity,
        classification_attribute_relationship_id: classificationId,
      });

      console.log('🟢 Add to cart called with:', {
        product: product.name,
        classification: selectedClassifications,
        classificationId,
        price: currentPrice
      });

      const classificationText = selectedClassifications && (selectedClassifications.attribute1_id || selectedClassifications.attribute2_id)
        ? ` (${selectedClassifications.attribute1_name || ''} ${selectedClassifications.attribute2_name || ''})`
        : '';
      setMessage(`Đã thêm ${quantity} sản phẩm${classificationText} vào giỏ hàng`);
    } catch (e) {
      console.error(e);
      setMessage('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    // Buy-Now: do NOT touch cart. Persist a separate session payload and go to checkout.
    setNavigating(true);
    try {
      // Store payload with classification data
      const payload = {
        product_id: String(product.id),
        quantity: Math.max(1, quantity),
        store_id: storeId ? Number(storeId) : (product.store?.id ? Number(product.store.id) : undefined),
        selectedClassifications,
        currentPrice,
      };
      let stored = false;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('buy_now', JSON.stringify(payload));
          stored = true;
        } catch { }
      }
      if (!stored) {
        try { Cookies.set('buy_now', JSON.stringify(payload)); } catch { }
      }
      // Chuyển hướng với đúng param
      setTimeout(() => {
        window.location.href = `/checkout?productId=${payload.product_id}&storeId=${payload.store_id}&quantity=${payload.quantity}`;
      }, 10);
    } finally {
      setNavigating(false);
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
      <button
        onClick={handleBuyNow}
        className="px-6 py-3 bg-[#c4975a] text-white rounded-lg hover:bg-[#a3764a] disabled:opacity-50"
        disabled={disabled || loading || navigating}
      >
        {navigating ? 'Đang chuyển…' : 'Mua ngay'}
      </button>
      {message && (
        <span className="text-sm text-gray-600 transition-all">{message}</span>
      )}
    </div>
  );
}
