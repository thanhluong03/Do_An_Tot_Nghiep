'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-white">
      {/* Newsletter Section */}
      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo & Description */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-[#E0D8CC]"> {/* Màu nền trắng, viền nhạt */}
              <img 
                  src="/logo.png" // Đảm bảo đây là đường dẫn đúng tới ảnh logo PNG của bạn (ví dụ: cành lúa mì/gạo)
                  alt="Tiệm Gốm Nhà Gạo Logo" 
                  className="w-10 h-10 object-contain" // Kích thước và object-contain để ảnh logo không bị cắt
                  // Lưu ý: Nếu logo PNG của bạn không có màu nâu nhạt, bạn không thể thay đổi nó bằng CSS.
                  // Bạn cần chuẩn bị file PNG có màu sắc mong muốn.
              />
          
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold">Tiệm Gốm Nhà Gạo</h3>
                  <p className="text-sm text-[#F5F1EB]">Nghệ thuật gốm sứ truyền thống</p>
                </div>
              </div>
              <p className="text-[#F5F1EB] leading-relaxed">
                Chúng tôi cam kết mang đến những tác phẩm gốm sứ chất lượng cao, 
                kết hợp hài hòa giữa truyền thống và hiện đại.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-[#65604E] rounded-full flex items-center justify-center hover:bg-[#7A8471] transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#65604E] rounded-full flex items-center justify-center hover:bg-[#7A8471] transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#65604E] rounded-full flex items-center justify-center hover:bg-[#7A8471] transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-[#65604E] rounded-full flex items-center justify-center hover:bg-[#7A8471] transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.58.2 3.15-.02 4.74-.15 1.08-.5 2.07-1.1 2.95-.6.88-1.4 1.57-2.3 2.1-.9.53-1.9.9-2.95 1.1-1.05.2-2.12.2-3.18.1-1.06-.1-2.1-.3-3.1-.7-.5-.2-.95-.5-1.35-.9-.4-.4-.7-.85-.9-1.35-.4-1-.6-2.04-.7-3.1-.1-1.06-.1-2.13.1-3.18.2-1.05.57-2.05 1.1-2.95.53-.9 1.22-1.7 2.1-2.3.88-.6 1.87-.95 2.95-1.1 1.59-.22 3.16-.1 4.74-.02zm-.5 1.98c-1.25-.01-2.5.02-3.75.05-1.1.03-2.15.15-3.15.4-.8.2-1.5.5-2.15.9-.6.4-1.1.9-1.5 1.5-.4.6-.7 1.35-.9 2.15-.25 1-.37 2.05-.4 3.15-.03 1.25-.06 2.5-.05 3.75.01 1.25.04 2.5.07 3.75.03 1.1.15 2.15.4 3.15.2.8.5 1.5.9 2.15.4.6.9 1.1 1.5 1.5.6.4 1.35.7 2.15.9 1 .25 2.05.37 3.15.4 1.25.03 2.5.06 3.75.05 1.25-.01 2.5-.04 3.75-.07 1.1-.03 2.15-.15 3.15-.4.8-.2 1.5-.5 2.15-.9.6-.4 1.1-.9 1.5-1.5.4-.6.7-1.35.9-2.15.25-1 .37-2.05.4-3.15.03-1.25.06-2.5.05-3.75-.01-1.25-.04-2.5-.07-3.75-.03-1.1-.15-2.15-.4-3.15-.2-.8-.5-1.5-.9-2.15-.4-.6-.9-1.1-1.5-1.5-.6-.4-1.35-.7-2.15-.9-1-.25-2.05-.37-3.15-.4-1.25-.03-2.5-.06-3.75-.05z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Trang Chủ</a></li>
                <li><a href="/products" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Sản Phẩm</a></li>
                <li><a href="/about" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Về Chúng Tôi</a></li>
                <li><a href="/news" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Tin Tức</a></li>
                <li><a href="/contact" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Liên Hệ</a></li>
                <li><a href="/warranty" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Chính Sách Bảo Hành</a></li>
              </ul>
            </div>

            {/* Column 3 - Product Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Danh Mục Sản Phẩm</h3>
              <ul className="space-y-3">
                <li><a href="/products/bowls" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Bát Đĩa</a></li>
                <li><a href="/products/teapots" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Ấm Chén</a></li>
                <li><a href="/products/decor" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Trang Trí</a></li>
                <li><a href="/products/collections" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Bộ Sưu Tập</a></li>
                <li><a href="/products/gifts" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Quà Tặng</a></li>
                <li><a href="/products/new" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Sản Phẩm Mới</a></li>
              </ul>
            </div>

            {/* Column 4 - Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Thông Tin Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#D4AF37] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-[#F5F1EB]">123 Đường Gốm Sứ, Quận 1</p>
                    <p className="text-[#F5F1EB]">TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-[#F5F1EB]">+84 123 456 789</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[#F5F1EB]">info@tiemgomnhagao.com</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#D4AF37] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[#F5F1EB]">T2-T7: 8:00-18:00</p>
                    <p className="text-[#F5F1EB]">CN: 9:00-17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#65604E] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[#F5F1EB] text-sm">
              © 2024 Tiệm Gốm Nhà Gạo. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Chính Sách Bảo Mật</a>
              <a href="/terms" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Điều Khoản Sử Dụng</a>
              <a href="/cookies" className="text-[#F5F1EB] hover:text-white transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
