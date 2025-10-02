'use client';

import React from 'react';
import { Button } from '../common/Button';
// Nếu bạn đang dùng Next.js, bạn có thể cân nhắc dùng Image component để tối ưu hóa
// import Image from 'next/image'; 

export const LifestyleSection: React.FC = () => {
  const lifestyleItems = [
    {
      title: 'Bàn Ăn Tối Ấm Cúng',
      description: 'Tạo không gian ấm cúng cho bữa ăn gia đình với bộ bát đĩa gốm sứ tinh tế',
      image: '/pott.jpg', // Đảm bảo file pott.jpg nằm trong thư mục public
      icon: '🍽️'
    },
    {
      title: 'Bộ Ấm Trà Thiền Tịnh',
      description: 'Thưởng thức trà đạo với bộ ấm chén Nhật Bản, mang lại sự bình yên trong tâm hồn',
      image: '/pott.jpg', // Đảm bảo file pott.jpg nằm trong thư mục public
      icon: '🍵'
    },
    {
      title: 'Trang Trí Nội Thất Hiện Đại',
      description: 'Làm đẹp không gian sống với các tác phẩm gốm sứ nghệ thuật độc đáo',
      image: '/pott.jpg', // Đảm bảo file pott.jpg nằm trong thư mục public
      icon: '🏺'
    }
  ];

  return (
    <section className="py-20 bg-[#65604E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Gốm Sứ Trong Cuộc Sống Hàng Ngày
          </h2>
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-xl md:text-2xl italic leading-relaxed">
              "Mỗi tác phẩm gốm sứ không chỉ là một vật dụng, mà còn là cầu nối giữa quá khứ và hiện tại, 
              mang theo hơi thở của truyền thống và vẻ đẹp của cuộc sống hiện đại."
            </blockquote>
            <cite className="block mt-6 text-lg text-[#F5F1EB]">
              — Nguyễn Văn Minh, Founder Tiệm Gốm Nhà Gạo
            </cite>
          </div>
        </div>

        {/* Lifestyle Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {lifestyleItems.map((item, index) => (
            <div key={index} className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-6">
                
                {/* * ĐÃ THÊM THẺ <img> VÀ SỬ DỤNG item.image
                  * Đảm bảo file pott.jpg nằm trong thư mục public/ của bạn
                */}
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Lớp overlay (có thể tùy chỉnh opacity hoặc xóa đi) */}
                
                 
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 group-hover:text-[#F5F1EB] transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-[#F5F1EB] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-white text-[#65604E] hover:bg-[#F5F1EB] shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Khám Phá Bộ Sưu Tập Lifestyle
          </Button>
        </div>
      </div>
    </section>
  );
};