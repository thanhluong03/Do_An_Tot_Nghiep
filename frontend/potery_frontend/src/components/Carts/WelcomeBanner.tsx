import Image from 'next/image';
import React from 'react';

const WelcomeBanner: React.FC<{ name: string }> = ({ name }) => {
    return (
        <div className="relative bg-gradient-to-r from-[#B95D26] to-orange-500 rounded-xl p-6 flex items-center justify-between">
  {/* Text content */}
  <div className="text-white max-w-lg">
    <h2 className="text-2xl font-bold mb-2">
      Chào mừng trở lại, Mai Ngọc!
    </h2>
    <p className="mb-4">
      Hôm nay bạn có <span className="font-semibold">12 đơn hàng mới</span> và{" "}
      <span className="font-semibold">3 sản phẩm</span> cần được bổ sung kho.
    </p>
    <div className="flex gap-3">
      <button title="Xem đơn hàng mới" className="bg-white text-[#B95D26] px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-100">
        Xem đơn hàng mới
      </button>
      <button className="bg-[#B95D26] text-white px-4 py-2 border-amber-50 border rounded-md font-semibold shadow hover:bg-orange-800">
        Quản lý kho
      </button>
    </div>
  </div>

  {/* Image (Ảnh gốm) */}
  <div className="w-1/3">
    <div className="relative w-full h-40 md:h-48 lg:h-56">
      <Image
        src="/images/bannerImg.jpg"
        alt="Ceramic Pots"
        fill
        className="rounded-xl object-cover"
      />
    </div>
  </div>
</div>

    );
}

export default WelcomeBanner;