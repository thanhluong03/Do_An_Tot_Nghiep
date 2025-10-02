'use client';

import React from 'react';
import { Button } from '../common/Button';
import { formatPrice } from '../../utils/format';
// Nếu bạn đang dùng Next.js, bạn có thể cân nhắc dùng Image component để tối ưu hóa
// import Image from 'next/image'; 

export const FeaturedProductSection: React.FC = () => {
  const product = {
    name: 'Lọ Hoa Cung Đình',
    description: 'Tác phẩm gốm sứ được chế tác thủ công với kỹ thuật truyền thống, họa tiết tinh xảo mang đậm dấu ấn văn hóa Việt Nam',
    price: 2850000,
    originalPrice: 3200000,
    discount: 11,
    rating: 4.9,
    reviewCount: 127,
    image: '/pott.jpg', // Đường dẫn hình ảnh đã khai báo
    features: [
      'Thủ công 100%',
      'Vật liệu cao cấp',
      'Bảo hành trọn đời',
      'Giao hàng miễn phí'
    ]
  };

  return (
    <section className="py-20 bg-[#F5F1EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left - Product Image */}
            <div className="relative aspect-square lg:aspect-auto">
              
              {/* ******************************************************
                 * ĐÃ THAY THẾ DIV CHỨA SVG BẰNG THẺ <img>
                 ****************************************************** */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                // Bạn có thể thêm các hiệu ứng khác như:
                // className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />

              {/* Lớp overlay gradient (tùy chọn) - Có thể xóa nếu không cần hiệu ứng màu trên ảnh */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EB]/50 to-[#8B7D6B]/50"></div> */}
              
              {/* Product Tag */}
              <div className="absolute top-6 left-6 bg-[#7A8471] text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                Sản Phẩm Mới
              </div>

              {/* Rating */}
              <div className="absolute bottom-6 left-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 z-10">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-[#2C2A24]">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24] mb-6">
                {product.name}
              </h2>
              
              <p className="text-lg text-[#65604E] leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#7A8471] rounded-full"></div>
                    <span className="text-sm text-[#65604E] font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-4 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-[#2C2A24]">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xl text-[#65604E] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-[#7A8471] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Giảm {product.discount}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1 bg-[#65604E] text-white hover:bg-[#3D3A2F] px-8 py-4 text-lg font-semibold"
                >
                  Thêm Vào Giỏ Hàng
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-4 py-4 border-2 border-[#65604E] text-[#65604E] hover:bg-[#F5F1EB]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};