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


  // 🔹 Lấy danh sách đơn hàng (Bao gồm logic lọc mới)
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
      // Chỉ thêm tham số vào request nếu giá trị không phải là rỗng ("")
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

  // 🔹 useEffect để gọi fetchOrders khi các tham số thay đổi
  // => Đây là nơi duy nhất nên gọi API khi các filter state thay đổi (trừ khi nhấn nút Search)
  useEffect(() => {
    // Gọi fetchOrders mỗi khi có bất kỳ tham số lọc nào thay đổi
    fetchOrders(
      pagination.page,
      pagination.size,
      searchTerm,
      selectedStoreId,
      orderStatusFilter,
      paymentStatusFilter
    );
  }, [fetchOrders, pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter]);

  // 🔹 Tìm kiếm đơn hàng (khi nhấn nút Tìm kiếm)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Đặt lại trang về 1 và gọi API ngay lập tức
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Gọi API để thấy kết quả ngay lập tức
    fetchOrders(1, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
  };

  // 🔹 Lọc theo cửa hàng (Chỉ cập nhật state, để useEffect gọi API)
  const handleFilterByStore = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const storeId = value ? Number(value) : "";
    setSelectedStoreId(storeId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // LOẠI BỎ: fetchOrders() - useEffect sẽ làm việc này
  };

  // 🔹 Xử lý chọn Trạng thái Đơn hàng (Chỉ cập nhật state, để useEffect gọi API)
  const handleSelectOrderStatus = (status: OrderStatus | "") => {
    setOrderStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // LOẠI BỎ: fetchOrders() - useEffect sẽ làm việc này
  };

  // 🔹 Xử lý chọn Trạng thái Thanh toán (Chỉ cập nhật state, để useEffect gọi API)
  const handleSelectPaymentStatus = (paymentStatus: PaymentStatus | "") => {
    setPaymentStatusFilter(paymentStatus);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // LOẠI BỎ: fetchOrders() - useEffect sẽ làm việc này
  };


  // 🔹 Xem chi tiết (Giữ nguyên)
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

  // 🔹 Sửa trạng thái (Giữ nguyên)
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

  // 🔹 Cập nhật đơn hàng (Giữ nguyên logic gọi fetchOrders sau update)
  const handleUpdateOrder = async (
    id: number,
    data: { status?: string; payment_status?: string; payment_method?: string }
  ) => {
    setLoading(true);
    try {
      await updateOrder(id, data);
      toast.success("Cập nhật đơn hàng thành công!");
      // Gọi fetchOrders với tất cả tham số lọc hiện tại để refresh data
      await fetchOrders(pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
      setEditingOrder(null);
    } catch {
      toast.error("Cập nhật đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xóa đơn hàng (Giữ nguyên logic gọi fetchOrders sau delete)
  const handleDeleteOrder = async (id: number) => {
    // Thay window.confirm bằng toast/modal tùy chỉnh sau
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
      try {
        await deleteOrder(id);
        toast.success("🗑️ Xóa đơn hàng thành công!");
        // Gọi fetchOrders với tất cả tham số lọc hiện tại để refresh data
        await fetchOrders(pagination.page, pagination.size, searchTerm, selectedStoreId, orderStatusFilter, paymentStatusFilter);
      } catch {
        toast.error("❌ Xóa đơn hàng thất bại!");
      }
    }
  };


return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <Toaster position="top-right" reverseOrder={false} />

    {/* 🔹 Khối chứa toàn bộ nội dung đơn hàng */}
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

      {/* 🌟 Tiêu đề */}
      <div className="py-6 border-b border-gray-200 text-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Quản lý Đơn hàng
        </h1>
      </div>

      {/* 🔍 Thanh tìm kiếm + tạo đơn hàng */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-3 w-full md:w-auto md:flex-grow"
        >
          <div className="relative flex-grow min-w-[200px] md:min-w-0">
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
            onChange={handleFilterByStore}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-auto min-w-[150px]"
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
            className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150 w-full md:w-auto min-w-[100px]"
          >
            Tìm kiếm
          </button>
        </form>

        <button
          onClick={() => toast("🚀 Chức năng tạo đơn hàng đang được phát triển!")}
          className="flex items-center justify-center space-x-2 px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-150 w-full md:w-auto min-w-[200px] mt-3 md:mt-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tạo Đơn hàng Mới</span>
        </button>
      </div>

      {/* 📊 Tabs trạng thái */}
      <div className="p-4 border-b border-gray-200">
        <OrderStatusTabs
          currentOrderStatus={orderStatusFilter}
          onSelectOrderStatus={handleSelectOrderStatus}
          currentPaymentStatus={paymentStatusFilter}
          onSelectPaymentStatus={handleSelectPaymentStatus}
        />
      </div>

      {/* 🧾 Danh sách đơn hàng */}
      <div className="p-4">
        {loading && (
          <p className="text-center text-indigo-600 py-6 font-medium">
            Đang tải danh sách đơn hàng...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 py-6 font-medium">Lỗi: {error}</p>
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
