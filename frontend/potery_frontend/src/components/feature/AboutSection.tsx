'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../common/Button';
// Bạn cần đảm bảo component Button đã được import

// Component cho các giá trị cốt lõi (Tâm Huyết, Thân Thiện)
const CoreValueCard: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
    <div className="text-center p-6 bg-[#F5F1EB] rounded-xl shadow-sm">
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-white shadow-md">
            {/* Sử dụng Icon thực tế hoặc SVG, tạm dùng emoji */}
            <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-[#2C2A24] mb-2">{title}</h3>
        <p className="text-sm text-[#65604E]">{description}</p>
    </div>
);

export const AboutSection: React.FC = () => {
    const imageRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const [imageInView, setImageInView] = useState(false);
    const [textInView, setTextInView] = useState(false);

    useEffect(() => {
        // If IntersectionObserver is not available (SSR or older browsers), show content
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setImageInView(true);
            setTextInView(true);
            return;
        }

        const imgEl = imageRef.current;
        const txtEl = textRef.current;

        const options: IntersectionObserverInit = {
            root: null,
            rootMargin: '0px',
            threshold: 0.18, // when ~18% visible
        };

        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setImageInView(true);
                else setImageInView(false);
            });
        }, options);

        const txtObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setTextInView(true);
                else setTextInView(false);
            });
        }, options);

        if (imgEl) imgObserver.observe(imgEl);
        if (txtEl) txtObserver.observe(txtEl);

        return () => {
            if (imgEl) imgObserver.unobserve(imgEl);
            if (txtEl) txtObserver.unobserve(txtEl);
            imgObserver.disconnect();
            txtObserver.disconnect();
        };
    }, []);
    const ANIMATION_DISTANCE = 100; // px - how far elements start from
    const ANIMATION_DURATION = 2000; // ms (slower than before)

    const transitionStyle = (direction: 'fromLeft' | 'fromRight', inView: boolean) => ({
        transform: inView
            ? 'translateX(0px)'
            : direction === 'fromLeft'
                ? `translateX(-${ANIMATION_DISTANCE}px)`
                : `translateX(${ANIMATION_DISTANCE}px)`,
        opacity: inView ? 1 : 0,
        transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease-out`,
    } as React.CSSProperties);

    return (
        // Điều chỉnh padding top/bottom để khớp với ảnh mẫu (giảm khoảng cách trên/dưới)
        <section className="py-16 bg-white">
            {/* CONTAINER GIỚI HẠN NỘI DUNG */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Bố cục chia 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* CỘT TRÁI: Hình Ảnh Lớn */}
                    <div className="relative" ref={imageRef} style={transitionStyle('fromLeft', imageInView)}>
                        {/* Box chứa hình ảnh lớn và hiệu ứng mờ */}
                        {/* Hình ảnh nền */}
                        <img
                            src="./tiemgom.jpg" // Thay thế bằng hình ảnh phù hợp với ảnh mẫu
                            alt="Pottery Workshop"
                            className="w-full h-full object-cover rounded-lg"
                        />

                        {/* Thẻ 3+ NĂM (Absolute) */}
                        <div className="absolute -top-6 -left-6 bg-[#F5F1EB] p-4 rounded-xl shadow-lg text-center">
                            <div className="text-xl font-bold text-[#2C2A24]">3+</div>
                            <div className="text-sm text-[#65604E]">Năm</div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Nội dung Văn bản và CTA */}
                    <div className="space-y-6" ref={textRef} style={transitionStyle('fromRight', textInView)}>

                        {/* Tiêu đề nhỏ */}
                        <span className="text-sm font-medium text-[#8B7D6B] tracking-wider bg-[#F5F3EF] px-3 py-1 rounded-full">
                            Câu Chuyện Về Nhà Gạo
                        </span>

                        {/* Tiêu đề chính */}
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] leading-tight">
                            Nơi Truyền Thống <br /> Gặp Gỡ Hiện Đại
                        </h2>

                        {/* Đoạn mô tả */}
                        <p className="text-base text-[#65604E] leading-relaxed">
                            Tiệm Gốm Nhà Gạo ra đời từ niềm đam mê với nghệ thuật gốm sứ truyền thống Việt Nam.
                            Chúng tôi kết hợp kỹ thuật thủ công cổ truyền với thiết kế đương đại, tạo nên những sản phẩm độc đáo mang đậm dấu ấn văn hóa.
                        </p>
                        <p className="text-base text-[#65604E] leading-relaxed">
                            Mỗi sản phẩm đều được chế tác tỉ mỉ bởi những nghệ nhân có kinh nghiệm, từ việc chọn đất sét, tạo hình, trang trí cho đến nung thiêu, tất cả đều được thực hiện theo quy trình truyền thống.
                        </p>

                        {/* Core Values (Giá trị cốt lõi) */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="text-center p-6 bg-[#F5F1EB] rounded-xl shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-[#7A6D44] shadow-md border-2 border-[#8B7D6B]/50">
                                    <span className="text-xl text-[#8B7D6B] font-bold">
                                        <img
                                            src="./handheart.png" // <--- Thay thế bằng URL/đường dẫn của ảnh PNG thực tế
                                            alt="Tâm huyết"
                                            className="w-6 h-6 inline-block" // Điều chỉnh kích thước (w-6 h-6 thường phù hợp với text-xl)
                                        />
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C2A24] mb-1">Tâm Huyết</h3>
                                <p className="text-sm text-[#65604E]">Mỗi sản phẩm là một niềm tự hào</p>
                            </div>

                            <div className="text-center p-6 bg-[#F5F1EB] rounded-xl shadow-sm">
                                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-[#7A6D44] shadow-md border-2 border-[#8B7D6B]/50">
                                    <span className="text-xl text-[#8B7D6B] font-bold">
                                        <img
                                            src="./leaf.png" // <--- Thay thế bằng URL/đường dẫn của ảnh PNG thực tế
                                            alt="Tâm huyết"
                                            className="w-6 h-6 inline-block" // Điều chỉnh kích thước (w-6 h-6 thường phù hợp với text-xl)
                                        />
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C2A24] mb-1">Thân Thiện</h3>
                                <p className="text-sm text-[#65604E]">Vật liệu tự nhiên, thân thiện</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                            <Button
                                size="lg"
                                className="px-8 py-3 text-lg font-semibold bg-[#8B7D6B] text-white hover:bg-[#65604E] shadow-lg transition-all duration-300 flex items-center space-x-2"
                            >
                                <a href='/about'>Tìm Hiểu Thêm Về Chúng Tôi</a>
                                <span></span>
                                {/* Icon mũi tên sang phải (Giả sử dùng emoji hoặc SVG) */}
                                <span className="ml-2 text-xl">→</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};