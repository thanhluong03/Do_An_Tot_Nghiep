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
    } catch {}
    try {
      Cookies.set('cart_session', JSON.stringify(items), { expires: 7 });
    } catch {}
  }, [items]);
  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      } else {
        next = [...prev, { product, quantity }];
      }
      // Persist immediately for guest checkout flows (session first, then cookie)
      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch {}
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch {}
      return next;
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch {}
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch {}
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) => {
      const next = prev.map((i) => i.product.id === productId ? { ...i, quantity } : i);
      try { if (typeof window !== 'undefined') sessionStorage.setItem('cart_session', JSON.stringify(next)); } catch {}
      try { Cookies.set('cart_session', JSON.stringify(next), { expires: 7 }); } catch {}
      return next;
    });
  };

  const clear = () => {
    try { if (typeof window !== 'undefined') sessionStorage.removeItem('cart_session'); } catch {}
    try { Cookies.remove('cart_session'); } catch {}
    setItems([]);
  };

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


