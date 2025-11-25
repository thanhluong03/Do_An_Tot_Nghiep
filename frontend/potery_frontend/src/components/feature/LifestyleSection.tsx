'use client';

import React from 'react';
import { Button} from '../common/Button';
import  Image from 'next/image';
import { Link } from 'lucide-react';
// Giả sử bạn đang dùng Next.js, nên giữ lại ghi chú về Image component
// import Image from 'next/image'; 

// Dữ liệu cho 3 thẻ Lifestyle (Đã sửa Title để khớp với ảnh mẫu hơn)
const lifestyleItems = [
    {
        title: 'Bữa Ăn Gia Đình',
        description: 'Tạo không gian ấm cúng cho những bữa cơm sum vầy',
        image: '/life/life1.png', 
        alt: 'Bữa ăn gia đình'
    },
    {
        title: 'Trà đạo Thiền', // Đã sửa Title: "Trà đạo Thiền"
        description: 'Thưởng trà trong không gian tĩnh lặng, thanh tịnh',
        image: '/life/life2.png', 
        alt: 'Trà đạo'
    },
    {
        title: 'Trang Trí Nhà', // Đã sửa Title: "Trang Trí Nhà"
        description: 'Điểm tô không gian sống với nghệ thuật gốm sứ',
        image: '/life/life3.png', 
        alt: 'Trang trí nhà'
    }
];

export const LifestyleSection: React.FC = () => {
    return (
        // Màu nền chính xác theo ảnh mẫu
        <section className="py-24 bg-[#65604E] text-white"> 
            
            {/* CONTAINER GIỚI HẠN NỘI DUNG */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* Header và Quote */}
                <div className="mb-16">
                    {/* Tiêu đề nhỏ */}
                    <span className="text-sm font-medium text-[#F5F1EB] uppercase tracking-wider bg-[#8B7D6B] px-4 py-1 rounded-full inline-block mb-4">
                        Phong Cách Sống
                    </span>
                    
                    {/* Tiêu đề chính */}
                    <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-8">
                        Gốm Sứ Trong <br/> Cuộc Sống Hàng Ngày
                    </h2>
                    
                    {/* Quote */}
                    <div className="max-w-4xl mx-auto italic text-lg leading-relaxed text-[#F5F1EB]">
                        “Nghệ thuật không chỉ để ngắm nhìn mà còn để sống cùng. Mỗi sản phẩm gốm sứ đều mang trong mình một câu chuyện, một cảm xúc và một phần tâm hồn của người thợ.”
                    </div>
                    
                    {/* Tác giả Quote */}
                    <cite className="block mt-4 text-base text-[#F5F1EB]/80">
                        - Tiệm Gốm Nhà Gạo, Founder
                    </cite>
                </div>

                {/* Lifestyle Items (3 Thẻ Hình Ảnh) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {lifestyleItems.map((item, index) => (
                        <div key={index} className="group">
                            {/* Khung Hình ảnh bo tròn góc và tối ưu hóa */}
                            {/* ĐÃ SỬA: Thay đổi aspect-[3/4] (dọc) thành aspect-[4/3] (ngang) */}
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-xl">
                                
                                {/* Hình ảnh */}
                                <Image 
                                    src={item.image} 
                                    alt={item.alt} 
                                    fill
                                    className=" object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Lớp Overlay gradient mờ ở phía dưới để chữ dễ đọc */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"></div>

                                {/* Nội dung văn bản đặt trên ảnh */}
                                <div className="absolute bottom-0 left-0 p-4 text-left">
                                    <h3 className="text-xl font-semibold mb-1 text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-white/90">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                <a 
                    href="/products"
                    // Thẻ <a> bao bọc nút, sử dụng style của nút
                    className="px-8 py-3 text-lg font-semibold bg-white text-[#65604E] hover:bg-[#F5F1EB] shadow-lg transition-all duration-300 inline-flex items-center justify-center mx-auto space-x-2 rounded-lg"
                >
                    {/* Nút Button có thể chỉ là một <span> hoặc không cần thiết nếu <a> đã đủ style */}
                    <span>Khám Phá Bộ Sưu Tập</span>
                    <span className="ml-2 text-xl">→</span> 
                </a>
            </div>
                
            </div>
        </section>
    );
};