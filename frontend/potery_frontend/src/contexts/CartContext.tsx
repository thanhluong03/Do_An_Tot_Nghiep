
'use client';
import { createContext as createReactContext } from 'react';
export const CartCountContext = createReactContext<{ reloadCartCount: () => void } | undefined>(undefined);

import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import Cookies from 'js-cookie';

export interface CartClassification {
  attribute1_id: number | null;
  attribute2_id: number | null;
  attribute1_name: string;
  attribute2_name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  storeId?: string;
  classifications?: CartClassification;
  price?: number; // Actual price with classification
  classificationId?: number; // For backend cart
  selected?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, options?: {
    storeId?: string;
    classifications?: CartClassification;
    price?: number;
    classificationId?: number;
    
  }) => void;
  selectItem: (productId: string, selected: boolean, classificationKey?: string) => void;
  removeItem: (productId: string, classificationKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, classificationKey?: string) => void;
  clear: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const selectItem = (productId: string, selected: boolean, classificationKey?: string) => {
  setItems(prev => prev.map(i => {
    if (classificationKey) {
      const key = getCartItemKey(String(i.product.id), i.classifications);
      return key === classificationKey ? { ...i, selected } : i;
    } else {
      return String(i.product.id) === String(productId) ? { ...i, selected } : i;
    }
  }));
};

  // ✅ Load cart từ cookie khi reload trang
  useEffect(() => {
    // Prefer sessionStorage for immediate navigation reliability
    try {
      if (typeof window !== 'undefined') {
        const ss = sessionStorage.getItem('cart_session');
        if (ss) {
          setItems(JSON.parse(ss));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to read session cart:', err);
    }
    // Fallback to cookie
    try {
      const saved = Cookies.get('cart_session');
      if (saved) setItems(JSON.parse(saved));
    } catch (err) {
      console.error('Failed to parse cart cookie:', err);
    }
  }, []);

  // ✅ Mỗi khi items thay đổi, lưu lại vào cookie
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cart_session', JSON.stringify(items));
      }
    } catch { }
    try {
      Cookies.set('cart_session', JSON.stringify(items), { expires: 7 });
    } catch { }
  }, [items]);
  // Helper function to generate unique key for cart items with classifications
  const getCartItemKey = (productId: string, classifications?: CartClassification) => {
    if (!classifications || (!classifications.attribute1_id && !classifications.attribute2_id)) {
      return String(productId);
    }
    return `${productId}-${classifications.attribute1_id || 'null'}-${classifications.attribute2_id || 'null'}`;
  };

  const addItem = (product: Product, quantity: number = 1, options?: {
    storeId?: string;
    classifications?: CartClassification;
    price?: number;
    classificationId?: number;
  }) => {
    setItems((prev) => {
      const itemKey = getCartItemKey(String(product.id), options?.classifications);

      // Find existing item with same product and classification combination
      const idx = prev.findIndex((i) => {
        const existingKey = getCartItemKey(String(i.product.id), i.classifications);
        return existingKey === itemKey;
      });

      let next: CartItem[];
      if (idx >= 0) {
        // Update existing item quantity
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      } else {
        // Add new item with classification info
        const newItem: CartItem = {
          product,
          quantity,
          storeId: options?.storeId,
          classifications: options?.classifications,
          price: options?.price || product.price,
          classificationId: options?.classificationId
          
        };
        next = [...prev, newItem];
      }

      // Persist immediately for guest checkout flows
      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch { }
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch { }
      return next;
    });
  };

  const removeItem = (productId: string, classificationKey?: string) => {
    setItems((prev) => {
      let next: CartItem[];
      if (classificationKey) {
        // Remove specific classification variant
        next = prev.filter((i) => {
          const itemKey = getCartItemKey(String(i.product.id), i.classifications);
          return itemKey !== classificationKey;
        });
      } else {
        // Remove all variants of this product
        next = prev.filter((i) => String(i.product.id) !== String(productId));
      }

      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch { }
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch { }
      if (typeof window !== 'undefined' && !window.__forceCartUpdate) {
        window.__forceCartUpdate = true;
        setTimeout(() => { window.__forceCartUpdate = false; }, 100);
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number, classificationKey?: string) => {
    setItems((prev) => {
      const next = prev.map((i) => {
        if (classificationKey) {
          const itemKey = getCartItemKey(String(i.product.id), i.classifications);
          return itemKey === classificationKey ? { ...i, quantity } : i;
        } else {
          return String(i.product.id) === String(productId) ? { ...i, quantity } : i;
        }
      });

      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch { }
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch { }
      return next;
    });
  };

  const clear = () => {
    try { if (typeof window !== 'undefined') sessionStorage.removeItem('cart_session'); } catch { }
    try { Cookies.remove('cart_session'); } catch { }
    setItems([]);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const itemPrice = i.price || i.product.price;
      return sum + itemPrice * i.quantity;
    }, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    subtotal,
    selectItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


