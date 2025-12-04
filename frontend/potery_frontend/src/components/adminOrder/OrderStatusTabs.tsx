"use client";
import React, { useMemo } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/api/services/orderService";
import { ChevronDown } from 'lucide-react';

interface Props {
  allOrders: Order[];
  currentOrderStatus: OrderStatus | "";
  onSelectOrderStatus: (status: OrderStatus | "") => void;
  currentPaymentStatus: PaymentStatus | "";
  onSelectPaymentStatus: (status: PaymentStatus | "") => void;
}

// --- 1. Tabs Chính (Trạng thái thường dùng và cần theo dõi) ---
const MAIN_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "CREATED", label: "Chờ xác nhận" }, 
  { value: "CONFIRMED", label: "Đã xác nhận" }, 
  { value: "PACKING", label: "Đang đóng gói" },
  { value: "PENDING_DELIVERY", label: "Chờ giao hàng" },
  { value: "SHIPPING", label: "Đang vận chuyển" }, 
  { value: "DELIVERED", label: "Đã giao thành công" }, 
  { value: "DELIVERY_FAILED", label: "Giao hàng thất bại" },
  { value: "CANCELLED", label: "Đã hủy" }, 
  { value: "EXCHANGED", label: "Đã đổi trả" },
];

// --- 2. Trạng thái Nâng cao/Chi tiết (Gom vào Dropdown) ---
const ADVANCED_STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "RETURN_REQUESTED", label: "Đang yêu cầu hoàn trả" },
  { value: "CONFIRMED_RETURN", label: "Đã xác nhận hoàn trả" },
  { value: "PACKING_RETURN", label: "Đang đóng gói hoàn trả" },
  { value: "SHIPPING_RETURN", label: "Đang vận chuyển hoàn trả" },
  { value: "PENDING_DELIVERY_RETURN", label: "Chờ giao hàng hoàn trả" },
  { value: "DELIVERY_FAILED_RETURN", label: "Giao hàng hoàn trả thất bại" },
  { value: "CANCELLED_RETURN", label: "Đã hủy hoàn trả" },
  
];

// --- 3. Tổng hợp tất cả (Dùng để tìm kiếm Label) ---
const ALL_ORDER_STATUSES = [...MAIN_TABS, ...ADVANCED_STATUS_OPTIONS];

// Trạng thái thanh toán (Giữ nguyên)
const PAYMENT_OPTIONS: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "UNPAID", label: "Chưa thanh toán" },
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
  // Logic tính toán orderCounts và paymentCounts (Giữ nguyên)
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
  
  // Logic xác định trạng thái đang chọn và label (Giữ nguyên)
  const currentStatusObject = useMemo(() => {
    return ALL_ORDER_STATUSES.find(s => s.value === currentOrderStatus);
  }, [currentOrderStatus]);
  
  const currentStatusLabel = currentStatusObject ? currentStatusObject.label : "Trạng thái khác";
  
  const isMainTabSelected = useMemo(() => {
    return MAIN_TABS.some(tab => tab.value === currentOrderStatus);
  }, [currentOrderStatus]);


  return (
    // Container chính bao gồm hai hàng (Tabs và Thanh toán)
    <div className="flex flex-col gap-4">
      {/* --- HÀNG 1: Tabs Trạng thái Đơn hàng và Dropdown Nâng cao --- */}
      <div className="flex flex-wrap items-end justify-between border-b border-gray-200 pb-2">
        
        {/* Nhóm Tabs Chính */}
        <div className="flex flex-wrap items-center text-sm font-medium border-b border-gray-200">
          {MAIN_TABS.map((tab) => {
            const isActive = currentOrderStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onSelectOrderStatus(tab.value)}
                className={`relative px-4 py-2.5 whitespace-nowrap transition-all group ${
                  isActive && isMainTabSelected 
                  ? "text-orange-600 font-semibold" 
                  : "text-gray-600 hover:text-orange-600"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs text-gray-500">
                  ({orderCounts[tab.value] || 0})
                </span>
                {isActive && isMainTabSelected && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center text-sm font-medium">
          {ADVANCED_STATUS_OPTIONS.map((tab) => {
            const isActive = currentOrderStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onSelectOrderStatus(tab.value)}
                className={`relative px-4 py-2.5 whitespace-nowrap transition-all group ${
                  isActive && isMainTabSelected 
                  ? "text-orange-600 font-semibold" 
                  : "text-gray-600 hover:text-orange-600"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs text-gray-500">
                  ({orderCounts[tab.value] || 0})
                </span>
                {isActive && isMainTabSelected && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dropdown Trạng thái Nâng cao (Đặt ở bên phải hàng 1) */}
        {/* <div className="relative inline-block mt-2 md:mt-0">
          <select
            title="Advanced Status"
            value={isMainTabSelected ? "" : currentOrderStatus} 
            onChange={(e) => onSelectOrderStatus(e.target.value as OrderStatus | "")}
            className={`
              appearance-none 
              border border-gray-300 rounded-lg 
              px-4 py-2 pr-8 text-sm font-medium transition-all cursor-pointer w-40
              ${!isMainTabSelected 
                ? "bg-orange-100 text-orange-700 border-orange-400" 
                : "bg-white text-gray-700 hover:border-gray-400"
              }
            `}
          >
            <option value="" disabled={!isMainTabSelected}>
                {isMainTabSelected ? "Trạng thái khác" : currentStatusLabel}
            </option>
            
            {ADVANCED_STATUS_OPTIONS.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
              >
                {option.label} ({orderCounts[option.value] || 0})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div> */}
      </div> {/* Kết thúc HÀNG 1 */}

      {/* --- HÀNG 2: Dropdown Trạng thái Thanh toán --- */}
      <div className="items-end gap-2">
        <label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">
          Trạng thái thanh toán:
        </label>
        <select
          id="paymentStatus"
          value={currentPaymentStatus}
          onChange={(e) => onSelectPaymentStatus(e.target.value as PaymentStatus | "")}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm cursor-pointer"
        >
          {PAYMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({paymentCounts[option.value] || 0})
            </option>
          ))}
        </select>
      </div> {/* Kết thúc HÀNG 2 */}
    </div>
  );
}