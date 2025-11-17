'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image'; // 1. ĐÃ IMPORT Image
import Link from 'next/link'; // 2. ĐÃ IMPORT Link
import { Button } from '../common/Button';

// Component cho các giá trị cốt lõi
// (Không thay đổi, nhưng giờ sẽ được sử dụng)
const CoreValueCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode; // Thay đổi 'string' thành 'React.ReactNode' để chứa <Image />
}> = ({ title, description, icon }) => (
  <div className="text-center p-6 bg-[#F5F1EB] rounded-xl shadow-sm">
    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-[#7A6D44] shadow-md border-2 border-[#8B7D6B]/50">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[#2C2A24] mb-1">{title}</h3>
    <p className="text-sm text-[#65604E]">{description}</p>
  </div>
);

export const AboutSection: React.FC = () => {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [imageInView, setImageInView] = useState(false);
  const [textInView, setTextInView] = useState(false);

  useEffect(() => {
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
      threshold: 0.18,
    };

    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageInView(true);
          // Tùy chọn: Tắt theo dõi sau khi đã thấy
          // if (imgEl) imgObserver.unobserve(imgEl);
        } else {
          setImageInView(false); // Giữ nguyên logic cũ của bạn
        }
      });
    }, options);

    const txtObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextInView(true);
          // Tùy chọn: Tắt theo dõi sau khi đã thấy
          // if (txtEl) txtObserver.unobserve(txtEl);
        } else {
          setTextInView(false); // Giữ nguyên logic cũ của bạn
        }
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

  const ANIMATION_DISTANCE = 100;
  const ANIMATION_DURATION = 2000;

  const transitionStyle = (
    direction: 'fromLeft' | 'fromRight',
    inView: boolean,
  ) =>
    ({
      transform: inView
        ? 'translateX(0px)'
        : direction === 'fromLeft'
          ? `translateX(-${ANIMATION_DISTANCE}px)`
          : `translateX(${ANIMATION_DISTANCE}px)`,
      opacity: inView ? 1 : 0,
      transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease-out`,
    } as React.CSSProperties);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* CỘT TRÁI: Hình Ảnh Lớn */}
          <div
            className="relative"
            ref={imageRef}
            style={transitionStyle('fromLeft', imageInView)}
          >
            {/* FIX 1: Thay <img> bằng <Image /> 
              Lưu ý: src="/tiemgom.jpg" giả định ảnh nằm trong thư mục /public
              Tôi đã thêm width/height lớn, CSS sẽ xử lý việc co giãn
            */}
            <Image
              src="/tiemgom.jpg" // 3. ĐÃ SỬA: Giả sử ảnh ở /public/tiemgom.jpg
              alt="Pottery Workshop"
              width={800} // Phải cung cấp width
              height={600} // Phải cung cấp height
              className="w-full h-full object-cover rounded-lg"
            />

            <div className="absolute -top-6 -left-6 bg-[#F5F1EB] p-4 rounded-xl shadow-lg text-center">
              <div className="text-xl font-bold text-[#2C2A24]">3+</div>
              <div className="text-sm text-[#65604E]">Năm</div>
            </div>
          </div>

          {/* CỘT PHẢI: Nội dung Văn bản và CTA */}
          <div
            className="space-y-6"
            ref={textRef}
            style={transitionStyle('fromRight', textInView)}
          >
            <span className="text-sm font-medium text-[#8B7D6B] tracking-wider bg-[#F5F3EF] px-3 py-1 rounded-full">
              Câu Chuyện Về Nhà Gạo
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] leading-tight">
              Nơi Truyền Thống <br /> Gặp Gỡ Hiện Đại
            </h2>
            <p className="text-base text-[#65604E] leading-relaxed">
              Tiệm Gốm Nhà Gạo ra đời từ niềm đam mê với nghệ thuật gốm sứ
              truyền thống Việt Nam. Chúng tôi kết hợp kỹ thuật thủ công cổ
              truyền với thiết kế đương đại, tạo nên những sản phẩm độc đáo mang
              đậm dấu ấn văn hóa.
            </p>
            <p className="text-base text-[#65604E] leading-relaxed">
              Mỗi sản phẩm đều được chế tác tỉ mỉ bởi những nghệ nhân có kinh
              nghiệm, từ việc chọn đất sét, tạo hình, trang trí cho đến nung
              thiêu, tất cả đều được thực hiện theo quy trình truyền thống.
            </p>

            {/* FIX 2: Sử dụng component 'CoreValueCard' đã định nghĩa
              để sửa lỗi 'CoreValueCard' is defined but never used
              và tối ưu lặp code (DRY)
            */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <CoreValueCard
                title="Tâm Huyết"
                description="Mỗi sản phẩm là một niềm tự hào"
                icon={
                  <Image
                    src="/handheart.png" // 4. ĐÃ SỬA: Giả sử ảnh ở /public/handheart.png
                    alt="Tâm huyết"
                    width={24} // w-6 = 24px
                    height={24} // h-6 = 24px
                    className="inline-block"
                  />
                }
              />
              <CoreValueCard
                title="Thân Thiện"
                description="Vật liệu tự nhiên, thân thiện"
                icon={
                  <Image
                    src="/leaf.png" // 5. ĐÃ SỬA: Giả sử ảnh ở /public/leaf.png
                    alt="Thân thiện"
                    width={24} // w-6 = 24px
                    height={24} // h-6 = 24px
                    className="inline-block"
                  />
                }
              />
            </div>

            {/* FIX 3: Sửa lỗi <a> bằng <Link> 
              Bọc component <Button> bằng <Link>
            */}
            <div className="pt-2">
              <Link href="/about" passHref>
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold bg-[#8B7D6B] text-white hover:bg-[#65604E] shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  {/* Bỏ thẻ <a> bên trong */}
                  Tìm Hiểu Thêm Về Chúng Tôi
                  <span className="ml-2 text-xl">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};