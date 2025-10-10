// src/app/admin/orders/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { getOrderDetail, listOrders, Order } from '@/api/services/orderService';
import OrderTable from '@/components/adminOrder/OrderTable'; 
import OrderDetailModal from '@/components/adminOrder/OrderDetailModal';
import { PlusCircle, Search } from 'lucide-react';

export default function AdminOrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 

    const fetchOrders = useCallback(async (page: number, size: number, key: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await listOrders({ page, size, key });
            setOrders(data);
        } catch (err: any) {
            setError('Không thể tải danh sách đơn hàng: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(pagination.page, pagination.size, searchTerm);
    }, [fetchOrders, pagination.page, pagination.size, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchOrders(1, pagination.size, searchTerm);
    };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order); 
    
    try {
        const detailData = await getOrderDetail(order.id);
        setSelectedOrder(detailData); 
        
    } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    }
};
    const handleEditStatus = (order: Order) => {
        console.log('Chỉnh sửa trạng thái đơn hàng:', order.id);
        setSelectedOrder(order);
    };

    const handleDeleteOrder = async (id: number) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
            console.log('Xóa đơn hàng:', id);
        }
    };
    
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý Đơn hàng</h1>
            
            <div className="flex justify-between items-center mb-6">
                <form onSubmit={handleSearch} className="flex space-x-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo ID hoặc Khách hàng..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 w-80"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150">
                        Tìm kiếm
                    </button>
                </form>
                <button
                    onClick={() => console.log('Mở form tạo đơn hàng')}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Tạo Đơn hàng Mới</span>
                </button>
            </div>
            
            {loading && <p className="text-center text-indigo-600 py-10">Đang tải danh sách đơn hàng...</p>}
            
            {error && <p className="text-center text-red-600 py-10">Lỗi: {error}</p>}

            {!loading && !error && (
                <OrderTable 
                    orders={orders} 
                    onView={handleViewOrder} 
                    onEditStatus={handleEditStatus} 
                    onDelete={handleDeleteOrder} 
                />
            )}

            {selectedOrder && (
                <OrderDetailModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
}