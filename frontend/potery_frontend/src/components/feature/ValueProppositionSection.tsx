'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
// Import newsApi và FeaturedNewsItem interface
import { newsApi, NewsItem } from '../../api/modules/news'; // Đảm bảo đường dẫn đúng

function useRevealOnScroll() {
    useEffect(() => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
        if (!elements.length) return;

        // Initialize styles for each element (move farther on reveal)
        elements.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(64px)';
            el.style.transition = 'opacity 700ms ease-out, transform 700ms ease-out';
            el.style.willChange = 'opacity, transform';
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target as HTMLElement;
                    if (entry.isIntersecting) {
                        requestAnimationFrame(() => {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                        });
                    } else {
                        requestAnimationFrame(() => {
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(64px)';
                        });
                    }
                });
            },
            { threshold: 0.12 }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}

const valueItems = [
    {
        title: 'Thiết Kế Độc Đáo',
        description: 'Mỗi sản phẩm đều mang phong cách riêng biệt, kết hợp giữa nét đẹp truyền thống và xu hướng hiện đại.',
        image: './reason/reason1.png',
        alt: 'Thiết kế độc đáo',
        icon: './palette.png', // <-- Đường dẫn PNG 1
    },
    {
        title: 'Chất Lượng Cao',
        description: 'Sử dụng nguyên liệu cao cấp và quy trình sản xuất nghiêm ngặt để đảm bảo độ bền và tinh thẩm mỹ.',
        image: './reason/reason2.png',
        alt: 'Chất lượng cao',
        icon: './diamond.png', // <-- Đường dẫn PNG 2
    },
    {
        title: 'Giá Trị Văn Hóa',
        description: 'Lưu giữ và phát huy những giá trị văn hóa truyền thống của nghệ thuật gốm sứ Việt Nam.',
        image: './reason/reason3.png',
        alt: 'Giá trị văn hóa',
        icon: './heart.png', // <-- Đường dẫn PNG 3
    }
];

// Dữ liệu cho khối thống kê dưới cùng
const statItems = [
    { value: '50+', label: 'Sản Phẩm Độc Đáo' },
    { value: '3+', label: 'Năm Kinh Nghiệm' },
    { value: '500+', label: 'Khách Hàng Hài Lòng' },
    { value: '4+', label: 'Giải Thưởng' }
];

