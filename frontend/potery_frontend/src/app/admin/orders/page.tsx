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
  sendOrderRejectedMail,
  sendOrderConfirmedMail,
} from "@/api/services/orderService";
import { getCustomers, Customer } from "@/api/services/customerService";
import { getAvailableDrivers, assignDriverToOrder } from "@/api/services/deliveryService";
import OrderTable from "@/components/adminOrder/OrderTable";
import { User } from "@/api/services/userService";
import OrderDetailModal from "@/components/adminOrder/OrderDetailModal";
import OrderStatusModal from "@/components/adminOrder/OrderStatusModal";
import OrderTrackingModal from "@/components/adminOrder/OrderTrackingModal";
import OrderStatusTabs from "@/components/adminOrder/OrderStatusTabs";
import { Download, Search, Calendar, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface PageButtonProps {
  page: number;
  isActive: boolean;
  onClick: (page: number) => void;
}
const PageButton: React.FC<PageButtonProps> = ({ page, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(page)}
      disabled={isActive}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition duration-200 
                ${isActive
          ? 'bg-[#B95D26] text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
    >
      {page}
    </button>
  );
};
interface SelectOption {
  id: number;
  name: string;
}

interface FullOrderDetails extends Omit<Order, "total_amount" | "items"> {
  total_amount: number;
  items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<FullOrderDetails[]>([]);
  const [allOrders, setAllOrders] = useState<FullOrderDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [stores, setStores] = useState<SelectOption[]>([]);

  // Filter States
  const [selectedStoreId, setSelectedStoreId] = useState<number | "">("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "">("");

  // ⭐️ CẬP NHẬT: Thêm state cho tìm kiếm và lọc ngày
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Dùng để gọi API sau khi ngừng gõ
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FullOrderDetails | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderStatus, setTrackingOrderStatus] = useState<string>('');
  const [trackingCustomerAddress, setTrackingCustomerAddress] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<FullOrderDetails | null>(null);
  const [orderToDeleteId, setOrderToDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  // Thêm state này vào đầu component AdminOrderPage
const [keyAndDateFilteredOrders, setKeyAndDateFilteredOrders] = useState<FullOrderDetails[]>([]);
  // Chỉ gọi fetchAllOrders 1 lần khi khởi tạo hoặc khi danh sách khách hàng thay đổi
  useEffect(() => {
    getCustomers({})
      .then(setCustomers)
      .catch(() => toast.error("Không thể tải danh sách khách hàng!"));
    listDropdownStores()
      .then(setStores)
      .catch(() => toast.error("Không thể tải danh sách cửa hàng!"));
    getAvailableDrivers()
      .then(setDrivers)
      .catch(() => toast.error("Không thể tải danh sách tài xế!"));
  }, []);

  // ⭐️ CẬP NHẬT: Logic Debounce cho ô tìm kiếm (tránh spam API)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
    }, 500); // Delay 500ms

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Khi thay đổi bộ lọc ngày tháng, cũng reset về trang 1
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [startDate, endDate, selectedStoreId, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    if (customers.length > 0) {
      fetchAllOrders();
    }
  }, [customers, debouncedSearchTerm, startDate, endDate]); // ⭐️ CẬP NHẬT: Thêm dependency để đếm lại tab khi lọc

  async function fetchAllOrders() {
    try {
      // ⭐️ CẬP NHẬT: Thêm params vào fetchAllOrders để các Tab hiển thị số lượng đúng theo bộ lọc
      const params = {
        size: 10000,
        page: 1,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        store_id: selectedStoreId || undefined,
      };

      const response = await listOrders(params);
      const data = response.data;

      const ordersWithNames = data.map((order) => ({
        ...order,
        customer_name:
          customers.find((u) => u.id === order.customer_id)?.full_name ||
          `Khách #${order.customer_id}`,
        total_amount: typeof order.total_amount === "number"
          ? order.total_amount
          : parseFloat(order.total_amount as string),
        items: order.items || [],
      }));
      setAllOrders(ordersWithNames);
    } catch {
      toast.error("Không thể tải thống kê đơn hàng!");
    }
  }
  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };
