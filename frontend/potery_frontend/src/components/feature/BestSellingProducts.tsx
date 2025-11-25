'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/api/modules/products';
import { Product } from '@/types';
import { TrendingUp } from 'lucide-react';
import { ProductGrid } from './ProductGrid';

interface BestSellingProductsProps {
    limit?: number;
}

export const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ limit = 10 }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBestSellingProducts = async () => {
            try {
                setLoading(true);
                const bestSellingProducts = await productApi.getBestSellingProducts(limit);
                setProducts(bestSellingProducts);
            } catch (err) {
                setError('Không thể tải sản phẩm bán chạy');
                console.error('Failed to fetch best selling products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellingProducts();
    }, [limit]);

    const handleProductClick = (product: Product) => {
        router.push(`/products/${product.id}`);
    };

    if (products.length === 0 && !loading && !error) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 mt-5 max-w-[1200px] mx-auto">
            {/* Hiệu ứng lửa nhấp nháy quanh viền chữ */}
            <style>{`
                .fire-glow {
                    font-weight: bold;
                    font-size: 1.5rem;
                    color: #ff9800;
                    text-shadow:
                        0 0 12px #ffd54f,
                        0 0 24px #ff9800,
                        0 0 36px #fff176,
                        0 0 48px #ffecb3;
                    animation: fireGlow 1s infinite alternate;
                }
                @keyframes fireGlow {
                    0% {
                        text-shadow:
                            0 0 12px #ffd54f,
                            0 0 24px #ff9800,
                            0 0 36px #fff176,
                            0 0 48px #ffecb3;
                    }
                    50% {
                        text-shadow:
                            0 0 24px #fff176,
                            0 0 36px #ffd54f,
                            0 0 48px #ff9800,
                            0 0 60px #fff176;
                    }
                    100% {
                        text-shadow:
                            0 0 12px #ffd54f,
                            0 0 24px #ff9800,
                            0 0 36px #fff176,
                            0 0 48px #ffecb3;
                    }
                }
            `}</style>
            <div className="flex items-center gap-2 mb-4">
                <h2 className="fire-glow">Sản phẩm bán chạy</h2>
            </div>
            <ProductGrid
                products={products}
                loading={loading}
                error={error}
                onViewDetails={handleProductClick}
                columns={4}
            />
        </div>
    );
};