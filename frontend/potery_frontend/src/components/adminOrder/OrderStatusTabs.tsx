"use client";
import React, { useMemo } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/api/services/orderService";

interface Props {
  allOrders: Order[];
  currentOrderStatus: OrderStatus | "";
  onSelectOrderStatus: (status: OrderStatus | "") => void;
  currentPaymentStatus: PaymentStatus | "";
  onSelectPaymentStatus: (status: PaymentStatus | "") => void;
}

const ORDER_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "CREATED", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang vận chuyển" },
  { value: "DELIVERED", label: "Đã giao thành công" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "RETURN_REQUESTED", label: "Đang yêu cầu hoàn trả" },
  { value: "EXCHANGED", label: "Đã hoàn trả" },
];

const PAYMENT_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
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
    for (const o of allOrders) counts[o.payment_status] = (counts[o.payment_status] || 0) + 1;
    counts[""] = allOrders.length;
    return counts;
  }, [allOrders]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {/* Tab trạng thái đơn */}
      <div className="flex flex-wrap items-center border-b border-gray-200 text-sm font-medium">
        {ORDER_TABS.map((tab) => {
          const isActive = currentOrderStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSelectOrderStatus(tab.value)}
              className={`relative px-4 py-3 transition-all ${isActive
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

      {/* Dropdown trạng thái thanh toán (bên phải) */}
      <div className="flex items-center gap-2">
        <label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
          Thanh toán:
        </label>
        <select
          id="paymentStatus"
          value={currentPaymentStatus}
          onChange={(e) => onSelectPaymentStatus(e.target.value as PaymentStatus | "")}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
        >
          {PAYMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({paymentCounts[option.value] || 0})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
