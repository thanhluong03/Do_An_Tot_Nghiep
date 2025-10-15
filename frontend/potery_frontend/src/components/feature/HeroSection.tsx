'use client';

import React from 'react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBFBFB]">
    {/* Background Decorative Circles - ĐÃ CĂN CHỈNH VỊ TRÍ để khớp với ảnh */}
    <div className="absolute inset-0">
        {/* Chấm tròn to góc trên trái (be) */}
        <div className="absolute top-16 left-8 w-32 h-32 bg-[#F5F1EB] rounded-full opacity-60"></div>
        {/* Chấm tròn to góc trên phải (be) - Đã thay đổi màu và vị trí để khớp với ảnh */}
        <div className="absolute top-20 right-16 w-36 h-36 bg-[#EBE4D9] rounded-full opacity-100"></div> 
        {/* Chấm tròn góc dưới (be) - Đã thay đổi vị trí */}
        <div className="absolute bottom-16 left-1/3 w-32 h-32 bg-[#EBE4D9] rounded-full opacity-100"></div>
        {/* Chấm tròn góc dưới phải (be) */}
        <div className="absolute bottom-8 right-20 w-16 h-16 bg-[#F5F1EB] rounded-full opacity-60"></div>
    </div>

    {/* CONTAINER CHÍNH - KHUNG GIỚI HẠN NỘI DUNG */}
    {/* Loại bỏ padding ngang (px-*) ở đây và thêm vào cột nội dung bên trong */}
    <div className="relative z-10 w-full max-w-screen-xl mx-auto"> 
        
        {/* GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative py-20 lg:py-0"> 
            {/* Left Content - CỘT VĂN BẢN VÀ STATS */}
            {/* Thêm padding ngang để căn chỉnh nội dung với lề chuẩn */}
            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                
                {/* Small Title - Đã sửa nội dung và màu */}
                <div className="inline-block">
                    <span className="text-sm font-medium text-[#65604E] uppercase tracking-wider bg-transparent">
                        Truyền thống và hiện đại
                    </span>
                </div>

                {/* Main Heading - Đã sửa màu và cấu trúc để khớp ảnh */}
                <div className="space-y-4">
                    <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#2C2A24] leading-tight inline">
                        Nghệ Thuật 
                        <span className="block text-[#65604E] ">Gốm Sứ</span>
                        <span className="block text-[#2C2A24]">Đương Đại</span>
                    </h1>
                    <p className="text-base md:text-lg text-[#65604E] leading-relaxed max-w-md">
                        Khám phá bộ sưu tập gốm sứ thủ công độc đáo, nơi truyền thống gặp gỡ hiện đại trong từng đường nét tinh tế.
                    </p>
                </div>

                {/* CTA Buttons - Đã sửa màu và cấu trúc */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        size="lg"
                        className="px-8 py-3 text-base font-semibold bg-[#8B7D6B] text-white hover:bg-[#65604E] shadow-lg transition-all duration-300"
                    >
                        Khám Phá Bộ Sưu Tập
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-3 text-base font-semibold border-2 border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#F5F1EB] transition-all duration-300 flex items-center space-x-2"
                    >
                        <span>Xem Video Giới Thiệu</span>
                        <img src="./play.png" alt="Play" className="w-4 h-4" /> {/* Giả sử bạn có icon Play */}
                    </Button>
                </div>

                {/* Stats - Đã sửa giá trị và loại bỏ border top */}
                <div className="grid grid-cols-3 gap-8 pt-8">
                    <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                        <div className="text-3xl font-bold text-[#2C2A24]">50+</div>
                        <div className="text-sm text-[#65604E]">Sản Phẩm</div>
                    </div>
                    <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                        <div className="text-3xl font-bold text-[#2C2A24]">3+</div>
                        <div className="text-sm text-[#65604E]">Năm Kinh Nghiệm</div>
                    </div>
                    <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                        <div className="text-3xl font-bold text-[#2C2A24]">500+</div>
                        <div className="text-sm text-[#65604E]">Khách Hàng</div>
                    </div>
                </div>
            </div>

            {/* Right Content - CỘT HÌNH ẢNH */}
            {/* Đẩy hình ảnh sát lề phải của khung max-w-screen-xl, loại bỏ padding trái trên lg */}
            <div className="relative flex justify-center lg:justify-end pr-4 sm:pr-6 lg:pr-8">
                {/* Main Product Image Circle */}
                {/* Giữ nguyên kích thước và đảm bảo căn phải trên lg */}
                <div className="relative w-[450px] h-[450px] mx-auto lg:mx-0"> 
                    {/* Circle Background - Đã xóa opacity: 20 và điều chỉnh màu */}
                    <div className="absolute inset-0 bg-[#EBE4D9] rounded-full opacity-60"></div>
                    <div className="relative w-full h-full rounded-full shadow-xl flex items-center justify-center overflow-hidden">
                        <img src="./pott.png" alt="Pottery" className="w-full h-full object-cover rounded-full" />
                    </div>
                </div>
                
                {/* Quality Badge (Chất lượng 100%) - Thẻ thông tin mới, định vị absolute */}
                <div className="absolute top-1/2 -left-16 lg:left-auto lg:-right-8 transform -translate-y-1/2 z-20 
                                bg-white rounded-xl shadow-2xl p-6 w-56 text-center border border-gray-100">
                    <div className="text-4xl text-[#8B7D6B] mb-2 mx-auto">
                       <img 
                            src="./medal-star.svg" // Đường dẫn tuyệt đối từ thư mục gốc (public)
                            alt="Chất lượng 100%"
                            className="w-10 h-10 mx-auto" // Điều chỉnh kích thước và căn giữa
                            // Lưu ý: Icon SVG dùng thẻ <img> không thể tự động đổi màu theo text-[#8B7D6B] bằng CSS.
                            // Bạn cần đảm bảo file SVG đã có màu sẵn (hoặc dùng SVG inline nếu muốn đổi màu bằng CSS).
                        />
                    </div>
                    <div className="text-base font-semibold text-[#2C2A24] mb-1">Chất lượng 100%</div>
                    <p className="text-sm text-[#65604E]">Được chế tác tỉ mỉ và tận tâm</p>
                </div>

            </div>
            
            {/* Các Decorative Elements cũ đã bị xóa vì không có trong ảnh mẫu */}
        </div>
        {/* HẾT GRID CONTAINER */}
        
    </div>
    {/* HẾT CONTAINER CHÍNH */}

    {/* Scroll Indicator - Đã xóa vì không có trong ảnh mẫu */}
</section>
  );
};