// TẠI: async function fetchOrders()
async function fetchOrders() {
  if (allOrders.length === 0) {
    setTotalOrders(0);
    setOrders([]);
    setKeyAndDateFilteredOrders([]); // 👈 Thêm
    return;
  }

  let filteredOrders = allOrders;

  // 1. LỌC THEO TÊN KHÁCH HÀNG / MÃ ĐƠN HÀNG (Dựa trên allOrders)
  if (debouncedSearchTerm.trim() !== "") {
    const searchKey = debouncedSearchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(order =>
      order.customer_name?.toLowerCase().includes(searchKey) ||
      String(order.id).includes(searchKey)
    );
  }

  // 2. LỌC THEO THỜI GIAN (Ngày tạo)
  if (startDate) {
    const start = new Date(startDate).getTime();
    filteredOrders = filteredOrders.filter(o => {
      if (!o.created_at) return false;
      return new Date(o.created_at).getTime() >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Cộng thêm 1 ngày để bao gồm hết ngày cuối
    const endTime = end.getTime();
    filteredOrders = filteredOrders.filter(o => {
      if (!o.created_at) return false;
      return new Date(o.created_at).getTime() < endTime;
    });
  }

  // ⭐️ BƯỚC MỚI: Cập nhật danh sách đã lọc theo Key/Date (Dùng cho Tabs)
  setKeyAndDateFilteredOrders(filteredOrders);

  // 3. LỌC THEO STATUS VÀ PAYMENT STATUS (Dùng cho Bảng)
  let finalFilteredOrders = filteredOrders;
  if (orderStatusFilter) {
    finalFilteredOrders = finalFilteredOrders.filter(o => o.status === orderStatusFilter);
  }
  if (paymentStatusFilter) {
    finalFilteredOrders = finalFilteredOrders.filter(o => o.payment_status === paymentStatusFilter);
  }

  // 4. THỰC HIỆN PHÂN TRANG (LOCAL PAGINATION)
  const totalCount = finalFilteredOrders.length;
  const startIndex = (pagination.page - 1) * pagination.size;
  const endIndex = startIndex + pagination.size;
  const paginatedOrders = finalFilteredOrders.slice(startIndex, endIndex);

  setOrders(paginatedOrders);
  setTotalOrders(totalCount);
  setLoading(false); // Kết thúc loading ở đây
}
useEffect(() => {
    if (customers.length > 0) {
      fetchAllOrders();
    }
  }, [customers, selectedStoreId]);
  // ⭐️ CẬP NHẬT: Thêm các biến mới vào dependency array
  useEffect(() => {
    // Set loading trước khi lọc
    setLoading(true);
    fetchOrders();
  }, [
    allOrders, // Kích hoạt lọc local khi tải xong tất cả
    pagination.page,
    pagination.size,
    orderStatusFilter,
    paymentStatusFilter,
    debouncedSearchTerm,
    startDate,
    endDate
  ]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExportExcel = async () => {
    // ... (Giữ nguyên logic cũ, có thể cần cập nhật params nếu API export hỗ trợ lọc)
    try {
      // Build query string thủ công để kèm theo bộ lọc hiện tại
      const params = new URLSearchParams({
        key: debouncedSearchTerm,
        store_id: selectedStoreId ? String(selectedStoreId) : "",
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`http://localhost:3000/orders/export-excel?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Không thể xuất file Excel!");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DanhSachDonHang_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải file Excel thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải file Excel!");
    }
  };

  // ... (Giữ nguyên các hàm handleDeleteOrder, handleAssignDriver, v.v...)
  const handleDeleteOrder = (id: number) => {
    setOrderToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (orderToDeleteId === null) return;
    const id = orderToDeleteId;
    setIsDeleteModalOpen(false);
    setOrderToDeleteId(null);
    setLoading(true);
    try {
      await deleteOrder(id);
      toast.success("Xóa đơn hàng thành công!");
      await fetchOrders();
      await fetchAllOrders();
    } catch {
      toast.error("Xóa đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancelled = () => {
    setIsDeleteModalOpen(false);
    setOrderToDeleteId(null);
  };

  const handleViewOrder = async (order: Order) => {
    setLoading(true);
    try {
      const detail = await getOrderDetail(order.id);
      const customerName = customers.find(u => u.id === order.customer_id)?.full_name || `Khách #${order.customer_id}`
      const fullOrder: FullOrderDetails = {
        ...detail,
        items: detail.current_order?.items || detail.items || [],
        total_amount: parseFloat(detail.total_amount as string),
        customer_name: customerName,
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

  const handleOrderUpdated = async (orderId: number, updateData: any) => {
    setLoading(true);
    try {
      await updateOrder(orderId, updateData);
      toast.success("Cập nhật đơn hàng thành công!");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateData } : o));
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateData } : o));

      const order = orders.find(o => o.id === orderId);
      const customerEmail = order?.customer_email;
      if (customerEmail && order?.is_login_customer === false) {
        if (updateData.status === "CONFIRMED") await sendOrderConfirmedMail({ orderId, to: customerEmail });
        else if (updateData.status === "REJECTED") await sendOrderRejectedMail({ orderId, to: customerEmail });
      }

      setEditingOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể cập nhật đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: number, driverId: number) => {
    if (!driverId) {
      toast.error("Vui lòng chọn một tài xế.");
      return;
    }
    try {
      setLoading(true);
      await assignDriverToOrder({ order_id: orderId, driver_id: driverId });
      toast.success(`Gán tài xế cho đơn hàng #${orderId} thành công!`);
      await fetchOrders();
      await fetchAllOrders();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Gán tài xế thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPageNumbers = () => {
    // ... (Giữ nguyên logic phân trang)
    const totalPages = Math.ceil(totalOrders / pagination.size);
    const currentPage = pagination.page;
    const maxButtons = 5;
    const pages = [];

    if (totalPages <= 1) return null;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    if (startPage > 1) {
      pages.push(
        <PageButton key={1} page={1} isActive={false} onClick={handlePageChange} />
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" className="px-1 py-2 text-sm text-gray-500">...</span>);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton key={i} page={i} isActive={i === currentPage} onClick={handlePageChange} />
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" className="px-1 py-2 text-sm text-gray-500">...</span>);
      }
      pages.push(
        <PageButton key={totalPages} page={totalPages} isActive={false} onClick={handlePageChange} />
      );
    }

    return pages;
  };

  return (
    <div className="bg-white min-h-screen shadow-md border border-gray-200">
      <Toaster position="top-right" />
      <div className="mx-auto bg-white rounded-2x overflow-hidden">
        <div className="py-6 border-b border-gray-200 text-center bg-white">
          <h1 className="text-3xl font-bold text-[#B95D26] tracking-tight">
            Quản lý đơn hàng
          </h1>
        </div>

        {/* ⭐️ CẬP NHẬT: Giao diện bộ lọc */}
        <div className="p-4 border-b border-gray-200 flex flex-col gap-4">

          {/* Hàng 1: Tìm kiếm + Chọn cửa hàng + Nút Export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Chọn cửa hàng */}
              <select
                title="store-filter"
                value={selectedStoreId === "" ? "" : String(selectedStoreId)}
                onChange={(e) =>
                  setSelectedStoreId(e.target.value ? Number(e.target.value) : "")
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-auto text-sm text-gray-500"
              >
                <option className="text-gray-200" value="">Tất cả cửa hàng</option>
                {stores.map((store) => (
                  <option key={store.id} value={String(store.id)}>
                    {store.name}
                  </option>
                ))}
              </select>
              {/* Ô tìm kiếm */}
              <div className="relative w-full md:w-100">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm tên khách, mã đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>



              {/* Bộ lọc ngày tháng */}
             <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500 mr-2 hidden lg:inline">Thời gian:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm outline-none text-gray-600 w-full md:w-auto cursor-pointer"
                    title="Từ ngày"
                  />
                  <span className="mx-2 text-gray-400">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm outline-none text-gray-600 w-full md:w-auto cursor-pointer"
                    title="Đến ngày"
                    min={startDate}
                  />
                  
                  {/* Nút Clear xuất hiện khi có 1 trong 2 ngày được chọn */}
                  {(startDate || endDate) && (
                    <button 
                      onClick={handleClearDates}
                      className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                      title="Xóa bộ lọc ngày"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center space-x-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition w-full md:w-auto text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-gray-200">
          <OrderStatusTabs
            allOrders={keyAndDateFilteredOrders}
            currentOrderStatus={orderStatusFilter}
            onSelectOrderStatus={setOrderStatusFilter}
            currentPaymentStatus={paymentStatusFilter}
            onSelectPaymentStatus={setPaymentStatusFilter}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            Tổng: {totalOrders} kết quả phù hợp
          </div>
        </div>

        <div className="p-4">
          {loading && <p className="text-center text-indigo-600 py-6 font-medium">Đang tải danh sách đơn hàng...</p>}
          {error && <p className="text-center text-red-600 py-6 font-medium">Lỗi: {error}</p>}
          {!loading && !error && (
            <OrderTable
              orders={orders}
              drivers={drivers}
              onView={handleViewOrder}
              onEditStatus={handleEditStatus}
              onDelete={handleDeleteOrder}
              onAssignDriver={handleAssignDriver}
              onViewTracking={(order) => {
                setTrackingOrderId(order.id);
                setTrackingOrderStatus(order.status);
                setTrackingCustomerAddress(order.shipping_address || '');
              }} />
          )}
          {!loading && !error && totalOrders > pagination.size && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-4 md:mb-0">
                Hiển thị <span className="font-bold text-gray-800">{((pagination.page - 1) * pagination.size) + 1}</span> -
                <span className="font-bold text-gray-800"> {Math.min(pagination.page * pagination.size, totalOrders)}</span> trên tổng số <span className="font-bold text-indigo-600">{totalOrders}</span> đơn hàng
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-sm"
                >
                  &larr;
                </button>

                <div className="flex items-center space-x-1">
                  {renderPageNumbers()}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.size >= totalOrders}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-sm"
                >
                  &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder as Order} onClose={() => setSelectedOrder(null)} />
      )}
      {editingOrder && (
        <OrderStatusModal
          orderId={editingOrder.id}
          currentStatus={editingOrder.status}
          currentPaymentStatus={editingOrder.payment_status}
          currentPaymentMethod={editingOrder.payment_method}
          onClose={() => setEditingOrder(null)}
          onUpdated={handleOrderUpdated}
        />
      )}
      {trackingOrderId && (
        <OrderTrackingModal
          orderId={trackingOrderId}
          orderStatus={trackingOrderStatus}
          customerAddress={trackingCustomerAddress}
          onClose={() => {
            setTrackingOrderId(null);
            setTrackingOrderStatus('');
            setTrackingCustomerAddress('');
          }}
        />
      )}
      {isDeleteModalOpen && orderToDeleteId !== null && (
        <ConfirmDialog
          title="Xác nhận Xóa Đơn hàng"
          message={`Bạn có chắc chắn muốn xóa đơn hàng #${orderToDeleteId}? Thao tác này không thể hoàn tác.`}
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy bỏ"
          onConfirm={handleDeleteConfirmed}
          onCancel={handleDeleteCancelled}
        />
      )}
    </div>
  );
}