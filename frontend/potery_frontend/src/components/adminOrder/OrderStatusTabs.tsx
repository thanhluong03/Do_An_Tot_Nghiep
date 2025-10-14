"use client";
import React, { useMemo } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/api/services/orderService";

interface Props {
  allOrders: Order[]; // 🟢 dùng danh sách toàn bộ đơn hàng
  currentOrderStatus: OrderStatus | "";
  onSelectOrderStatus: (status: OrderStatus | "") => void;
  currentPaymentStatus: PaymentStatus | "";
  onSelectPaymentStatus: (status: PaymentStatus | "") => void;
}

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
  allOrders,
  currentOrderStatus,
  onSelectOrderStatus,
  currentPaymentStatus,
  onSelectPaymentStatus,
}: Props) {
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of allOrders) counts[o.status] = (counts[o.status] || 0) + 1;
    counts[""] = allOrders.length;
    return counts;
  }, [allOrders]);

  const paymentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of allOrders)
      counts[o.payment_status] = (counts[o.payment_status] || 0) + 1;
    counts[""] = allOrders.length;
    return counts;
  }, [allOrders]);

  return (
    <div className="space-y-2">
      {/* Trạng thái đơn hàng */}
      <div className="flex flex-wrap items-center border-b border-gray-200 text-sm font-medium">
        {ORDER_TABS.map((tab) => {
          const isActive = currentOrderStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectOrderStatus(tab.value)}
              className={`relative px-4 py-3 transition-all ${
                isActive
                  ? "text-orange-600 font-semibold"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs text-gray-500">
                ({orderCounts[tab.value] || 0})
              </span>
              {isActive && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Trạng thái thanh toán */}
      <div className="flex flex-wrap items-center border-b border-gray-200 text-sm font-medium pt-1">
        {PAYMENT_TABS.map((tab) => {
          const isActive = currentPaymentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectPaymentStatus(tab.value)}
              className={`relative px-4 py-3 transition-all ${
                isActive
                  ? "text-orange-600 font-semibold"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs text-gray-500">
                ({paymentCounts[tab.value] || 0})
              </span>
              {isActive && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
