'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../layouts';
import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('../../components/map/StoreMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse"></div>,
});

const locations = {
  coSo1: {
    lat: 21.0360,
    lng: 105.7495,
    name: 'Tiệm Gốm Nhà Gạo cơ sở chính',
    address: '379 Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam',
  },
  coSo2: {
    lat: 21.0553,
    lng: 105.5218,
    name: 'Tiệm Gốm Nhà Gạo cơ sở 2',
    address: '146 Liên Quan, Thạch Thất, Hà Nội, Việt Nam',
  },
};

// 🖼️ đường dẫn icon — bạn thay ảnh ở đây tuỳ ý
const icons = {
  mapPin: '/icons/map-pin.png',
  phone: '/icons/phone.png',
  mail: '/icons/mail.png',
  clock: '/icons/clock.png',
  facebook: '/icons/facebook.png',
  instagram: '/icons/instagram.png',
  tiktok: '/icons/tiktok.png',
};

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'coSo1' | 'coSo2'>('coSo1');
  const activeLocation = locations[activeTab];

  return (
    <BaseLayout>
      {/* === Hero Banner === */}
      <div className="relative w-full h-[320px] md:h-[420px]">
        <img
          src="./lienhe1.png"
          alt="Tiệm gốm Nhà Gạo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wide drop-shadow-lg">
            KẾT NỐI CÙNG NHÀ GẠO
          </h1>
          <p className="mt-4 text-lg max-w-2xl leading-relaxed font-light">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ. Hãy để lại lời nhắn hoặc liên hệ trực tiếp.
          </p>
        </div>
      </div>

      {/* === Main Section === */}
      <section className="bg-[#FAF7F2] py-20 px-4 sm:px-8 lg:px-12">
        {/* === Tiêu đề === */}
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-[32px] md:text-[36px] font-['Times_New_Roman',serif] font-bold text-[#8D806F] mb-2">
            Thông Tin Cửa Hàng
          </h2>
          <p className="text-[16px] md:text-[17px] text-[#4B4B4B] font-light">
            Ghé thăm Nhà Gạo và trải nghiệm không gian gốm sứ đầy cảm hứng
          </p>
        </div>

        {/* === Khối nội dung chính (Map + Info) === */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* === Card 1: Bản đồ === */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-[#E8E5DA] flex flex-col justify-between">
            <h3 className="text-xl font-semibold text-[#8D806F] mb-2">Tiệm Gốm Nhà Gạo</h3>
            <p className="text-[#65604E] mb-4">Cơ sở chính</p>

            <div className="flex border-b border-[#E8E5DA] mb-5">
              <button
                className={`py-2 px-4 font-medium transition-all ${
                  activeTab === 'coSo1'
                    ? 'border-b-2 border-[#8D806F] text-[#2C2A24]'
                    : 'text-gray-500 hover:text-[#2C2A24]'
                }`}
                onClick={() => setActiveTab('coSo1')}
              >
                Cơ sở chính
              </button>
              <button
                className={`py-2 px-4 font-medium transition-all ${
                  activeTab === 'coSo2'
                    ? 'border-b-2 border-[#8D806F] text-[#2C2A24]'
                    : 'text-gray-500 hover:text-[#2C2A24]'
                }`}
                onClick={() => setActiveTab('coSo2')}
              >
                Cơ sở 2
              </button>
            </div>

            <div className="w-full aspect-[5/3] rounded-lg overflow-hidden border border-[#E8E5DA]">
              <StoreMap location={activeLocation} />
            </div>
          </div>

          {/* === Card 2: Thông tin chi tiết === */}
          <div className="bg-white p-8 md:p-9 rounded-xl shadow-sm border border-[#E8E5DA] text-left">
            <h3 className="text-[17px] font-serif font-semibold text-[#2C2A24] mb-5">
              Thông tin chi tiết
            </h3>

            <div className="space-y-4">
              {[locations.coSo1, locations.coSo2].map((loc, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-[#F6F3EF] p-2.5 rounded-full mt-[3px] shrink-0">
                    <img src='/location.png' alt="map" className="w-4 h-4 object-contain" />
                  </div>
                  <div className="leading-[1.5]">
                    <p className="font-serif font-semibold text-[#8D806F] text-[15px]">
                      {loc.name}
                    </p>
                    <p className="text-[15px] text-[#4B4B4B] font-light">
                      {loc.address}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <div className="bg-[#F6F3EF] p-2.5 rounded-full mt-[3px] shrink-0">
                  <img src='/phone.png' alt="phone" className="w-4 h-4 object-contain" />
                </div>
                <div className="leading-[1.5]">
                  <p className="font-medium text-[#2C2A24] text-[15px]">Điện thoại</p>
                  <p className="text-[15px] text-[#4B4B4B] font-light">(+84) 96 692 13 75</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[#F6F3EF] p-2.5 rounded-full mt-[3px] shrink-0">
                  <img src='/envelope.png' alt="mail" className="w-4 h-4 object-contain" />
                </div>
                <div className="leading-[1.5]">
                  <p className="font-medium text-[#2C2A24] text-[15px]">Email Hỗ trợ</p>
                  <p className="text-[15px] text-[#4B4B4B] font-light">
                    tiemnhagao.xinchao@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[#F6F3EF] p-2.5 rounded-full mt-[3px] shrink-0">
                  <img src='/clock.png' alt="clock" className="w-4 h-4 object-contain" />
                </div>
                <div className="leading-[1.5]">
                  <p className="font-medium text-[#2C2A24] text-[15px]">Giờ mở cửa</p>
                  <p className="text-[15px] text-[#4B4B4B] font-light">T2-T7: 8:00 - 18:00</p>
                  <p className="text-[15px] text-[#4B4B4B] font-light">CN: 9:00 - 17:00</p>
                </div>
              </div>
            </div>

            <hr className="border-[#E8E5DA] my-5" />

            <div>
              <h4 className="text-[15px] font-serif font-semibold text-[#2C2A24] mb-3">
                Kênh liên hệ
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="bg-[#968A71] p-2.5 rounded-full mr-2 flex items-center justify-center shrink-0">
                    <img src="/facebook.png" alt="fb" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-[15px] text-[#4B4B4B] font-light">
                    Facebook: /tiemgomnhagao
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="bg-[#2C3745] p-2.5 rounded-full mr-2 flex items-center justify-center shrink-0">
                    <img src="/ig1.png" alt="ig" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-[15px] text-[#4B4B4B] font-light">
                    Instagram: @tiemgomnhagao
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="bg-[#2C3745] p-2.5 rounded-full mr-2 flex items-center justify-center shrink-0">
                    <img src="/tiktok1.png" alt="tiktok" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-[15px] text-[#4B4B4B] font-light">
                    Tiktok: @tiemgomnhagao
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>

        {/* === CTA === */}
        <div className="max-w-6xl mx-auto text-center mt-20">
          <h3 className="text-3xl font-serif text-[#2C2A24] mb-3">Hãy ghé Nhà Gạo</h3>
          <p className="text-lg text-[#65604E] font-light mb-6">
            Đến Tiệm Gốm Nhà Gạo để xem những sản phẩm gốm sứ đẹp và chất lượng nhất nhé!
          </p>
          <button className="bg-[#8D806F] text-white font-semibold px-10 py-3 rounded-2xl shadow-md hover:bg-[#6F6558] transition duration-300">
            <a href='/products'>Khám Phá Sản Phẩm →</a>
          </button>
        </div>
      </section>
    </BaseLayout>
  );
}
