'use client';

import React from 'react';

export function NewsletterSection() {
    return (
        // Màu nền chính xác theo ảnh mẫu (Nâu vàng/Màu đất sét)
        <section className="py-20 bg-[#8E8264] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                <div className="max-w-4xl mx-auto">
                    
                    {/* Header */}
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-snug">
                        Đăng Ký Nhận Tin Tức
                    </h2>
                    
                    {/* Description */}
                    <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Cập nhật những sản phẩm mới nhất, ưu đãi đặc biệt và những câu chuyện thú vị về nghệ thuật gốm sứ
                    </p>
                    
                    {/* Input and Button */}
                    {/*
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-4">
                        <input
                            type="email"
                            placeholder="Nhập địa chỉ email của bạn"
                            // Nền trắng, bo tròn, viền nhẹ
                            className="flex-1 min-w-[300px] px-6 py-4 rounded-lg border border-white/30 focus:ring-0 focus:outline-none text-[#2C2A24] text-base placeholder-[#A67C52] shadow-md bg-white"
                        />
                        <button 
                            className="w-full sm:w-auto px-8 py-4 bg-white text-[#A67C52] font-semibold rounded-lg hover:bg-[#F5F1EB] transition-colors duration-200 shadow-md"
                        >
                            Đăng Ký Ngay
                        </button>
                    </div>
                    */}
                    {/* Checkmarks/Cam kết */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80 mb-16">
                        <div className="flex items-center space-x-1">
                            <span className="text-lg text-white">✓</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-lg text-white">✓</span>
                            <span>Không spam</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-lg text-white">✓</span>
                            <span>Hủy đăng ký bất kỳ lúc nào</span>
                        </div>
                    </div>

                    {/* Newsletter Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-10">
                        
                        {/* 1K+ Người Đăng Ký */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">1K+</div>
                            <div className="text-sm text-white/80">Người Đăng Ký</div>
                        </div>
                        
                        {/* Weekly Gửi Tin Tức */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">Weekly</div>
                            <div className="text-sm text-white/80">Gửi Tin Tức</div>
                        </div>
                        
                        {/* Exclusive Ưu đãi */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">Exclusive</div>
                            <div className="text-sm text-white/80">Ưu Đãi</div>
                        </div>
                        
                        {/* First Sản phẩm Mới */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">First</div>
                            <div className="text-sm text-white/80">Sản Phẩm Mới</div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </section>
    );
}