"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
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
import { getCustomers, Customer } from "@/api/services/customerService";
import OrderTable from "@/components/adminOrder/OrderTable";
import OrderDetailModal from "@/components/adminOrder/OrderDetailModal";
import OrderStatusModal from "@/components/adminOrder/OrderStatusModal";
import OrderStatusTabs from "@/components/adminOrder/OrderStatusTabs";
import { Download } from "lucide-react";
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
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<FullOrderDetails[]>([]);
  const [allOrders, setAllOrders] = useState<FullOrderDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<SelectOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | "">("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "">("");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FullOrderDetails | null>(null);
  const [editingOrder, setEditingOrder] = useState<FullOrderDetails | null>(null);
  const [orderToDeleteId, setOrderToDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error("Không thể tải danh sách khách hàng!"));
    listDropdownStores()
      .then(setStores)
      .catch(() => toast.error("Không thể tải danh sách cửa hàng!"));
  }, []);

  async function fetchAllOrders() {
    try {
      // ⭐️ CẬP NHẬT: Thay đổi cách nhận dữ liệu từ listOrders
      const response = await listOrders({ size: 10000, page: 1 }); // Lấy số lượng lớn để đếm cho tabs
      const data = response.data;

      const ordersWithNames = data.map((order) => ({
        // ... (logic mapping)
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
  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        key: "",
        store_id: selectedStoreId || undefined,
        status: orderStatusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
      };

      // ⭐️ CẬP NHẬT: Nhận đối tượng response có data và total
      const response = await listOrders(params);

      const ordersWithNames = response.data.map((order) => ({
        // ... (logic mapping)
        ...order,
        customer_name:
          customers.find((u) => u.id === order.customer_id)?.full_name ||
          `Khách #${order.customer_id}`,
        total_amount: typeof order.total_amount === "number"
          ? order.total_amount
          : parseFloat(order.total_amount as string),
        items: order.items || [],
      }));

      setOrders(ordersWithNames);
      setTotalOrders(response.total); // <-- LƯU TỔNG SỐ ĐƠN HÀNG
    } catch {
      setError("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (customers.length > 0) {
      fetchAllOrders();
      fetchOrders();
    }
  }, [customers, pagination.page, pagination.size, selectedStoreId, orderStatusFilter, paymentStatusFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  const handleExportExcel = async () => {
    try {
      const response = await fetch("http://localhost:3000/orders/export-excel", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Không thể xuất file Excel!");
        return;
      }

      // Tạo blob từ dữ liệu nhận về
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ <a> ẩn để tải file
      const link = document.createElement("a");
      link.href = url;
      link.download = "DanhSachDonHang.xlsx";
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Đã tải file Excel thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải file Excel!");
    }
  };
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
  const renderPageNumbers = () => {
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
    <div className="p-6 bg-white min-h-screen shadow-md border border-gray-200">
      <Toaster position="top-right" />
      <div className=" mx-auto bg-white rounded-2x overflow-hidden">
        <div className="py-6 border-b border-gray-200 text-center bg-white">
          <h1 className="text-3xl font-bold text-[#B95D26] tracking-tight">
            Quản lý đơn hàng
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
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
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center space-x-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Tải file Excel</span>
          </button>
        </div>

        <div className="p-4 border-gray-200">
          <OrderStatusTabs
            allOrders={allOrders}
            currentOrderStatus={orderStatusFilter}
            onSelectOrderStatus={setOrderStatusFilter}
            currentPaymentStatus={paymentStatusFilter}
            onSelectPaymentStatus={setPaymentStatusFilter}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            Tổng: {allOrders.length} đơn hàng
          </div>
        </div>

        <div className="p-4">
          {loading && <p className="text-center text-indigo-600 py-6 font-medium">Đang tải danh sách đơn hàng...</p>}
          {error && <p className="text-center text-red-600 py-6 font-medium">Lỗi: {error}</p>}
          {!loading && !error && (
            <OrderTable orders={orders} onView={handleViewOrder} onEditStatus={handleEditStatus} onDelete={handleDeleteOrder} />
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
          onUpdated={(data) => handleUpdateOrder(editingOrder.id, data)}
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
