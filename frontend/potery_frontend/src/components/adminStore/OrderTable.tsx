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

// Hàm tính tổng tiền đơn hàng theo logic của OrderDetailModal

const getTotalAmount = (order: Order): number => {
  const displayTotalAmount = typeof order.total_amount === "string"
    ? parseFloat(order.total_amount)
    : order.total_amount;

  // Lấy shipping từ items
  const items = order.current_order?.items || [];

  const totalShippingFee = items.reduce((sum, item: any) => {
    return sum + (item.shipping_fee || 0);
  }, 0);

  return displayTotalAmount + totalShippingFee;
};

const getStatusColor = (status: OrderStatus | PaymentStatus): string => {
  switch (status) {

    // --- NORMAL ORDER FLOW ---

    case "CREATED":
      return "bg-orange-100 text-orange-700"; // Chờ xác nhận

    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700"; // Xác nhận đơn hàng

    case "PACKING":
      return "bg-cyan-100 text-cyan-700"; // Đang đóng gói

    case "PENDING_DELIVERY":
      return "bg-blue-100 text-blue-700"; // Chờ giao hàng

    case "SHIPPING":
      return "bg-yellow-100 text-yellow-700"; // Đang giao

    case "DELIVERED":
      return "bg-green-100 text-green-700"; // Đã giao thành công

    case "DELIVERY_FAILED":
      return "bg-red-200 text-red-800"; // Giao hàng thất bại

    case "CANCELLED":
      return "bg-red-100 text-red-700"; // Hủy đơn hàng

    // --- RETURN FLOW ---

    case "RETURN_REQUESTED":
      return "bg-pink-100 text-pink-700"; // Đang yêu cầu hoàn trả

    case "CONFIRMED_RETURN":
      return "bg-lime-100 text-lime-700"; // Xác nhận hoàn trả

    case "PACKING_RETURN":
      return "bg-cyan-200 text-cyan-800"; // Đang đóng gói hoàn trả

    case "PENDING_DELIVERY_RETURN":
      return "bg-teal-100 text-teal-700"; // Chờ giao hàng hoàn trả

    case "SHIPPING_RETURN":
      return "bg-amber-100 text-amber-700"; // Đang vận chuyển hoàn trả

    case "DELIVERY_FAILED_RETURN":
      return "bg-red-200 text-red-800"; // Giao hàng hoàn trả thất bại

    case "CANCELLED_RETURN":
      return "bg-red-100 text-red-700"; // Đã hủy hoàn trả

    case "EXCHANGED":
      return "bg-purple-100 text-purple-700"; // Đã đổi trả

    // --- PAYMENT STATUS ---

    case "UNPAID":
      return "bg-red-100 text-red-700";

    case "PAID":
      return "bg-green-100 text-green-700";

    case "REFUNDED":
      return "bg-purple-100 text-purple-700";

    // --- DEFAULT ---
    default:
      return "bg-gray-100 text-gray-700";
  }
};


// ⚙️ Hàm dịch trạng thái sang tiếng Việt
const translateStatus = (status: OrderStatus | PaymentStatus): string => {
  const translations: Record<string, string> = {

    // --- NORMAL ORDER STATUS ---

    CREATED: "Chờ xác nhận",
    CONFIRMED: "Xác nhận đơn hàng",
    PACKING: "Đang đóng gói",
    PENDING_DELIVERY: "Chờ giao hàng",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao thành công",
    DELIVERY_FAILED: "Giao hàng thất bại",
    CANCELLED: "Hủy đơn hàng",

    // --- RETURN STATUS ---

    RETURN_REQUESTED: "Đang yêu cầu đổi trả",
    CONFIRMED_RETURN: "Xác nhận đổi trả",
    PACKING_RETURN: "Đang đóng gói đổi trả",
    SHIPPING_RETURN: "Đang vận chuyển đổi trả",
    PENDING_DELIVERY_RETURN: "Chờ giao hàng đổi trả",
    DELIVERY_FAILED_RETURN: "Giao hàng đổi trả thất bại",
    CANCELLED_RETURN: "Đã hủy đổi trả",

    EXCHANGED: "Đã đổi trả",

    // --- PAYMENT ---

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
          <tr><th className="px-4 py-3 font-semibold text-xs">Mã đơn</th>
            <th className="px-4 py-3 font-semibold text-xs">Khách hàng</th>
            <th className="px-4 py-3 font-semibold text-xs">Tổng tiền</th>
            <th className="px-4 py-3 text-center font-semibold text-xs">Trạng thái đơn hàng</th>
            <th className="px-4 py-3 text-center font-semibold text-xs">Trạng thái thanh toán</th>
            <th className="px-4 py-3 font-semibold text-xs">Ngày đặt</th>
            <th className="px-4 py-3 text-center font-semibold text-xs">Gán tài xế</th>
            <th className="px-4 py-3 text-center font-semibold text-xs">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (<tr
              key={order.id}
              className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-100">
              <td className="px-4 py-3 font-semibold text-indigo-600 text-xs">#{order.id}</td>
              <td className="px-4 py-3 text-xs">{order.customer_name || `Khách #${order.customer_id}`}</td>
              <td className="px-4 py-3 font-medium text-gray-900 text-xs">
                {formatCurrency(getTotalAmount(order))}
              </td>
              <td className="px-4 py-3 text-center text-xs">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-xs">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.payment_status
                  )}`}
                >
                  {translateStatus(order.payment_status)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs">
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

              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                {order.status === 'PENDING_DELIVERY'|| order.status === 'PENDING_DELIVERY_RETURN' ? (
                  <div className="flex items-center space-x-2 min-w-[250px]">
                    {order.driverLocations && order.driverLocations.length > 0 ? (
                      <select
                        title="Tài xế đã gán"
                        value={order.driverLocations[0].driver.id}
                        disabled
                        className="block w-full pl-3 pr-10 py-2 text-xs border-gray-300 bg-gray-100 text-gray-700 rounded-md cursor-not-allowed"
                      >
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.full_name || driver.username}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        title="Chọn tài xế"
                        value={selectedDriver[order.id] || ''}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="block w-full pl-3 pr-10 py-2 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md cursor-pointer"
                      >
                        <option value="">Chọn tài xế</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.full_name || driver.username}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => onAssignDriver(order.id, Number(selectedDriver[order.id]))}
                      disabled={order.driverLocations && order.driverLocations.length > 0 ? false : !selectedDriver[order.id]}
                      className={`p-2 text-white bg-green-600 rounded-md hover:bg-green-700 ${order.driverLocations && order.driverLocations.length > 0 ? '' : 'disabled:bg-gray-400 disabled:cursor-not-allowed'}`}
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
                  className="p-2 rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {order.status !== "CANCELLED" && order.status !== "CANCELLED_RETURN" && (
                  <button
                    title="Chỉnh sửa trạng thái"
                    onClick={() => onEditStatus(order)}
                    className="p-2 rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 cursor-pointer"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                )}

                {(order.status === 'SHIPPING' || order.status === 'CONFIRMED') && onViewTracking && (
                  <button
                    title="Xem tracking"
                    onClick={() => onViewTracking(order)}
                    className="p-2 rounded-md text-green-600 bg-green-100 hover:bg-green-200 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                )}
                <button
                  title="Xóa đơn hàng"
                  onClick={() => onDelete(order.id)}
                  className="p-2 rounded-md text-red-600 bg-red-100 hover:bg-red-200 cursor-pointer"
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
