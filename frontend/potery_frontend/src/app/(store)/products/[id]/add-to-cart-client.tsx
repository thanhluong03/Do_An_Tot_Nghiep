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
        setMessage(`Đã thêm vào giỏ hàng!`);
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
      if (window.reloadCartCount) {
        window.reloadCartCount();
      }

      console.log('🟢 Add to cart called with:', {
        product: product.name,
        classification: selectedClassifications,
        classificationId,
        price: currentPrice
      });
      setMessage(`Đã thêm vào giỏ hàng!`);
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

      // Build URL with classification info like ProductCard
      const queryParams = new URLSearchParams({
        productId: payload.product_id,
        quantity: String(payload.quantity),
        price: String(currentPrice || product.price)
      });

      // Add store ID if available
      if (payload.store_id) {
        queryParams.append('storeId', String(payload.store_id));
      }

      // Add classification info if available
      if (selectedClassifications && selectedClassifications.attribute1_id && selectedClassifications.attribute2_id) {
        queryParams.append('attribute1_id', String(selectedClassifications.attribute1_id));
        queryParams.append('attribute2_id', String(selectedClassifications.attribute2_id));
        queryParams.append('attribute1_name', encodeURIComponent(selectedClassifications.attribute1_name || ''));
        queryParams.append('attribute2_name', encodeURIComponent(selectedClassifications.attribute2_name || ''));

        // Find classification ID from product data
        if (product.stores && payload.store_id) {
          const selectedStore = product.stores.find((store: any) => store.store_id === String(payload.store_id));
          if (selectedStore && selectedStore.classifications) {
            const classificationId = selectedStore.classifications.find((c: any) =>
              c.attribute1_id === selectedClassifications.attribute1_id &&
              c.attribute2_id === selectedClassifications.attribute2_id
            )?.id;

            if (classificationId) {
              queryParams.append('classificationId', String(classificationId));
            }
          }
        }
      }

      // Redirect with full query params
      setTimeout(() => {
        window.location.href = `/checkout?${queryParams.toString()}`;
      }, 10);
    } finally {
      setNavigating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center px-6 py-3 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#7a4f34] disabled:opacity-50 transition-colors duration-150 font-semibold shadow-sm"
        disabled={disabled || loading || navigating}
      >
        {navigating ? 'Đang chuyển…' : 'Mua Ngay'}
      </button>
      {message && (
        <span className="text-sm text-gray-600 transition-all">{message}</span>
      )}
    </div>
  );
}
