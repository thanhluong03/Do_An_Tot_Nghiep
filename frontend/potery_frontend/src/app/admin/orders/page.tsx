"use client";
import React, { useState, useEffect } from "react";
import {
  getOrderDetail,
  listOrders,
  updateOrder,
  deleteOrder,
  Order,
  OrderItem,
  listDropdownStores,
  OrderStatus,
  PaymentStatus,
} from "@/api/services/orderService";
import OrderTable from "@/components/adminOrder/OrderTable";
import OrderDetailModal from "@/components/adminOrder/OrderDetailModal";
import OrderStatusModal from "@/components/adminOrder/OrderStatusModal";
import OrderStatusTabs from "@/components/adminOrder/OrderStatusTabs";
import { PlusCircle, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface SelectOption {
  id: number;
  name: string;
}

interface FullOrderDetails extends Omit<Order, "total_amount" | "items"> {
  total_amount: number;
  items: OrderItem[];
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // 🟢 lưu toàn bộ đơn hàng để tính số lượng
  const [stores, setStores] = useState<SelectOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | "">("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FullOrderDetails | null>(null);
  const [editingOrder, setEditingOrder] = useState<FullOrderDetails | null>(null);

  useEffect(() => {
    listDropdownStores()
      .then(setStores)
      .catch(() => toast.error("Không thể tải danh sách cửa hàng!"));
  }, []);

  // 🟢 Fetch toàn bộ để hiển thị số lượng trên tabs
  async function fetchAllOrders() {
    try {
      const data = await listOrders({});
      setAllOrders(data);
    } catch {
      toast.error("Không thể tải thống kê đơn hàng!");
    }
  }

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.page,
        size: pagination.size,
        key: searchTerm,
        store_id: selectedStoreId || undefined,
        status: orderStatusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
      };
      const data = await listOrders(params);
      setOrders(data);
    } catch {
      setError("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, []); // 🟢 chỉ gọi 1 lần khi vào trang

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchOrders();
  };

  const handleSelectOrderStatus = (status: OrderStatus | "") => {
    setOrderStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSelectPaymentStatus = (status: PaymentStatus | "") => {
    setPaymentStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };

  const handleViewOrder = async (order: Order) => {
    setLoading(true);
    try {
      const detail = await getOrderDetail(order.id);
      const fullOrder: FullOrderDetails = {
        ...detail,
        items: detail.current_order?.items || detail.items || [],
        total_amount: parseFloat(detail.total_amount as string),
      };
      setSelectedOrder(fullOrder);
    } catch {
      toast.error("Không thể tải chi tiết đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = async (order: Order) => {
    try {
      const detail = await getOrderDetail(order.id);
      const fullOrder: FullOrderDetails = {
        ...detail,
        items: detail.current_order?.items || detail.items || [],
        total_amount: parseFloat(detail.total_amount as string),
      };
      setEditingOrder(fullOrder);
    } catch {
      setEditingOrder({ ...order, items: order.items || [], total_amount: parseFloat(order.total_amount as string) });
    }
  };

  const handleUpdateOrder = async (id: number, data: any) => {
    setLoading(true);
    try {
      await updateOrder(id, data);
      toast.success("Cập nhật đơn hàng thành công!");
      await fetchOrders();
      await fetchAllOrders();
      setEditingOrder(null);
    } catch {
      toast.error("Cập nhật đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm(`Bạn có chắc muốn xóa đơn hàng #${id}?`)) {
      try {
        await deleteOrder(id);
        toast.success("🗑️ Xóa đơn hàng thành công!");
        await fetchOrders();
        await fetchAllOrders();
      } catch {
        toast.error("❌ Xóa đơn hàng thất bại!");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="py-6 border-b border-gray-200 text-center bg-gray-50">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý Đơn hàng
          </h1>
        </div>

        {/* Tìm kiếm */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto md:flex-grow">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID hoặc Khách hàng..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              title="store-filter"
              value={selectedStoreId === "" ? "" : String(selectedStoreId)}
              onChange={(e) =>
                setSelectedStoreId(e.target.value ? Number(e.target.value) : "")
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-auto"
            >
              <option value="">Tất cả cửa hàng</option>
              {stores.map((store) => (
                <option key={store.id} value={String(store.id)}>
                  {store.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition w-full md:w-auto"
            >
              Tìm kiếm
            </button>
          </form>

          <button
            onClick={() => toast("🚀 Chức năng tạo đơn hàng đang được phát triển!")}
            className="flex items-center justify-center space-x-2 px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition w-full md:w-auto"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tạo Đơn hàng Mới</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="p-4 border-b border-gray-200">
          <OrderStatusTabs
            allOrders={allOrders}
            currentOrderStatus={orderStatusFilter}
            onSelectOrderStatus={handleSelectOrderStatus}
            currentPaymentStatus={paymentStatusFilter}
            onSelectPaymentStatus={handleSelectPaymentStatus}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            Tổng: {allOrders.length} đơn hàng
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          {loading && (
            <p className="text-center text-indigo-600 py-6 font-medium">
              Đang tải danh sách đơn hàng...
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 py-6 font-medium">
              Lỗi: {error}
            </p>
          )}
          {!loading && !error && (
            <OrderTable
              orders={orders}
              onView={handleViewOrder}
              onEditStatus={handleEditStatus}
              onDelete={handleDeleteOrder}
            />
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder as Order}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {editingOrder && (
        <OrderStatusModal
          orderId={editingOrder.id}
          currentStatus={editingOrder.status}
          currentPaymentStatus={editingOrder.payment_status}
          currentPaymentMethod={editingOrder.payment_method}
          onClose={() => setEditingOrder(null)}
          onUpdated={(data) => handleUpdateOrder(editingOrder.id, data)}
        />
      )}
    </div>
  );
}
