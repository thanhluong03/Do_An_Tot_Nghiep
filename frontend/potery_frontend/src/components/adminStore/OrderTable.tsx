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
  // Tổng tiền sản phẩm (đã có từ backend)
  const displayTotalAmount = typeof order.total_amount === "string"
    ? parseFloat(order.total_amount)
    : order.total_amount;

  // Lấy thông tin giao dịch chính (giống OrderDetailModal)
  const orderWithTransactions = order as Order & {
    paymentTransactions?: Array<{
      amount?: number | string;
      gateway_txn_ref?: string;
      created_at?: string;
      txn_status?: string;
    }>
  };
  const paymentTransactions = orderWithTransactions.paymentTransactions || [];
  const mainTxn = paymentTransactions.length > 0 ? paymentTransactions[0] : null;

  // Tính phí vận chuyển từ transaction data (giống OrderDetailModal)
  const shippingFeeFromTransaction = mainTxn && mainTxn.amount ?
    Math.max(0, Number(mainTxn.amount) - displayTotalAmount) : 30000;
  const displayShippingFee = shippingFeeFromTransaction > 0 ? shippingFeeFromTransaction : 30000;

  // Tổng cuối cùng = tổng sản phẩm + phí vận chuyển
  return displayTotalAmount + displayShippingFee;
};// Màu nền theo trạng thái
const getStatusColor = (status: OrderStatus | PaymentStatus): string => {
  switch (status) {
    // --- Order Statuses ---
    case "CREATED":
      return "text-orange-700 bg-orange-100"; // Chờ xác nhận
    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700"; // Đã xác nhận
    case "PACKING":
      return "bg-cyan-100 text-cyan-700"; // Đang đóng gói (New - Light Blue/Cyan)
    case "PENDING_DELIVERY":
      return "bg-blue-100 text-blue-700"; // Chờ giao hàng (New - Blue)
    case "SHIPPING":
      return "bg-yellow-100 text-yellow-700"; // Đang giao
    case "DELIVERED":
      return "bg-green-100 text-green-700"; // Đã giao thành công
    case "DELIVERY_FAILED":
      return "bg-red-200 text-red-800"; // Giao hàng thất bại (New - Darker Red for failure)

    case "CANCELLED":
      return "bg-red-100 text-red-700"; // Đã hủy
    case "REJECTED":
      return "bg-gray-200 text-gray-700"; // Bị từ chối

    // --- Return/Exchange Statuses ---
    case "RETURN_REQUESTED":
      return "bg-pink-100 text-pink-700"; // Đang yêu cầu hoàn trả
    case "PENDING_RETURN":
      return "bg-fuchsia-100 text-fuchsia-700"; // Chờ hoàn trả (New - Fuchsia)
    case "CONFIRMED_RETURN":
      return "bg-lime-100 text-lime-700"; // Đã xác nhận hoàn trả (New - Lime Green)
    case "SHIPPING_RETURN":
      return "bg-amber-100 text-amber-700"; // Đang vận chuyển hoàn trả (New - Amber)
    case "PENDING_DELIVERY_RETURN":
      return "bg-teal-100 text-teal-700"; // Chờ giao hàng hoàn trả (New - Teal)
    case "EXCHANGED":
      return "bg-purple-100 text-purple-700"; // Đã đổi trả

    // --- Payment Statuses (Existing) ---
    case "UNPAID":
      return "bg-red-100 text-red-700";
    case "PAID":
      return "bg-green-100 text-green-700";
    case "REFUNDED":
      return "bg-purple-100 text-purple-700"; // (Can be the same as EXCHANGED if needed)

    default:
      return "bg-gray-100 text-gray-700";
  }
};
// ⚙️ Hàm dịch trạng thái sang tiếng Việt
const translateStatus = (status: OrderStatus | PaymentStatus): string => {
  const translations: Record<string, string> = {
    // Trạng thái đơn hàng
    CREATED: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang vận chuyển",
    DELIVERED: "Đã giao thành công",
    REJECTED: "Bị từ chối",
    EXCHANGED: "Đã đổi trả",
    RETURN_REQUESTED: "Đang yêu cầu hoàn trả",
    PENDING_RETURN: "Chờ hoàn trả",
    CONFIRMED_RETURN: "Đã xác nhận hoàn trả",
    PENDING_DELIVERY: "Chờ giao hàng",
    DELIVERY_FAILED: "Giao hàng thất bại",
    PACKING: "Đang đóng gói",
    SHIPPING_RETURN: "Đang vận chuyển hoàn trả",
    PENDING_DELIVERY_RETURN: "Chờ giao hàng hoàn trả",
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
                {formatCurrency(getTotalAmount(order))}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
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
                {order.status !== "CANCELLED" && order.status !== "REJECTED" && (
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
