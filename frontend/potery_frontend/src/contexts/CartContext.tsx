'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import Cookies from 'js-cookie';
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
   // ✅ Load cart từ cookie khi reload trang
  useEffect(() => {
    const saved = Cookies.get('cart_session');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse cart cookie:', err);
      }
    }
  }, []);

  // ✅ Mỗi khi items thay đổi, lưu lại vào cookie
  useEffect(() => {
    Cookies.set('cart_session', JSON.stringify(items), { expires: 7 }); // lưu 7 ngày
  }, [items]);
  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


