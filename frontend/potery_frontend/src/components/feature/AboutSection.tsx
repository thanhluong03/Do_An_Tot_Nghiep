'use client';

import React from 'react';
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
    return (
        // Điều chỉnh padding top/bottom để khớp với ảnh mẫu
        <section className="py-24 bg-white"> 
            {/* CONTAINER GIỚI HẠN NỘI DUNG */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Bố cục chia 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* CỘT TRÁI: Hình Ảnh Lớn */}
                    <div className="relative">
                        {/* Box chứa hình ảnh lớn và hiệu ứng mờ */}
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl">
                            
                            {/* Hình ảnh nền */}
                            <img 
                                src="./about.png" // Thay thế bằng hình ảnh phù hợp với ảnh mẫu
                                alt="Pottery Workshop" 
                                className="w-full h-full object-cover"
                            />

                            {/* Lớp Overlay xám mờ (opacity) */}
                            <div className="absolute inset-0 bg-[#65604E] opacity-50"></div>
                            
                            {/* Nội dung tĩnh trên lớp overlay (DON'T MISS IT, CHÚNG MÌNH CÓ HẸN, DECEMBER 01...) */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                                <span className="text-xs tracking-widest text-white/80 uppercase mb-4 opacity-50">DON'T MISS IT</span>
                                <h2 className="text-5xl md:text-6xl font-serif font-bold text-white leading-snug">
                                    CHÚNG MÌNH <br/> CÓ HẸN!
                                </h2>
                                <div className="mt-8 text-white">
                                    <p className="text-4xl font-bold">01</p>
                                    <p className="text-sm uppercase tracking-widest border-t border-white/50 pt-1 mt-1">DECEMBER</p>
                                </div>
                                {/* Thêm chi tiết khác nếu cần: Meet us on... */}
                            </div>
                        </div>

                        {/* Thẻ 3+ NĂM (Absolute) */}
                        <div className="absolute -top-6 -left-6 bg-[#F5F1EB] p-4 rounded-xl shadow-lg text-center">
                            <div className="text-xl font-bold text-[#2C2A24]">3+</div>
                            <div className="text-sm text-[#65604E]">Năm</div>
                        </div>
                    </div>
                    
                    {/* CỘT PHẢI: Nội dung Văn bản và CTA */}
                    <div className="space-y-8">
                        
                        {/* Tiêu đề nhỏ */}
                        <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider">
                            Câu Chuyện Về Nhà Gạo
                        </span>

                        {/* Tiêu đề chính */}
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] leading-tight">
                            Nơi Truyền Thống <br/> Gặp Gỡ Hiện Đại
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
                        <div className="grid grid-cols-2 gap-4 pt-4">
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
                        <div className="pt-4">
                            <Button
                                size="lg"
                                className="px-8 py-3 text-lg font-semibold bg-[#8B7D6B] text-white hover:bg-[#65604E] shadow-lg transition-all duration-300 flex items-center space-x-2"
                            >
                                <span>Tìm Hiểu Thêm Về Chúng Tôi</span>
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