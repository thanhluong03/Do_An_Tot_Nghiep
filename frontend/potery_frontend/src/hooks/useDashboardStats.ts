// src/hooks/useDashboardStats.ts

import { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho Dashboard Stats
export interface DashboardStats {
    totalProducts: number;
    newOrders: number;
    lowStockItems: number;
    activePromotions: number;
    activeFlashSales: number;
    totalCustomers: number;
    totalSalesAmount: number; 
    totalOrders: number; 
    // Thêm các trường đã được tính toán sẵn
    salesChange: string; 
    ordersChange: string;
}

// Hàm helper để tạo giá trị ngẫu nhiên MỘT LẦN
const generateRandomChange = () => {
    const change = Math.floor(Math.random() * 20) + 5; 
    const decimal = Math.floor(Math.random() * 9);
    return `+${change}.${decimal}%`;
};

// DỮ LIỆU GIẢ LẬP CỐ ĐỊNH (FAKE DATA)
const FAKE_STATS: DashboardStats = {
    totalProducts: 425,
    newOrders: 18, 
    lowStockItems: 12, 
    activePromotions: 3, 
    activeFlashSales: 1, 
    totalCustomers: 5890,
    totalSalesAmount: 782300000, 
    totalOrders: 2354,
    salesChange: generateRandomChange(), // Tính 1 lần trên Server/Module Load
    ordersChange: generateRandomChange(),
};


export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>(FAKE_STATS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Giả lập độ trễ khi tải
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return { stats, isLoading };
};