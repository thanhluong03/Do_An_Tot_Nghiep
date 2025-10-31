"use client";
import React, { useState } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/api/services/orderService";
import { User } from "@/api/services/userService";
import { Trash2, Package, Eye, Truck, MapPin } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  drivers: User[];
  onView: (order: Order) => void;
  onEditStatus: (order: Order) => void;
  onDelete: (id: number) => void;
  onAssignDriver: (orderId: number, driverId: number) => void;
  onViewTracking?: (order: Order) => void;
}

// Định dạng tiền Việt Nam
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

// Màu nền theo trạng thái
const getStatusColor = (status: OrderStatus | PaymentStatus) => {
  switch (status) {
    case "CREATED":
      return "bg-blue-100 text-blue-700";
    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700";
    case "SHIPPING":
      return "bg-yellow-100 text-yellow-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "REJECTED":
      return "bg-gray-200 text-gray-700";

    case "UNPAID":
      return "bg-red-100 text-red-700";
    case "PAID":
      return "bg-green-100 text-green-700";
    case "REFUNDED":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// ⚙️ Hàm dịch trạng thái sang tiếng Việt
const translateStatus = (status: OrderStatus | PaymentStatus): string => {
  const translations: Record<string, string> = {
    // Trạng thái đơn hàng
    CREATED: "Đã tạo",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    REJECTED: "Bị từ chối",
    CANCELLED: "Đã hủy",

    // Trạng thái thanh toán
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn tiền",
  };

  return translations[status] || status;
};

export default function OrderTable({
  orders,
  drivers,
  onView,
  onEditStatus,
  onDelete,
  onAssignDriver,
  onViewTracking,
}: OrderTableProps) {
  const [selectedDriver, setSelectedDriver] = useState<{ [key: number]: string }>({});

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-indigo-50 text-indigo-800 border-b border-indigo-200">
          <tr><th className="px-4 py-3 font-semibold">Mã đơn</th>
            <th className="px-4 py-3 font-semibold">Khách hàng</th>
            <th className="px-4 py-3 font-semibold">Tổng tiền</th>
            <th className="px-4 py-3 text-center font-semibold">Trạng thái đơn hàng</th>
            <th className="px-4 py-3 text-center font-semibold">Trạng thái thanh toán</th>
            <th className="px-4 py-3 font-semibold">Ngày đặt</th>
            <th className="px-4 py-3 text-center font-semibold">Gán tài xế</th>
            <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (<tr
              key={order.id}
              className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-100">
              <td className="px-4 py-3 font-semibold text-indigo-600">#{order.id}</td>
              <td className="px-4 py-3">{order.customer_name || `Khách #${order.customer_id}`}</td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {formatCurrency(Number(order.total_amount))}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                    order.status
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                    order.payment_status
                  )}`}
                >
                  {translateStatus(order.payment_status)}
                </span>
              </td>
             <td className="px-4 py-3 text-gray-600">
              {order.order_date
                ? new Date(order.order_date).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Không có ngày"}
            </td>

              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {order.status === 'CONFIRMED' ? (
                  <div className="flex items-center space-x-2 min-w-[250px]">
                    <select
                      value={selectedDriver[order.id] || ''}
                      onChange={(e) => setSelectedDriver(prev => ({ ...prev, [order.id]: e.target.value }))}
                      className="block w-full pl-3 pr-10 py-2 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    >
                      <option value="">Chọn tài xế</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.full_name || driver.username}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onAssignDriver(order.id, Number(selectedDriver[order.id]))}
                      disabled={!selectedDriver[order.id]}
                      className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      title="Gán tài xế"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Không thể gán</span>
                )}
              </td>

              <td className="px-4 py-3 text-center space-x-2">
                <button
                  title="Xem chi tiết"
                  onClick={() => onView(order)}
                  className="p-2 rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  title="Chỉnh sửa trạng thái"
                  onClick={() => onEditStatus(order)}
                  className="p-2 rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Package className="w-4 h-4" />
                </button>
                {(order.status === 'SHIPPING' || order.status === 'CONFIRMED') && onViewTracking && (
                  <button
                    title="Xem tracking"
                    onClick={() => onViewTracking(order)}
                    className="p-2 rounded-md text-green-600 bg-green-100 hover:bg-green-200"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                )}
                <button
                  title="Xóa đơn hàng"
                  onClick={() => onDelete(order.id)}
                  className="p-2 rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                Không tìm thấy đơn hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
