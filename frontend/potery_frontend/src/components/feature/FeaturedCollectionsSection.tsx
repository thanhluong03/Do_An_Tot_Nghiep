'use client';

import React from 'react';
import { Button } from '../common/Button';
// Khuyến khích dùng Next/image nếu bạn muốn tối ưu hiệu suất ảnh
// import Image from 'next/image';

export const FeaturedCollectionsSection: React.FC = () => {
  const collections = [
    {
      title: 'Bát Đĩa',
      description: 'Bộ sưu tập bát đĩa gốm sứ tinh tế, phù hợp cho mọi bữa ăn gia đình',
      image: '/pott.jpg', // Ảnh đã được đặt trong public/
      features: ['Thủ công 100%', 'An toàn thực phẩm', 'Dễ vệ sinh'],
      featureIcon: '✔' // Thêm một icon đơn giản cho features
    },
    {
      title: 'Ấm Chén',
      description: 'Bộ ấm chén trà đạo, kết hợp vẻ đẹp truyền thống và hiện đại',
      image: '/pott.jpg',
      features: ['Giữ nhiệt tốt', 'Thiết kế ergonomic', 'Chất liệu cao cấp'],
      featureIcon: '✔'
    },
    {
      title: 'Trang Trí',
      description: 'Các tác phẩm gốm sứ nghệ thuật để trang trí không gian sống',
      image: '/pott.jpg',
      features: ['Độc đáo', 'Bền đẹp', 'Dễ bảo quản'],
      featureIcon: '✔'
    }
  ];

  return (
    <section className="py-20 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
            Bộ Sưu Tập Đặc Biệt
          </h2>
          <p className="text-xl text-[#65604E] max-w-3xl mx-auto leading-relaxed">
            Khám phá những tác phẩm tinh túy được tuyển chọn kỹ lưỡng, 
            mang đậm dấu ấn nghệ thuật và văn hóa truyền thống
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {collections.map((collection, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                
                {/* **********************************************************
                   * ĐÃ THAY THẾ DIV MÀU ĐEN BẰNG THẺ <img>
                   ********************************************************** */}
                <img
                  src={collection.image}
                  alt={`Bộ sưu tập ${collection.title}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Lớp phủ khi hover (giữ lại để tạo hiệu ứng) */}
        
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-serif font-semibold text-[#2C2A24] mb-4 group-hover:text-[#65604E] transition-colors duration-300">
                  {collection.title}
                </h3>
                <p className="text-[#65604E] leading-relaxed mb-6">
                  {collection.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {collection.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-[#65604E]">
                      {/* Sử dụng icon đơn giản thay vì cố gắng dùng /pott.jpg làm icon */}
                      <span className="text-[#65604E] mr-2 text-base">{collection.featureIcon}</span> 
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#65604E] text-[#65604E] hover:bg-[#65604E] hover:text-white transition-all duration-300"
                >
                  Xem Thêm
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-[#65604E] text-white hover:bg-[#3D3A2F] shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Xem Tất Cả Bộ Sưu Tập
          </Button>
        </div>
      </div>
    </section>
  );
};