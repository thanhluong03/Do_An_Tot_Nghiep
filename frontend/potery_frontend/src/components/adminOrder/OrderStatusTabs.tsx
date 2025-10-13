import React from 'react';
import { OrderStatus, PaymentStatus } from "@/api/services/orderService";

const ORDER_TABS: { value: OrderStatus | "", label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "CREATED", label: "Mới tạo" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "REJECTED", label: "Từ chối" },
];

const PAYMENT_TABS: { value: PaymentStatus | "", label: string }[] = [
  { value: "", label: "Tất cả TT" },
  { value: "UNPAID", label: "Chưa TT" },
  { value: "PENDING", label: "Đang xử lý TT" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

interface OrderStatusTabsProps {
  currentOrderStatus: OrderStatus | "";
  onSelectOrderStatus: (status: OrderStatus | "") => void;
  currentPaymentStatus: PaymentStatus | "";
  onSelectPaymentStatus: (status: PaymentStatus | "") => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 
      ${isActive
        ? 'bg-orange-600 text-white shadow-md hover:bg-orange-700'
        : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-500 hover:text-orange-600'}
    `}
  >
    {label}
  </button>
);

export default function OrderStatusTabs({
  currentOrderStatus,
  onSelectOrderStatus,
  currentPaymentStatus,
  onSelectPaymentStatus,
}: OrderStatusTabsProps) {
  return (
    <div className="space-y-4"> 
      <div className="flex flex-col md:flex-row md:items-start gap-3">
        <span className="text-gray-700 font-bold text-sm min-w-[120px] pt-2">Trạng thái ĐH:</span>
        <div className="flex flex-wrap gap-2 md:flex-grow">
          {ORDER_TABS.map((tab) => (
            <TabButton
              key={tab.value}
              label={tab.label}
              isActive={currentOrderStatus === tab.value}
              onClick={() => onSelectOrderStatus(tab.value)}
            />
          ))}
        </div>
      </div>

      {/* Trạng thái thanh toán */}
      <div className="flex flex-col md:flex-row md:items-start gap-3 pt-2 border-t border-gray-100"> 
        <span className="text-gray-700 font-bold text-sm min-w-[120px] pt-2">Trạng thái TT:</span>
        <div className="flex flex-wrap gap-2 md:flex-grow">
          {PAYMENT_TABS.map((tab) => (
            <TabButton
              key={tab.value}
              label={tab.label}
              isActive={currentPaymentStatus === tab.value}
              onClick={() => onSelectPaymentStatus(tab.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}