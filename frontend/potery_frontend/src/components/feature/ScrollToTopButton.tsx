// components/feature/ScrollToTopButton.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      aria-label="Cuộn lên đầu trang" // Cải thiện khả năng tiếp cận
      className="
        fixed bottom-20 right-6 z-50     
        bg-[#8B7D6B] text-white
        p-3 rounded-full shadow-md
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-gray-300
        border border-gray-200
        flex items-center justify-center
        w-12 h-12
      "
    >
      <ArrowUp className="w-6 h-6" /> {/* Icon mũi tên */}
    </button>
  );
}
