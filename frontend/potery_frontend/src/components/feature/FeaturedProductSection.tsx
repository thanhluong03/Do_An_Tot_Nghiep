'use client';

import React, { useEffect, useState } from 'react';
import { productApi } from '@/api/modules/products';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + '₫';
};

export const FeaturedProductSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const cart = useCart();
  const addToCart = (cart as any).addToCart ?? (() => { });

  // Fetch danh sách sản phẩm nổi bật
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products } = await productApi.getProducts({ limit: 5 });
        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const nextProduct = () => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }
  };

  const prevProduct = () => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }
  };

  if (loading || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Đang tải sản phẩm nổi bật...
      </div>
    );
  }

  const product = products[currentIndex];

  return (
    <section className="bg-[#FBFBFB] pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Nút chuyển sản phẩm ở ngoài khung */}
        <div className="absolute inset-y-0 -left-8 flex items-center z-20">
          <button
            onClick={prevProduct}
            className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F5F1EB] transition"
          >
            <span className="text-xl text-gray-700">←</span>
          </button>
        </div>

        <div className="absolute inset-y-0 -right-8 flex items-center">
          <button
            onClick={nextProduct}
            className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F5F1EB] transition"
          >
            <span className="text-xl text-gray-700">→</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch">

            {/* Left - Hình ảnh */}
            <div className="relative p-2 h-full">
              <div className="relative h-full rounded-xl overflow-hidden shadow-md bg-white">
                <img
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center aspect-[4/3]"
                />

                <div className="absolute top-4 right-4 bg-[#8B7D6B] text-white px-3 py-1 rounded-md text-sm font-medium z-10">
                  Sản phẩm nổi bật
                </div>

                {/* Text dọc bên trái */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-200 text-opacity-50 text-xl font-bold tracking-widest transform rotate-[-90deg] translate-x-[-120px] select-none">
                    YOUR SWEET
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="absolute -bottom-2 -left-2 bg-white rounded-xl p-3 shadow-xl z-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2C2A24] mb-0.5 leading-none">
                    {product.rating?.toFixed(1) || '5.0'}
                  </div>
                  <div className="flex justify-center text-yellow-500 space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Chi tiết */}
            <div className="p-4 lg:p-0 flex flex-col justify-center">
              <h1 className="text-6xl font-serif font-bold text-[#2C2A24] mb-4">
                {product.name}
              </h1>

              <p className="text-sm text-[#65604E] leading-relaxed mb-6">
                {product.description || 'Không có mô tả.'}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#8B7D6B] rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-[#65604E]">Thủ công 100% - Không máy móc</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#8B7D6B] rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-[#65604E]">Vật liệu cao cấp nhập khẩu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#8B7D6B] rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-[#65604E]">Giao hàng miễn phí toàn quốc</span>
                </div>
              </div>

              {/* Giá */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-[#2C2A24]">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-[#65604E] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-[#E96666] text-white px-2 py-0.5 rounded text-xs font-medium inline-block">
                        Giảm {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="flex-1 bg-[#8B7D6B] text-white hover:bg-[#65604E] px-6 py-3 text-base font-semibold rounded-lg text-center transition"
                >
                  Mua Ngay
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 border border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#F5F1EB] px-6 py-3 text-base font-semibold rounded-lg text-center flex items-center justify-center space-x-2 transition"
                >
                  <span>Thêm Vào Giỏ Hàng</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
