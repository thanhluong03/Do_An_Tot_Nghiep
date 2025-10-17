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
      const data = await listOrders({});
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
      const data = await listOrders(params);
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
      setOrders(ordersWithNames);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="py-6 border-b border-gray-200 text-center bg-gray-50">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý Đơn hàng
          </h1>
        </div>

        {/* Bộ lọc + nút Excel */}
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
