'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Banner: React.FC = () => {
    // Index thực tế (bao gồm clone)
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionRef = useRef<HTMLDivElement>(null);

    // Danh sách 4 ảnh banner
    const bannerImages = [
        '/images/vn-11134210-7ra0g-m8rexyolpd3bfa.webp',
        '/images/vn-11134210-7ra0g-m7i7acz9q8l8e1.webp',
        '/images/vn-11134210-7ra0g-m7i7acz9rn772d.webp',
        '/images/vn-11134210-7ra0g-m7i7acz9x9gz4b.webp',
    ];
    // Clone: [last, ...images, first]
    const extendedImages = [bannerImages[bannerImages.length - 1], ...bannerImages, bannerImages[0]];

    // Auto chạy banner mỗi 5 giây, dừng khi đang chuyển động
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
    const handlePrev = React.useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    }, [isTransitioning]);
    const handleNext = React.useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    }, [isTransitioning]);

    useEffect(() => {
        if (!isTransitioning) {
            autoScrollRef.current = setInterval(() => {
                handleNext();
            }, 5000);
        } else if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
            autoScrollRef.current = null;
        }
        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
                autoScrollRef.current = null;
            }
        };
    }, [isTransitioning, handleNext]);
    // Xử lý khi animation kết thúc (chuyển clone về index thật)
    useEffect(() => {
        const handleTransitionEnd = () => {
            setIsTransitioning(false);
            if (currentIndex === 0) {
                setCurrentIndex(bannerImages.length);
            } else if (currentIndex === extendedImages.length - 1) {
                setCurrentIndex(1);
            }
        };
        const node = transitionRef.current;
        if (node) {
            node.addEventListener('transitionend', handleTransitionEnd);
        }
        return () => {
            if (node) {
                node.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
    }, [currentIndex, extendedImages.length, bannerImages.length]);

    // ...existing code...
    // Chuyển trực tiếp khi click chấm tròn
    const handleDotClick = (index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index + 1);
    };

    return (
        <div className="relative w-full h-[350px] md:h-[500px] lg:h-[550px] xl:h-[600px] overflow-hidden rounded-lg shadow-lg mb-6">
            {/* Container cho các ảnh */}
            <div
                ref={transitionRef}
                className={`flex h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {extendedImages.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                        <Image
                            src={image}
                            alt={`Banner ${index}`}
                            fill
                            className="object-cover"
                            priority={index === 1}
                        />
                    </div>
                ))}
            </div>

            {/* lasicators (chấm tròn) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {bannerImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300
                            ${index + 1 === currentIndex
                                ? 'bg-red-400 shadow-lg'
                                : 'bg-gray-400 hover:bg-gray-500'}
                        `}
                        disabled={isTransitioning}
                        style={isTransitioning ? { opacity: 0.5, cursor: 'pointer' } : {}}
                    />
                ))}
            </div>

            {/* Navigation arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg p-3 transition-all duration-300 cursor-pointer"
                disabled={isTransitioning}
                style={isTransitioning ? { opacity: 0.5, cursor: 'pointer' } : {}}
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg p-3 transition-all duration-300 cursor-pointer"
                disabled={isTransitioning}
                style={isTransitioning ? { opacity: 0.5, cursor: 'pointer' } : {}}
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default Banner;