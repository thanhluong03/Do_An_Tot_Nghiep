// src/components/adminOrder/OrderStatusTabs.tsx
"use client";
import React, { useMemo } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/api/services/orderService";

interface OrderStatusTabsProps {
  orders: Order[]; // <- bắt buộc
  currentOrderStatus: OrderStatus | "";
  onSelectOrderStatus: (status: OrderStatus | "") => void;
  currentPaymentStatus: PaymentStatus | "";
  onSelectPaymentStatus: (status: PaymentStatus | "") => void;
}

/** Các tab hiển thị */
const ORDER_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "CREATED", label: "Chờ duyệt" },
  { value: "CONFIRMED", label: "Chờ lấy hàng" },
  { value: "SHIPPING", label: "Chờ giao hàng" },
  { value: "DELIVERED", label: "Hoàn thành" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "REJECTED", label: "Từ chối" },
];

const PAYMENT_TABS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả TT" },
  { value: "UNPAID", label: "Chưa TT" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "PAID", label: "Đã TT" },
  { value: "REFUNDED", label: "Hoàn tiền" },
];

export default function OrderStatusTabs({
  orders,
  currentOrderStatus,
  onSelectOrderStatus,
  currentPaymentStatus,
  onSelectPaymentStatus,
}: OrderStatusTabsProps) {
  // đếm trạng thái đơn hàng thật từ orders
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders || []) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    counts[""] = orders?.length || 0;
    return counts;
  }, [orders]);

  // đếm trạng thái thanh toán thật từ orders
  const paymentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders || []) {
      counts[o.payment_status] = (counts[o.payment_status] || 0) + 1;
    }
    counts[""] = orders?.length || 0;
    return counts;
  }, [orders]);

  return (
    <div className="space-y-2">
      {/* order status row */}
      <div className="flex flex-wrap items-center border-b border-gray-200 text-sm font-medium">
        {ORDER_TABS.map((tab) => {
          const isActive = currentOrderStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectOrderStatus(tab.value)}
              className={`relative px-4 py-3 transition-all duration-150 ${
                isActive ? "text-orange-600 font-semibold" : "text-gray-600 hover:text-orange-600"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs text-gray-500">({orderCounts[tab.value] || 0})</span>
              {isActive && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-orange-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* payment status row */}
      <div className="flex flex-wrap items-center border-b border-gray-200 text-sm font-medium pt-1">
        {PAYMENT_TABS.map((tab) => {
          const isActive = currentPaymentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectPaymentStatus(tab.value)}
              className={`relative px-4 py-3 transition-all duration-150 ${
                isActive ? "text-orange-600 font-semibold" : "text-gray-600 hover:text-orange-600"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs text-gray-500">({paymentCounts[tab.value] || 0})</span>
              {isActive && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-orange-500 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
