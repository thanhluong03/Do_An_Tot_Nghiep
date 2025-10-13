// src/app/admin/orders/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  const [stores, setStores] = useState<SelectOption[]>([]);
  
  // STATE LỌC
  const [selectedStoreId, setSelectedStoreId] = useState<number | "">("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "">("");
  // END STATE LỌC

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FullOrderDetails | null>(null);
  const [editingOrder, setEditingOrder] = useState<FullOrderDetails | null>(null);

  // 🔹 Lấy danh sách cửa hàng cho dropdown filter
  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await listDropdownStores();
        setStores(data);
      } catch (err) {
        console.error("Lỗi tải cửa hàng:", err);
        toast.error("Không thể tải danh sách cửa hàng!");
      }
    }
    fetchStores();
  }, []);


  // 🔹 Lấy danh sách đơn hàng
  const fetchOrders = useCallback(async (
    page: number, 
    size: number, 
    key: string, 
    storeId?: number | "",
    status?: OrderStatus | "",
    paymentStatus?: PaymentStatus | ""
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size, key };
      if (storeId) params.store_id = storeId;
      if (status) params.status = status;
      if (paymentStatus) params.payment_status = paymentStatus;
      
      const data = await listOrders(params);
      setOrders(data);
    } catch (err: any) {
      const message = "Không thể tải danh sách đơn hàng!";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 useEffect để gọi fetchOrders khi các tham số thay đổi (fallback)
  useEffect(() => {
    fetchOrders(
      pagination.page, 
      pagination.size, 
      searchTerm, 
      selectedStoreId,
      orderStatusFilter,
      paymentStatusFilter
    );
    // Lưu ý: Không cần gọi fetchOrders ở đây nếu nó được gọi trong các hàm handleSelect/handleFilter
    // Tuy nhiên, giữ lại để đảm bảo tải lại khi page/size/searchTerm thay đổi.
  }, [fetchOrders, pagination.page, pagination.size, searchTerm]); 
// Loại bỏ orderStatusFilter, paymentStatusFilter, selectedStoreId khỏi dependency list của useEffect 
// vì chúng ta đã gọi fetchOrders trực tiếp trong các hàm xử lý lọc dưới đây.

  // 🔹 Tìm kiếm đơn hàng (khi nhấn nút Tìm kiếm)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders(1, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
  };

  // 🔹 Lọc theo cửa hàng - Đã sửa
  const handleFilterByStore = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const storeId = value ? Number(value) : "";
    setSelectedStoreId(storeId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // ✅ GỌI fetchOrders NGAY LẬP TỨC
    fetchOrders(1, pagination.size, searchTerm, storeId, orderStatusFilter, paymentStatusFilter);
  };
  
  // 🔹 Xử lý chọn Trạng thái Đơn hàng - Đã sửa
  const handleSelectOrderStatus = (status: OrderStatus | "") => {
    setOrderStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // ✅ GỌI fetchOrders NGAY LẬP TỨC
    fetchOrders(1, pagination.size, searchTerm, selectedStoreId, status, paymentStatusFilter);
  };
  
  // 🔹 Xử lý chọn Trạng thái Thanh toán - Đã sửa
  const handleSelectPaymentStatus = (paymentStatus: PaymentStatus | "") => {
    setPaymentStatusFilter(paymentStatus);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // ✅ GỌI fetchOrders NGAY LẬP TỨC
    fetchOrders(1, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatus);
  };


  // 🔹 Xem chi tiết
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
    } catch {
      toast.error("Không thể tải chi tiết đơn hàng!");
      setSelectedOrder({
        ...order,
        total_amount: parseFloat(order.total_amount as string),
        items: order.items || [],
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sửa trạng thái
  const handleEditStatus = async (order: Order) => {
    try {
      const detailData = await getOrderDetail(order.id);
      const fullOrderDetails: FullOrderDetails = {
        ...detailData,
        items: detailData.current_order?.items || detailData.items || [],
        total_amount: parseFloat(detailData.total_amount as string),
      };
      setEditingOrder(fullOrderDetails);
    } catch {
      setEditingOrder({
        ...order,
        items: order.items || [],
        total_amount: parseFloat(order.total_amount as string),
      });
    }
  };

  // 🔹 Cập nhật đơn hàng - Đã sửa
  const handleUpdateOrder = async (
    id: number,
    data: { status?: string; payment_status?: string; payment_method?: string }
  ) => {
    setLoading(true);
    try {
      await updateOrder(id, data);
      toast.success("Cập nhật đơn hàng thành công!");
      // ✅ Gọi fetchOrders với tất cả tham số lọc hiện tại
      await fetchOrders(pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
      setEditingOrder(null);
    } catch {
      toast.error("Cập nhật đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xóa đơn hàng - Đã sửa
  const handleDeleteOrder = async (id: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
      try {
        await deleteOrder(id);
        toast.success("🗑️ Xóa đơn hàng thành công!");
        // ✅ Gọi fetchOrders với tất cả tham số lọc hiện tại
        await fetchOrders(pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
      } catch {
        toast.error("❌ Xóa đơn hàng thất bại!");
      }
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        Quản lý Đơn hàng
      </h1>

      {/* 1. Thanh công cụ tìm kiếm & Lọc Cửa hàng */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID hoặc Khách hàng..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            title="store-filter"
            value={selectedStoreId === "" ? "" : String(selectedStoreId)}
            onChange={handleFilterByStore}
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
            className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150 w-full md:w-auto"
          >
            Tìm kiếm
          </button>
        </form>

        <button
          onClick={() => toast("🚀 Chức năng tạo đơn hàng đang được phát triển!")}
          className="flex items-center justify-center space-x-2 px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-150 w-full md:w-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tạo Đơn hàng Mới</span>
        </button>
      </div>
      
      {/* 2. BỘ LỌC KIỂU TAB */}
      <OrderStatusTabs
          currentOrderStatus={orderStatusFilter}
          onSelectOrderStatus={handleSelectOrderStatus}
          currentPaymentStatus={paymentStatusFilter}
          onSelectPaymentStatus={handleSelectPaymentStatus}
      />
      <div className="py-4"></div> {/* Khoảng trống cho dễ nhìn */}

      {/* Hiển thị danh sách */}
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

      {/* Modal chi tiết */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder as Order}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Modal sửa trạng thái */}
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