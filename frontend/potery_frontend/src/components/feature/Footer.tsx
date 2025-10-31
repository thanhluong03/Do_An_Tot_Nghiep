'use client';

import React from 'react';

// Giả định bạn có các icon này trong thư mục /public/icons/
// Các icon social (Facebook, Instagram, TikTok) nên là màu trắng.
// Các icon liên hệ (Location, Phone, Mail, Clock) nên là màu vàng.

export const Footer: React.FC = () => {
  return (
    // 1. Thay đổi màu nền
    <footer className="bg-[#1D2026] text-gray-300"> {/* Gần với màu trong ảnh */}
      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* ----------------------------------- */}
            {/* Cột 1 - Logo & Description (ĐÃ SỬA) */}
            {/* ----------------------------------- */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                {/* 2. Logo chữ K trong vòng tròn trắng */}
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">   
                    <img
                      src="/logo.png"
                      alt="Tiệm Gốm Nhà Gạo Logo"
                      className="w-8 h-8 object-contain" // Giảm kích thước ảnh logo một chút
                    />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Tiệm Gốm
                  </h3>
                  <p className="text-sm text-gray-400 italic">Nhà Gạo</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Nơi nghệ thuật gốm sứ truyền thống thông qua ngôn ngữ thiết kế hiện
                đại, tạo nên những tác phẩm độc đáo dạo cho cuộc sống đương đại.
              </p>

              {/* 3. Social Media (Đã đổi sang IMG) */}
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                            transform transition-all duration-200 ease-in-out 
                            hover:bg-gray-500 hover:scale-110"
                >
                  <img
                    src="/facebook3.png" // Cần file icon màu trắng
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                            transform transition-all duration-200 ease-in-out 
                            hover:bg-gray-500 hover:scale-110"
                >
                  <img
                    src="/ig2.png" // Cần file icon màu trắng
                    alt="Instagram"
                    className="w-5 h-5"
                  />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                            transform transition-all duration-200 ease-in-out 
                            hover:bg-gray-500 hover:scale-110"
                >
                  <img
                    src="/tiktok2.png" // Cần file icon màu trắng
                    alt="TikTok"
                    className="w-5 h-5"
                  />
                </a>
              </div>
            </div>
            {/* ----------------------------------- */}
            {/* Cột 2 - Quick Links (ĐÃ SỬA) */}
            {/* ----------------------------------- */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Liên Kết Nhanh
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Trang Chủ
                  </a>
                </li>
                <li>
                  <a
                    href="/products"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Sản Phẩm
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Về Nhà Gạo
                  </a>
                </li>
                <li>
                  <a
                    href="/news"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Tin Tức
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Liên Hệ
                  </a>
                </li>
                <li>
                  <a
                    href="/policy"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Chính Sách Đổi Trả
                  </a>
                </li>
              </ul>
            </div>

            {/* ----------------------------------- */}
            {/* Cột 3 - Product Categories (ĐÃ SỬA) */}
            {/* ----------------------------------- */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Danh Mục Sản Phẩm
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/products/bat-dia"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Bát Đĩa
                  </a>
                </li>
                <li>
                  <a
                    href="/products/trang-tri"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Trang Trí
                  </a>
                </li>
                <li>
                  <a
                    href="/products/bo-suu-tap"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Bộ sưu tập
                  </a>
                </li>
                <li>
                  <a
                    href="/products/coc-ly"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Cốc, Ly
                  </a>
                </li>
                <li>
                  <a
                    href="/products/qua-tang"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Quà Tặng
                  </a>
                </li>
                <li>
                  <a
                    href="/products/new"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Sản Phẩm Mới
                  </a>
                </li>
              </ul>
            </div>

            {/* ----------------------------------- */}
            {/* Cột 4 - Contact Info (ĐÃ SỬA TOÀN BỘ) */}
            {/* ----------------------------------- */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Thông Tin Liên Hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <img
                    src="/location.png" // Cần file icon màu vàng
                    alt="Địa chỉ"
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    379 Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <img
                    src="/location.png" // Cần file icon màu vàng
                    alt="Địa chỉ 2"
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    146 Liên Quan, Thạch Thất, Hà Nội, Việt Nam
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <img
                    src="/phone.png" // Cần file icon màu vàng
                    alt="Điện thoại"
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">(+84) 96 692 12 75</p>
                </div>
                <div className="flex items-start space-x-3">
                  <img
                    src="/envelope.png" // Cần file icon màu vàng
                    alt="Email"
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    tiemnhagao.xinchao@gmail.com
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <img
                    src="/clock.png" // Cần file icon màu vàng
                    alt="Giờ làm việc"
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <div>
                    <p className="text-gray-400">T2-T7: 8:00 - 18:00</p>
                    <p className="text-gray-400">CN: 9:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------- */}
      {/* Bottom Bar (ĐÃ SỬA) */}
      {/* ----------------------------------- */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            {/* 6. Chỉ giữ lại copyright text */}
            <p className="text-gray-500 text-sm">
              Copy right @ 2025 - Tiệm Gốm Nhà Gạo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};