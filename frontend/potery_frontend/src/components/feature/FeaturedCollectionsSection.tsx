'use client';

import Image from 'next/image';
import React from 'react';

export const FeaturedCollectionsSection: React.FC = () => {
    const collections = [
        {
            title: 'Bát Đĩa',
            description: 'Bộ sưu tập bát đĩa cao cấp cho bữa ăn sang trọng',
            // Đảm bảo file này tồn tại trong thư mục public/special/
            image: '/special/special1.png', 
            alt: 'Bộ sưu tập Bát Đĩa',
        },
        {
            title: 'Ấm Chén',
            description: 'Bộ ấm chén trà đạo truyền thống thiểu tinh tế',
            image: '/special/special2.png',
            alt: 'Bộ sưu tập Ấm Chén',
        },
        {
            title: 'Trang Trí',
            description: 'Đồ trang trí gốm sứ nghệ thuật cho không gian',
            image: '/special/special3.png',
            alt: 'Bộ sưu tập Trang Trí',
        }
    ];

    return (
        <section className="py-20 bg-[#FBFBFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider bg-[#F5F1EB] px-4 py-1 rounded-full inline-block mb-4">
                        Sản Phẩm Nổi Bật
                    </span>
                    
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#2C2A24] mb-6 leading-tight">
                        Bộ Sưu Tập <span className="text-[#8B7D6B]">Đặc Biệt</span>
                    </h2>
                    
                    <p className="text-xl text-[#65604E] max-w-4xl mx-auto leading-relaxed">
                        Khám phá những tác phẩm tinh túy được tuyển chọn kỹ lưỡng từ xưởng gốm đến <br/>
                        <span className="text-[#2C2A24] font-medium">Tiệm Gốm Nhà Gạo</span>
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        <div key={index} className="group relative rounded-2xl overflow-hidden min-h-[400px]">
                            
                            {/* Hình ảnh */}
                            {/* Đã sửa: Xóa các class absolute thừa, thêm sizes */}
                            <Image
                                src={collection.image}
                                alt={collection.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                            
                            {/* Nội dung */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                                <h3 className="text-3xl font-serif font-bold mb-2 drop-shadow-md">
                                    {collection.title}
                                </h3>
                                
                                <p className="text-base font-light mb-6 text-gray-100 drop-shadow-sm">
                                    {collection.description}
                                </p>

                                <a
                                    href="/products"
                                    className="inline-flex items-center w-max text-base font-semibold border border-white/40 text-white bg-white/10 backdrop-blur-md 
                                             hover:bg-white hover:text-[#2C2A24] hover:border-white transition-all duration-300 rounded-full px-6 py-3 shadow-lg"
                                >
                                    <span>Xem Thêm</span>
                                    <span className="ml-2 text-xl leading-none pb-1">→</span> 
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};