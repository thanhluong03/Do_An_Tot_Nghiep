"use client";
import React, { useState, useEffect, useCallback } from "react";
import { getOrderDetail, listOrders, Order, OrderItem } from "@/api/services/orderService";
import OrderTable from "@/components/adminOrder/OrderTable";
import OrderDetailModal from "@/components/adminOrder/OrderDetailModal";
import { PlusCircle, Search } from "lucide-react";

interface FullOrderDetails extends Omit<Order, "total_amount" | "items"> {
  total_amount: number;
  items: OrderItem[];
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FullOrderDetails | null>(null);

  const fetchOrders = useCallback(async (page: number, size: number, key: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders({ page, size, key });
      setOrders(data);
    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(pagination.page, pagination.size, searchTerm);
  }, [fetchOrders, pagination.page, pagination.size, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders(1, pagination.size, searchTerm);
  };

  const handleViewOrder = async (order: Order) => {
    setLoading(true);
    try {
      const detailData = await getOrderDetail(order.id);
      const fullOrderDetails: FullOrderDetails = {
        ...detailData,
        items: detailData.current_order?.items || detailData.items || [],
        total_amount: parseFloat(detailData.total_amount as string),
      };
      setSelectedOrder(fullOrderDetails);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      const basicOrderDetails: FullOrderDetails = {
        ...order,
        total_amount: parseFloat(order.total_amount as string),
        items: order.items || [],
      };
      setSelectedOrder(basicOrderDetails);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (order: Order) => {
    const basicOrderDetails: FullOrderDetails = {
      ...order,
      total_amount: parseFloat(order.total_amount as string),
      items: order.items || [],
    };
    setSelectedOrder(basicOrderDetails);
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
      console.log("Xóa đơn hàng:", id);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        Quản lý Đơn hàng
      </h1>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID hoặc Khách hàng..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150"
          >
            Tìm kiếm
          </button>
        </form>

        <button
          onClick={() => console.log("Mở form tạo đơn hàng")}
          className="flex items-center justify-center space-x-2 px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-150"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tạo Đơn hàng Mới</span>
        </button>
      </div>

      {loading && <p className="text-center text-indigo-600 py-10 font-medium">Đang tải danh sách đơn hàng...</p>}
      {error && <p className="text-center text-red-600 py-10 font-medium">Lỗi: {error}</p>}

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
          order={selectedOrder as Order}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