export function ValuePropositionSection() {
    useRevealOnScroll();
    return (
        <section className="relative py-20 bg-[#FBFBFB]">

            {/* Lớp viền xanh nhạt bao quanh màn hình (tùy chọn) */}
            <div className="absolute inset-0 border-x-4 border-[#EBF5FA]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div data-reveal className="text-center mb-16">
                    {/* Tiêu đề nhỏ */}
                    <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider bg-transparent">
                        Giá Trị Cốt Lõi
                    </span>

                    {/* Tiêu đề chính - Điều chỉnh màu và font */}
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-4 mt-2">
                        Tại Sao Chọn <span className="text-[#65604E]">Tiệm Gốm Nhà Gạo</span> ?
                    </h2>

                    {/* Đoạn mô tả */}
                    <p className="text-lg text-[#65604E] max-w-3xl mx-auto leading-relaxed">
                        Chúng tôi cam kết mang đến những sản phẩm gốm sứ chất lượng cao với giá trị văn hóa sâu sắc
                    </p>
                </div>

                {/* 3 Value Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {valueItems.map((item, index) => (
                        <div key={index} data-reveal className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-[#F5F1EB]">
                            {/* Khối Hình Ảnh: để inset với padding và rounded corners giống mockup */}
                            <div className="w-full h-48 rounded-lg overflow-hidden shadow-sm bg-[#FFFFFF]">
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                            {/* Khối Nội Dung */}
                            <div className="p-6 pt-4 flex flex-col items-center text-center flex-grow">

                                {/* Icon/Dấu ấn đặc trưng - Đã sửa thành IMG và màu nền #F5F3EF */}
                                <div className="mt-4 mb-3">
                                    <div className="inline-flex w-12 h-12 bg-[#F5F3EF] rounded-full items-center justify-center shadow-sm">
                                        <img
                                            src={item.icon} // Sử dụng đường dẫn PNG từ mảng dữ liệu
                                            alt={`Icon ${item.title}`}
                                            className="w-6 h-6" // Kích thước icon bên trong vòng tròn
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-[#2C2A24] mb-3">{item.title}</h3>

                                <p className="text-[#65604E] text-base mb-6 flex-grow">
                                    {item.description}
                                </p>

                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistics Box */}
                <div data-reveal className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-[#F5F1EB]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        {statItems.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-[#968A71] mb-1">{stat.value}</div>
                                <div className="text-base text-[#4B5563]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

// Testimonials Section
// Dữ liệu cho các đánh giá
const testimonialsData = [
    {
        name: 'Anh Minh Tuấn',
        review: '“Dịch vụ tư vấn rất chuyên nghiệp, sản phẩm được đóng gói cẩn thận. Lọ hoa tôi đặt làm quà tặng đã khiến người nhận rất hài lòng. Cảm ơn team Nhà Gạo!”',
        product: 'Lọ hoa nghệ thuật',
        image: './testimonial/testimonial1.png', // Thay thế bằng hình ảnh thực tế
    },
    {
        name: 'Chị Lan Anh',
        review: '“Bộ ấm chén tối màu ở đây thực sự tuyệt vời! Chất lượng cao cấp, thiết kế tinh tế và rất phù hợp với không gian trà đạo của gia đình. Sẽ quay lại mua thêm.”',
        product: 'Cốc Gốm Nhật Trắng Men',
        image: './testimonial/testimonial2.png', // Thay thế bằng hình ảnh thực tế
    },
    {
        name: 'Chị Thu Hà',
        review: '“Mình là người khó tính về đồ trang trí nhà cửa, nhưng những sản phẩm ở đây thực sự làm mình hài lòng. Chất lượng tuyệt vời, với giá cả hợp lý.”',
        product: 'Bộ bát đĩa Minimalist',
        image: './testimonial/testimonial3.png', // Thay thế bằng hình ảnh thực tế
    },
];

// Dữ liệu cho khối thống kê
const statsReviewData = [
    { value: '4.9/5', label: 'Đánh Giá Trung Bình' },
    { value: '300', label: 'Lượt Đánh Giá' },
    { value: '98%', label: 'Khách Hàng Hài Lòng' },
    { value: '90%', label: 'Tỷ Lệ Mua Lại' },
];

export function TestimonialsSection() {
    useRevealOnScroll();
    return (
        // Màu nền trắng ngà nhẹ
        <section className="py-24 bg-[#FBFBFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div data-reveal className="text-center mb-16">
                    {/* Tag Khách Hàng Nói Gì */}
                    <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider bg-white px-4 py-1 rounded-full inline-block mb-4 border border-[#F5F1EB]">
                        Khách Hàng Nói Gì
                    </span>

                    {/* Tiêu đề chính, sử dụng font serif và màu sắc theo ảnh */}
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#2C2A24] mb-4">
                        Những Chia Sẻ <span className="text-[#8B7D6B]">Chân Thực</span>
                    </h2>

                    <p className="text-lg text-[#65604E] max-w-4xl mx-auto leading-relaxed">
                        Cảm nhận của khách hàng về chất lượng sản phẩm và dịch vụ của Tiệm Gốm Nhà Gạo
                    </p>
                </div>

                {/* Testimonial Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {testimonialsData.map((item, index) => (
                        // Card container: Nền trắng, bo tròn nhẹ, shadow mỏng
                        <div key={index} data-reveal className="bg-white rounded-xl shadow-md p-6 flex flex-col border border-gray-100">

                            {/* Review Content */}
                            <p className="text-base text-[#2C2A24] leading-relaxed italic mb-6 flex-grow">
                                {item.review}
                            </p>

                            {/* Author and Info (Được căn giữa trong card theo bố cục mới) */}
                            <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col items-start">

                                {/* Image and Name Group */}
                                <div className="flex items-center space-x-3 mb-2">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 object-cover rounded-full flex-shrink-0"
                                    />
                                    <div className="text-left">
                                        <div className="text-base font-semibold text-[#2C2A24]">{item.name}</div>
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="flex items-center space-x-0.5 text-yellow-500 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>

                                {/* Sản phẩm đã mua */}
                                <span className="text-sm text-[#65604E]">Đã mua: {item.product}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistics Block */}
                <div data-reveal className="max-w-8xl mx-auto mt-16 bg-white rounded-xl shadow-md border border-gray-100 p-8">
                    <div className="grid grid-cols-4 gap-8">
                        {statsReviewData.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center">
                                {/* Số liệu */}
                                <span className="text-5xl font-bold text-[#968A71] mb-2">
                                    {stat.value}
                                </span>
                                {/* Mô tả */}
                                <span className="text-base text-[#4B5563] text-center mb-2">
                                    {stat.label}
                                </span>
                                {/* Star rating chỉ hiển thị dưới chỉ số đầu tiên (4.9/5) */}
                                {index === 0 && (
                                    <div className="flex items-center space-x-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
const featuredPosts = [
    {
        tag: 'Kỹ Thuật',
        title: 'Nghệ Thuật Tạo Hình Gốm Truyền Thống',
        description: 'Tìm hiểu về quy trình tạo hình gốm từ khối đất sét thô đến những tác phẩm nghệ thuật tinh xảo. Mỗi bước đều đòi hỏi sự tỉ mỉ và kinh nghiệm của nghệ nhân.',
        date: '15 Tháng 10, 2025',
        readTime: '5 phút đọc',
        image: './journal/journal1.png', // Thay thế bằng hình ảnh thực tế
        tagColor: 'bg-[#65604E]' // Màu nâu đậm cho tag
    },
    {
        tag: 'Xu Hướng',
        title: 'Xu Hướng Gốm Sứ Hiện Đại 2025',
        description: 'Cập nhật những xu hướng thiết kế gốm sứ mới nhất trong năm 2025, từ phong cách tối giản đến những họa tiết táo bạo, màu sắc độc đáo.',
        date: '05 Tháng 09, 2025',
        readTime: '7 phút đọc',
        image: './journal/journal2.png', // Thay thế bằng hình ảnh thực tế
        tagColor: 'bg-[#8B7D6B]' // Màu be cho tag
    },
    {
        tag: 'Hướng Dẫn',
        title: 'Cách Bảo Quản Gốm Đúng Cách',
        description: 'Hướng dẫn chi tiết cách vệ sinh, bảo quản và lưu trữ đồ gốm sứ để giữ được vẻ đẹp và độ bền theo thời gian.',
        date: '09 Tháng 10, 2025',
        readTime: '4 phút đọc',
        image: './journal/journal3.png', // Thay thế bằng hình ảnh thực tế
        tagColor: 'bg-[#7A8471]' // Màu xanh rêu cho tag
    }
];
// Journal Section
// Journal Section




export function JournalSection() {
    useRevealOnScroll(); 
    // SỬA: Cập nhật kiểu dữ liệu từ FeaturedNewsItem[] thành NewsItem[]
    const [featuredPosts, setFeaturedPosts] = useState<NewsItem[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // newsApi.listFeatured(3) đã được cập nhật để trả về NewsItem[]
                const data = await newsApi.listFeatured(3);
                setFeaturedPosts(data);
            } catch (error) {
                console.error("Lỗi khi tải bài viết nổi bật:", error);
                setFeaturedPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Hiển thị loading state
    if (loading) {
        return (
            <section className="py-24 bg-[#FBFBFB] text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-xl text-[#65604E] italic">Đang tải bài viết...</p>
                </div>
            </section>
        );
    }
    
    // Hiển thị nếu không có bài viết
    if (featuredPosts.length === 0 && !loading) {
        return (
            <section className="py-24 bg-[#FBFBFB] text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-xl text-[#65604E]">Hiện chưa có bài viết nào được đăng.</p>
                </div>
            </section>
        );
    }

    // Logic hiển thị chính (dữ liệu đã được lấy)
    return (
        <section className="py-24 bg-[#FBFBFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div data-reveal className="text-center mb-16">
                    {/* Tag Nhật Ký Gốm Sứ */}
                    <span className="text-sm font-medium text-[#8B7D6B] uppercase tracking-wider bg-white px-4 py-1 rounded-full inline-block mb-4 border border-[#F5F1EB]">
                        Nhật Ký Gốm Sứ
                    </span>
                    {/* Tiêu đề chính */}
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#2C2A24] mb-4">
                        Câu Chuyện & <span className="text-[#8B7D6B]">Cảm Hứng</span>
                    </h2>
                    {/* Mô tả */}
                    <p className="text-lg text-[#65604E] max-w-4xl mx-auto leading-relaxed">
                        Khám phá những câu chuyện thú vị về nghệ thuật gốm sứ, kỹ thuật chế tác và xu hướng thiết kế
                    </p>
                </div>
                
                {/* Blog Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {featuredPosts.map((post) => (
                        <div key={post.id} data-reveal className="bg-white rounded-xl overflow-hidden border border-gray-100 flex flex-col">
                            {/* Image with Tag Overlay */}
                            <div className="relative w-full h-48 overflow-hidden bg-[#FFFFFF]">
                                <img
                                    src={post.image || '/journal/placeholder.png'} 
                                    alt={post.title}
                                    className="w-full h-full object-cover object-center"
                                />
                                
                            </div>
                            {/* Content Block */}
                            <div className="p-6 flex flex-col flex-grow">

                                {/* Meta Data (Date and Read Time) */}
                                <div className="flex items-center text-sm text-[#8B7D6B] mb-2 space-x-3">
                                    <div className="flex items-center space-x-1">
                                        <span>🗓️</span>
                                        {/* Định dạng ngày */}
                                        <span>{new Date(post.published_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-[#2C2A24] mb-3 leading-snug">
                                    {post.title}
                                </h3>

                                {/* Description */}
                                <div 
                                    className="text-[#65604E] text-base mb-6 flex-grow line-clamp-3"
                                    // SỬ DỤNG dangerouslySetInnerHTML để render chuỗi HTML
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Read More Link */}
                                <Link
                                    href={`/news/${post.id}`} 
                                    className="mt-auto text-base font-semibold text-[#8B7D6B] flex items-center space-x-1 hover:text-[#65604E] transition"
                                >
                                    <span>Đọc Tiếp</span>
                                    <span className="ml-2 text-xl">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button (Xem Tất Cả Bài Viết) */}
                <div className="text-center" data-reveal>
                    <Link
                        href="/news"
                        className="px-8 py-3 text-lg font-semibold bg-[#8B7D6B] text-white hover:bg-[#65604E] transition-colors rounded-lg shadow-md inline-block"
                    >
                        Xem Tất Cả Bài Viết
                    </Link>
                </div>

            </div>
        </section>
    );
}
// Giữ nguyên đoạn code dưới để tránh lỗi:
// const featuredPosts = [...] // Xóa đoạn này
// export function JournalSection() {...} // Component mới