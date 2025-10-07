// src/app/admin/dashboard/page.tsx

'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats'; 
import { DollarSign, ShoppingCart, Box, Users, AlertTriangle, Zap } from 'lucide-react'; 
import { OrderStatusChart } from "@/components/Charts/OrderStatusChart";
import { SalesOverTimeChart } from "@/components/Charts/SalesOverTimeChart";

// ------------------------------------
// 1. COMPONENT STAT CARD
// ------------------------------------

const getIcon = (type: string) => {
    switch (type) {
        case 'sales': return DollarSign;
        case 'orders': return ShoppingCart;
        case 'customers': return Users;
        case 'products': return Box;
        case 'lowstock': return AlertTriangle;
        case 'flashsale': return Zap;
        default: return Box;
    }
};

const formatValue = (value: number, type: string) => {
    if (type === 'sales') {
        return `₫${value.toLocaleString('vi-VN')}`; 
    }
    return value.toLocaleString();
};

interface StatCardProps {
    title: string;
    value: number;
    iconType: 'sales' | 'orders' | 'customers' | 'products' | 'lowstock' | 'flashsale';
    colorClass: string;
    isLoading: boolean;
    changeValue: string; // Đã fix lỗi Hydration bằng cách nhận giá trị thay đổi qua prop
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconType, colorClass, isLoading, changeValue }) => {
    const Icon = getIcon(iconType);
    const formattedValue = formatValue(value, iconType);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl border border-gray-100">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
            </div>
            <div className="mt-4">
                {isLoading ? (
                    <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                    <p className="text-3xl font-extrabold text-gray-900">{formattedValue}</p>
                )}
            </div>
            <div className="mt-4 flex items-center">
                <span className="text-sm font-semibold text-green-500">
                    {changeValue} {/* Dùng giá trị đã được tính sẵn từ hook */}
                </span>
                <span className="ml-2 text-xs text-gray-500">so với tháng trước</span>
            </div>
        </div>
    );
};


// ------------------------------------
// 2. TRANG DASHBOARD CHÍNH
// ------------------------------------

export default function DashboardPage() {
    const { stats, isLoading } = useDashboardStats();
    
    return (
        <div className="space-y-6">
            
            <h1 className="text-3xl font-bold text-gray-800 hidden">Tổng quan Dashboard</h1>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                
                {/* Dùng stats.salesChange và stats.ordersChange từ hook */}
                <StatCard 
                    title="Doanh thu Thuần" 
                    value={stats.totalSalesAmount} 
                    iconType="sales"
                    colorClass="text-green-600"
                    isLoading={isLoading}
                    changeValue={stats.salesChange} 
                />
                
                <StatCard 
                    title="Tổng Đơn hàng" 
                    value={stats.totalOrders} 
                    iconType="orders"
                    colorClass="text-blue-600"
                    isLoading={isLoading}
                    changeValue={stats.ordersChange} 
                />
                
                {/* Các StatCard còn lại dùng giá trị cố định để minh họa */}
                <StatCard 
                    title="Đơn hàng mới" 
                    value={stats.newOrders} 
                    iconType="orders"
                    colorClass="text-red-600"
                    isLoading={isLoading}
                    changeValue={'+1.2%'} 
                />

                <StatCard 
                    title="Tổng Sản phẩm" 
                    value={stats.totalProducts} 
                    iconType="products"
                    colorClass="text-indigo-600"
                    isLoading={isLoading}
                    changeValue={'+5.7%'}
                />
                
                <StatCard 
                    title="Tồn kho thấp" 
                    value={stats.lowStockItems} 
                    iconType="lowstock"
                    colorClass="text-orange-600"
                    isLoading={isLoading}
                    changeValue={'-3.1%'}
                />
                
                <StatCard 
                    title="Khách hàng" 
                    value={stats.totalCustomers} 
                    iconType="customers"
                    colorClass="text-purple-600"
                    isLoading={isLoading}
                    changeValue={'+15.3%'}
                />
                
            </div> 

            {/* 3. Biểu đồ Doanh thu và Trạng thái Đơn hàng */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100">
                    <SalesOverTimeChart /> 
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-100">
                    <OrderStatusChart />
                </div>
            </div>
            
            {/* 4. Khu vực cho Bảng dữ liệu chi tiết */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-80">
                <h3 className="text-xl font-semibold text-gray-800">Bảng Đơn hàng gần đây</h3>
                <p className="text-gray-500 mt-2">Nội dung này sẽ là bảng dữ liệu (ví dụ: 10 đơn hàng mới nhất) để hoàn thành giao diện dashboard.</p>
            </div>
            
        </div>
    );
}