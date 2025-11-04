'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../common/Button';

export const HeroSection: React.FC = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Slight delay so animation is noticeable on page load
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    return (
        <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#FBFBFB]">
            {/* Background Decorative Circles - ĐÃ CĂN CHỈNH VỊ TRÍ để khớp với ảnh */}
            <div className="absolute inset-0">
                {/* Chấm tròn to góc trên phải (be) - Đã thay đổi màu và vị trí để khớp với ảnh */}
                <div className="absolute top-20 right-16 w-36 h-36 bg-[#F0EEE8] rounded-full opacity-100"></div>
                {/* Chấm tròn góc dưới (be) - Đã thay đổi vị trí */}
                <div className="absolute bottom-20 left-2/4 w-32 h-32 bg-[#F1EFEA] rounded-full opacity-100"></div>
                {/* Chấm tròn góc dưới phải (be) */}
                <div className="absolute bottom-8 right-20 w-16 h-16 bg-[#F5F1EB] rounded-full opacity-60"></div>
            </div>

            {/* CONTAINER CHÍNH - KHUNG GIỚI HẠN NỘI DUNG */}
            {/* Loại bỏ padding ngang (px-*) ở đây và thêm vào cột nội dung bên trong */}
            <div className="relative z-10 w-full max-w-screen-xl mx-auto">
                {/* GRID CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative py-12 lg:py-8">
                    {/* Left Content - CỘT VĂN BẢN VÀ STATS */}
                    {/* Thêm padding ngang để căn chỉnh nội dung với lề chuẩn */}
                    <div
                        className={`space-y-8 px-4 sm:px-6 lg:pl-6 lg:pr-0 lg:-ml-12 transform ${mounted ? 'enter-up' : 'opacity-0'
                            }`}
                    >
                        {/* Small Title - Đã sửa nội dung và màu */}
                        <div className="inline-block">
                            <span className="text-sm font-medium text-[#7E735E] tracking-wider bg-[#F5F3EF] px-3 py-1 rounded-full">
                                Truyền thống và hiện đại
                            </span>
                        </div>

                        {/* Main Heading - Đã sửa màu và cấu trúc để khớp ảnh */}
                        <div className="space-y-4">
                            <h1 className="text-sm md:text-5xl lg:text-6xl font-serif font-bold text-[#0B2430] leading-tight inline">
                                Nghệ Thuật
                                <span className="block text-[#8B7D6B]">Gốm Sứ</span>
                                <span className="block text-[#0B2430]">Đương Đại</span>
                            </h1>
                            <p className="text-base md:text-lg text-[#6B6A64] leading-relaxed max-w-lg mt-10">
                                Khám phá bộ sưu tập gốm sứ thủ công độc đáo, nơi truyền thống gặp gỡ hiện đại trong từng đường nét tinh tế.
                            </p>
                        </div>

                        {/* CTA Buttons - Đã sửa màu và cấu trúc */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="px-6 py-3 text-base font-semibold bg-[#8B7D6B] text-white hover:bg-[#6d614f] shadow-md transition-all duration-300 rounded-full"
                            >
                                <Link href="/products">Khám Phá Bộ Sưu Tập</Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-6 py-3 text-base font-semibold border-2 border-[#DDD1C2] text-[#7B6E58] hover:bg-[#F7F4EF] transition-all duration-300 rounded-full flex items-center space-x-2"
                            >
                                <span>Xem Video Giới Thiệu</span>
                                <Image src="/play.png" alt="Play" width={16} height={16} className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Stats - Đã sửa giá trị và loại bỏ border top */}
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                                <div className="text-2xl md:text-3xl font-bold text-[#0B2430]">50+</div>
                                <div className="text-sm text-[#6B6A64]">Sản Phẩm</div>
                            </div>
                            <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                                <div className="text-2xl md:text-3xl font-bold text-[#0B2430]">3+</div>
                                <div className="text-sm text-[#6B6A64]">Năm Kinh Nghiệm</div>
                            </div>
                            <div className="text-left"> {/* Căn trái theo ảnh mẫu */}
                                <div className="text-2xl md:text-3xl font-bold text-[#0B2430]">500+</div>
                                <div className="text-sm text-[#6B6A64]">Khách Hàng</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - CỘT HÌNH ẢNH */}
                    {/* Đẩy hình ảnh sát lề phải của khung max-w-screen-xl, loại bỏ padding trái trên lg */}
                    <div className="relative flex justify-center lg:justify-end pr-4 sm:pr-6 lg:pr-8">
                        {/* Main Product Image Circle - responsive max 420px */}
                        <div className="relative w-[280px] h-[280px] sm:w-[280px] sm:h-[280px] md:w-[420px] md:h-[420px] lg:w-[380px] lg:h-[380px] mx-auto lg:mx-0">
                            {/* Group both background and image inside a single animated parent so they move exactly together */}
                            <div className="float-group relative w-full h-full">
                                <div className="absolute inset-0 bg-[#EBE4D9] rounded-full opacity-60 transform -translate-x-6 lg:-translate-x-10"></div>

                                <div className="relative w-full h-full rounded-full shadow-xl flex items-center justify-center overflow-hidden transform -translate-x-6 lg:-translate-x-10">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image src="/pott.png" alt="Pottery" fill className="object-cover rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quality Badge (Chất lượng 100%) - Thẻ thông tin mới, định vị absolute */}
                        <div className="absolute top-20 lg:top-24 lg:-right-10 transform z-20 bg-white rounded-xl shadow-2xl p-5 w-56 text-center border border-gray-100">
                            <div className="mb-2 mx-auto">
                                <Image
                                    src="/medal-star.svg"
                                    alt="Chất lượng 100%"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 mx-auto"
                                />
                            </div>
                            <div className="text-sm font-semibold text-[#0B2430] mb-1">Chất lượng 100%</div>
                            <p className="text-sm text-[#6B6A64]">Được chế tác tỉ mỉ và tận tâm</p>
                        </div>

                    </div>

                    {/* Các Decorative Elements cũ đã bị xóa vì không có trong ảnh mẫu */}
                </div>
                {/* HẾT GRID CONTAINER */}

            </div>
            {/* HẾT CONTAINER CHÍNH */}

            {/* Scoped styles for the floating/bounce animation. Respects prefers-reduced-motion. */}
            <style jsx>{`
                @keyframes floatUp {
                    0% { transform: translateY(0px) rotate(0deg); }
                    20% { transform: translateY(-20px) rotate(-0.8deg); }
                    50% { transform: translateY(0px) rotate(0deg); }
                    80% { transform: translateY(-12px) rotate(0.6deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }

                .float-group {
                    /* Animate the group so background and image move perfectly in sync */
                    animation: floatUp 3.6s ease-in-out infinite;
                    will-change: transform;
                }

                    /* Entry animation for left content: slide up + fade in */
                    @keyframes enterUp {
                        /* start a bit lower so the motion feels longer/slower */
                        from { transform: translateY(36px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    .enter-up {
                        /* Slower and smoother: 2000ms (2s) with a soft ease-out */
                        animation: enterUp 2000ms cubic-bezier(0.22, 1, 0.36, 1) both;
                    }

                /* Respect users who prefer reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .float-group {
                        animation: none !important;
                    }
                        .enter-up {
                            animation: none !important;
                        }
                }
            `}</style>

            {/* Scroll Indicator - Đã xóa vì không có trong ảnh mẫu */}
        </section>
    );
};
