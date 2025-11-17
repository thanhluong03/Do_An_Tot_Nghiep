'use client';

import React from 'react';
import Image from 'next/image'; // 1. ĐÃ IMPORT Image
import Link from 'next/link'; // 2. ĐÃ IMPORT Link

// ... (code cũ của bạn)

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1D2026] text-gray-300">
      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* ----------------------------------- */}
            {/* Cột 1 - Logo & Description (ĐÃ SỬA) */}
            {/* ----------------------------------- */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  {/* FIX 1: Thay <img> bằng <Image> 
                    w-8 h-8 -> 2rem -> 32px
                  */}
                  <Image
                    src="/logo.png"
                    alt="Tiệm Gốm Nhà Gạo Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
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
                Nơi nghệ thuật gốm sứ truyền thống thông qua ngôn ngữ thiết kế
                hiện đại, tạo nên những tác phẩm độc đáo dạo cho cuộc sống
                đương đại.
              </p>

              {/* 3. Social Media (Giữ nguyên <a> vì đây là link bên ngoài) */}
              <div className="flex space-x-3">
                <a
                  href="http://facebook.com/tiemgomnhagao.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                                   transform transition-all duration-200 ease-in-out 
                                   hover:bg-gray-500 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-facebook"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/tiemgomnhagao/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                                   transform transition-all duration-200 ease-in-out 
                                   hover:bg-gray-500 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-instagram"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@tiemgomnhagao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-[#3A3A3A] rounded-full flex items-center justify-center 
                                   transform transition-all duration-200 ease-in-out 
                                   hover:bg-gray-500 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="white"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" />
                  </svg>
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
                {/* FIX 2: Thay <a> bằng <Link> cho các link nội bộ */}
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Về Nhà Gạo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Liên Hệ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policy"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Chính Sách Đổi Trả
                  </Link>
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
                {/* FIX 3: Thay <a> bằng <Link> cho tất cả */}
                <li>
                  <Link
                    href="/products/bat-dia"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Bát Đĩa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/trang-tri"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Trang Trí
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/bo-suu-tap"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Bộ sưu tập
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/coc-ly"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Cốc, Ly
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/qua-tang"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Quà Tặng
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/new"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Sản Phẩm Mới
                  </Link>
                </li>
              </ul>
            </div>

            {/* ----------------------------------- */}
            {/* Cột 4 - Contact Info (ĐÃ SỬA) */}
            {/* ----------------------------------- */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Thông Tin Liên Hệ
              </h3>
              <div className="space-y-4">
                {/* FIX 4: Thay <img> bằng <Image> 
                    w-5 h-5 -> 1.25rem -> 20px
                */}
                <div className="flex items-start space-x-3">
                  <Image
                    src="/location.png"
                    alt="Địa chỉ"
                    width={20}
                    height={20}
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    379 Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Image
                    src="/location.png"
                    alt="Địa chỉ 2"
                    width={20}
                    height={20}
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    146 Liên Quan, Thạch Thất, Hà Nội, Việt Nam
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Image
                    src="/phone.png"
                    alt="Điện thoại"
                    width={20}
                    height={20}
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">(+84) 96 692 12 75</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Image
                    src="/envelope.png"
                    alt="Email"
                    width={20}
                    height={20}
                    className="w-5 h-5 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-400">
                    tiemnhagao.xinchao@gmail.com
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Image
                    src="/clock.png"
                    alt="Giờ làm việc"
                    width={20}
                    height={20}
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

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <p className="text-gray-500 text-sm">
              Copy right @ 2025 - Tiệm Gốm Nhà Gạo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};