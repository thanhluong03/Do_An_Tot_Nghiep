'use client';

import React from 'react';
import { Button } from '../common/Button';

const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
};

export const FeaturedProductSection: React.FC = () => {
    const product = {
        name: 'Ly Tách Vàng Son',
        description: 'Tác phẩm nghệ thuật được chế tác theo phong cách tối giản hiện đại và nét vẽ truyền thống, với họa tiết tinh xảo và màu men độc đáo. Mỗi chi tiết đều được thực hiện thủ công bởi bàn tay nghệ nhân có kinh nghiệm.',
        price: 350000,
        originalPrice: 550000, 
        discountPercentage: 35, 
        rating: 4.9,
        image: './product.png', // <-- Đảm bảo đây là đường dẫn đúng đến ảnh gốc
        features: [
            'Thủ công 100% - Không máy móc',
            'Vật liệu cao cấp nhập khẩu',
            'Bảo hành 1 đổi 1 kèm voucher',
            'Giao hàng miễn phí toàn quốc'
        ]
    };

    return (
        <section className="bg-[#FBFBFB] pt-16 pb-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative"> 
                    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
                        
                        {/* Left - Product Image Area */}
                        <div className="relative p-4 lg:p-6">
                            
                            {/* Khối hình ảnh chính (Tấm thẻ) - Đã sửa để crop hình ảnh bên trong */}
                            <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-xl bg-white"> 
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    // object-cover sẽ lấp đầy khung và crop các cạnh
                                    // object-position-center là mặc định, nhưng bạn có thể thay đổi để crop theo ý muốn
                                    // Ví dụ: object-position-top, object-position-bottom, object-position-[25%_75%]
                                    className="w-full h-full object-cover object-center" // <-- Quay lại object-cover, dùng object-center (mặc định)
                                />
                                
                                {/* Product Tag - Sản Phẩm Mới */}
                                <div className="absolute top-4 right-4 bg-[#8B7D6B] text-white px-3 py-1 rounded-md text-sm font-medium z-10">
                                    Sản Phẩm Mới
                                </div>

                                {/* Decorative Text (YOUR SWEET) */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-gray-200 text-opacity-50 text-xl font-bold tracking-widest transform rotate-[-90deg] translate-x-[-120px] select-none">
                                        YOUR SWEET
                                    </p>
                                </div>
                                
                            </div>
                            
                            {/* Rating Badge */}
                            <div className="absolute -bottom-2 -left-2 bg-white rounded-xl p-3 shadow-xl z-20">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#2C2A24] mb-0.5 leading-none">{product.rating}</div>
                                    <div className="flex justify-center text-yellow-500 space-x-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Nút điều hướng */}
                            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer">
                                <span className="text-xl text-gray-700">←</span>
                            </div>
                            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer">
                                <span className="text-xl text-gray-700">→</span>
                            </div>

                        </div>

                        {/* Right - Product Details */}
                        <div className="p-4 lg:p-0 flex flex-col justify-center">
                            <h1 className="text-4xl font-serif font-bold text-[#2C2A24] mb-4">
                                {product.name}
                            </h1>
                            
                            <p className="text-sm text-[#65604E] leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {product.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="w-1.5 h-1.5 bg-[#8B7D6B] rounded-full flex-shrink-0"></div> 
                                        <span className="text-sm text-[#65604E]">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <div className="flex items-baseline space-x-3">
                                    <span className="text-4xl font-bold text-[#2C2A24]">
                                        {formatPrice(product.price)}
                                    </span>
                                    
                                    <span className="text-xl text-[#65604E] line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                    
                                    <span className="bg-[#E96666] text-white px-2 py-0.5 rounded text-xs font-medium inline-block">
                                        Giảm {product.discountPercentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <a
                                    href="#"
                                    className="flex-1 bg-[#8B7D6B] text-white hover:bg-[#65604E] px-6 py-3 text-base font-semibold rounded-lg text-center transition"
                                >
                                    Mua Ngay
                                </a>
                                <a
                                    href="#"
                                    className="flex-1 border border-[#8B7D6B] text-[#8B7D6B] hover:bg-[#F5F1EB] px-6 py-3 text-base font-semibold rounded-lg text-center flex items-center justify-center space-x-2 transition"
                                >
                                    <span>Thêm Vào Giỏ Hàng</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};