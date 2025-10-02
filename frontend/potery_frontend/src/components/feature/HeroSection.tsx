'use client';

import React from 'react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBFBFB]">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F5F1EB] rounded-full opacity-60 animate-float animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#8B7D6B] rounded-full opacity-40 animate-float-slow animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#F5F1EB] rounded-full opacity-50 animate-float-reverse animation-delay-3000"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-[#7A8471] rounded-full opacity-30 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Small Title */}
            <div className="inline-block">
              <span className="text-sm font-medium text-[#65604E] uppercase tracking-wider bg-[#F5F1EB] px-4 py-2 rounded-full">
                Thủ Công Truyền Thống
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C2A24] leading-tight">
                Nghệ Thuật Gốm Sứ
                <span className="block text-[#65604E]">Đương Đại</span>
              </h1>
              <p className="text-lg md:text-xl text-[#65604E] leading-relaxed max-w-lg">
                Kết hợp hài hòa giữa truyền thống và hiện đại, mang đến những tác phẩm gốm sứ độc đáo, 
                tinh tế và đầy cảm xúc.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold bg-[#65604E] text-white hover:bg-[#3D3A2F] shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Khám Phá Bộ Sưu Tập
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 border-[#65604E] text-[#65604E] hover:bg-[#F5F1EB] transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Xem Video Giới Thiệu</span>
                <img src="/pott.jpg" alt="Play" className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-[#F5F1EB]">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#2C2A24]">500+</div>
                <div className="text-sm text-[#65604E]">Sản Phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#2C2A24]">15+</div>
                <div className="text-sm text-[#65604E]">Năm Kinh Nghiệm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#2C2A24]">1000+</div>
                <div className="text-sm text-[#65604E]">Khách Hàng</div>
              </div>
            </div>
          </div>

          {/* Right Content - Product Image */}
            <div className="relative">
                {/* Main Product Image Circle */}
                <div className="relative w-80 h-80 mx-auto lg:mx-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1EB] to-[#8B7D6B] rounded-full opacity-20 animate-float-slow"></div>
                  <div className="relative w-full h-full bg-white rounded-full shadow-2xl flex items-center justify-center overflow-hidden animate-float">
                    <div className="w-64 h-64 bg-gradient-to-br from-[#F5F1EB] to-[#8B7D6B] rounded-full flex items-center justify-center animate-float-reverse">
                      <div className="w-48 h-48 bg-[#65604E] rounded-full flex items-center justify-center animate-float-slow">
                        <img src="/pott.jpg" alt="Pottery" className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Handmade Badge */}
            <div className="absolute top-8 right-8 bg-[#65604E] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-float-slow animation-delay-1000">
              Thủ Công 100%
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#7A8471] rounded-full opacity-60 animate-float animation-delay-2000"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#D4AF37] rounded-full opacity-80 animate-float-reverse animation-delay-3000"></div>
          </div>
        </div>
      

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#65604E] rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#65604E] rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
