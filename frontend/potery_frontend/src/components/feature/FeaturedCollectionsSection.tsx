'use client';

import Image from 'next/image';
import React from 'react';
// Nếu bạn có component Button, bạn có thể cân nhắc dùng nó, nhưng ở đây tôi dùng thẻ <a> để đơn giản hóa CTA
// import { Button } from '../common/Button'; 

export const FeaturedCollectionsSection: React.FC = () => {
    const collections = [
        {
            title: 'Bát Đĩa',
            description: 'Bộ sưu tập bát đĩa cao cấp cho bữa ăn sang trọng',
            image: './special/special1.png', // Thay thế bằng đường dẫn hình ảnh thực tế
            alt: 'Bộ sưu tập Bát Đĩa',
        },
        {
            title: 'Ấm Chén',
            description: 'Bộ ấm chén trà đạo truyền thống thiểu tinh tế',
            image: './special/special2.png', // Thay thế bằng đường dẫn hình ảnh thực tế
            alt: 'Bộ sưu tập Ấm Chén',
        },
        {
            title: 'Trang Trí',
            description: 'Đồ trang trí gốm sứ nghệ thuật cho không gian',
            image: './special/special3.png', // Thay thế bằng đường dẫn hình ảnh thực tế
            alt: 'Bộ sưu tập Trang Trí',
        }
    ];

    return (
        // Màu nền trắng nhẹ (FBFBFB) và padding trên/dưới lớn hơn một chút
        <section className="py-20 bg-[#FBFBFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-16">
                    {/* Tiêu đề nhỏ: Màu be nhạt và chữ nâu */}
                    <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider bg-[#F5F1EB] px-4 py-1 rounded-full inline-block mb-4">
                        Sản Phẩm Nổi Bật
                    </span>
                    
                    {/* Tiêu đề chính: Font Serif và màu nâu đậm */}
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#2C2A24] mb-6 leading-tight">
                        Bộ Sưu Tập <span className="text-[#8B7D6B]">Đặc Biệt</span>
                    </h2>
                    
                    {/* Mô tả */}
                    <p className="text-xl text-[#65604E] max-w-4xl mx-auto leading-relaxed">
                        Khám phá những tác phẩm tinh túy được tuyển chọn kỹ lưỡng từ xưởng gốm đến <br/>
                        <span className="text-[#2C2A24] font-medium">Tiệm Gốm Nhà Gạo</span>
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        // Thẻ ngoài không có shadow, chỉ có bo góc lớn (rounded-2xl)
                        <div key={index} className="group relative rounded-2xl overflow-hidden min-h-[400px]">
                            
                            {/* Hình ảnh (Toàn bộ thẻ là hình ảnh) */}
                            <Image
                                src={collection.image}
                                alt={collection.alt}
                                // Sử dụng h-full object-cover để lấp đầy toàn bộ thẻ
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {/* Lớp Overlay tối nhẹ (chỉ ở dưới cùng) để làm nổi bật văn bản */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                            
                            {/* Nội dung (Text và Button) */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                                
                                {/* Tiêu đề */}
                                <h3 className="text-3xl font-serif font-bold mb-2">
                                    {collection.title}
                                </h3>
                                
                                {/* Mô tả */}
                                <p className="text-base font-light mb-6">
                                    {collection.description}
                                </p>

                                {/* Nút "Xem Thêm" */}
                                <a
                                    href="/products"
                                    className="inline-flex items-center w-max text-base font-semibold border-2 border-white text-white bg-white/20 backdrop-blur-sm 
                                       hover:bg-white hover:text-[#2C2A24] transition-all duration-300 rounded-full px-6 py-3"
                                >
                                    <span>Xem Thêm</span>
                                    {/* Mũi tên phải */}
                                    <span className="ml-2 text-xl">→</span> 
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};