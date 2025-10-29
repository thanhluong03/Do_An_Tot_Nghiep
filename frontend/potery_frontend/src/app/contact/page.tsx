'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../layouts';
import dynamic from 'next/dynamic';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

// --- Tự động tải component Map (chỉ ở phía client) ---
const StoreMap = dynamic(() => import('../../components/map/StoreMap'), {
  ssr: false, // Không render map ở phía server
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse"></div>,
});

// --- Định nghĩa thông tin cửa hàng ---
const locations = {
  coSo1: {
    lat: 21.0360, // Tọa độ (ước tính) của 379 Xuân Phương
    lng: 105.7495,
    name: 'Tiệm Gốm Nhà Gạo cơ sở chính',
    address: '379 Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam',
  },
  coSo2: {
    lat: 21.0553, // Tọa độ (ước tính) của 146 Liên Quan, Thạch Thất
    lng: 105.5218,
    name: 'Tiệm Gốm Nhà Gạo cơ sở 2',
    address: '146 Liên Quan, Thạch Thất, Hà Nội, Việt Nam',
  },
};

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'coSo1' | 'coSo2'>('coSo1');
  const activeLocation = locations[activeTab];

  return (
    <BaseLayout>
      {/* === Hero Banner (Giống ảnh) === */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-gray-300">
        {/* THAY THẾ ẢNH NÀY: 
          Bạn cần tự thêm ảnh bìa của mình vào thư mục /public và đổi đường dẫn ở đây 
        */}
        <img
          src="./lienhe1.png" // <-- THAY ĐỔI ĐƯỜNG DẪN NÀY
          alt="Tiệm gốm Nhà Gạo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0  bg-opacity-40 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">KẾT NỐI CÙNG NHÀ GẠO</h1>
          <p className="mt-4 text-lg max-w-2xl">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ. Hãy để lại lời nhắn hoặc liên hệ trực tiếp.
          </p>
        </div>
      </div>

      {/* === Main Info Section (Giống ảnh) === */}
      <section className="bg-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-times new roman text-[#968A71] mb-4">Thông Tin Cửa Hàng</h2>
          <p className="text-lg text-[#65604E] font-light">
            Ghé thăm Nhà Gạo và trải nghiệm không gian gốm sứ đày cảm hứng
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-[#E8E5DA]">
          
          {/* === Cột Trái (Map + Tabs) === */}
          <div className="flex flex-col">
            <div className="flex border-b border-[#E8E5DA] mb-4">
              <button
                className={`py-3 px-6 font-semibold ${
                  activeTab === 'coSo1' ? 'border-b-2 border-[#8D806F] text-[#2C2A24]' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('coSo1')}
              >
                Cơ sở chính
              </button>
              <button
                className={`py-3 px-6 font-semibold ${
                  activeTab === 'coSo2' ? 'border-b-2 border-[#8D806F] text-[#2C2A24]' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('coSo2')}
              >
                Cơ sở 2
              </button>
            </div>
            
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-[#E8E5DA]">
              <StoreMap location={activeLocation} />
            </div>
          </div>

          {/* === Cột Phải (Info) === */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-semibold text-[#2C2A24] mb-4">Thông tin chi tiết</h3>
            
            {/* Địa chỉ 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <MapPin className="w-5 h-5 text-[#8D806F]" />
              </div>
              <div>
                <p className="font-semibold text-[#2C2A24]">Tiệm Gốm Nhà Gạo cơ sở chính</p>
                <p className="text-gray-600 font-light">{locations.coSo1.address}</p>
              </div>
            </div>
            
            {/* Địa chỉ 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <MapPin className="w-5 h-5 text-[#8D806F]" />
              </div>
              <div>
                <p className="font-semibold text-[#2C2A24]">Tiệm Gốm Nhà Gạo cơ sở 2</p>
                <p className="text-gray-600 font-light">{locations.coSo2.address}</p>
              </div>
            </div>

            {/* Điện thoại */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <Phone className="w-5 h-5 text-[#8D806F]" />
              </div>
              <div>
                <p className="font-semibold text-[#2C2A24]">Điện thoại</p>
                <p className="text-gray-600 font-light">(+84) 96 692 13 75</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <Mail className="w-5 h-5 text-[#8D806F]" />
              </div>
              <div>
                <p className="font-semibold text-[#2C2A24]">Email hỗ trợ</p>
                <p className="text-gray-600 font-light">tiemnhagao.xinchao@gmail.com</p>
              </div>
            </div>

            {/* Giờ mở cửa */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <Clock className="w-5 h-5 text-[#8D806F]" />
              </div>
              <div>
                <p className="font-semibold text-[#2C2A24]">Giờ mở cửa</p>
                <p className="text-gray-600 font-light">T2-T7: 8:00 - 18:00</p>
                <p className="text-gray-600 font-light">CN: 9:00 - 17:00</p>
              </div>
            </div>

            <hr className="border-[#E8E5DA]" />

            {/* Kênh liên hệ */}
            <div>
              <h4 className="text-xl font-serif font-semibold text-[#2C2A24] mb-4">Kênh liên hệ</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600 font-light">Facebook: /tiemgomnhagao</span>
                </div>
                <div className="flex items-center">
                  <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                  <span className="text-gray-600 font-light">Instagram: @tiemgomnhagao</span>
                </div>
                <div className="flex items-center">
                  {/* Dùng 1 icon TikTok SVG đơn giản */}
                  <svg className="w-5 h-5 text-black mr-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2.373A2.5 2.5 0 1 0 10 9.207V4.059A4.008 4.008 0 0 1 9 0z"/>
                  </svg>
                  <span className="text-gray-600 font-light">Tiktok: @tiemgomnhagao</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="max-w-6xl mx-auto text-center mt-16">
          <h3 className="text-3xl font-serif text-[#2C2A24]">Hãy ghé Nhà Gạo</h3>
          <p className="text-lg text-[#65604E] font-light my-4">
            Đến Tiệm Gốm Nhà Gạo để xem những sản phẩm gốm sứ đẹp và chất lượng nhất nhé!
          </p>
          <button className="bg-[#8D806F] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-[#65604E] transition duration-300">
            Khám Phá Sản Phẩm →
          </button>
        </div>
      </section>
    </BaseLayout>
  );
}