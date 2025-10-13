// src/components/adminOrder/OrderStatusTabs.tsx
import React from 'react';
import { OrderStatus, PaymentStatus } from "@/api/services/orderService";

// Định nghĩa các TABS cho Trạng thái Đơn hàng
const ORDER_TABS: { value: OrderStatus | "", label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: "CREATED", label: "Mới tạo" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "CANCELED", label: "Đã hủy" },
    { value: "REJECTED", label: "Từ chối" },
];

// Định nghĩa các TABS cho Trạng thái Thanh toán
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
        className={`
            px-4 py-2 text-sm font-medium transition-all duration-150
            ${isActive
                ? 'border-b-2 border-orange-600 text-orange-600 font-bold' // Trạng thái active
                : 'text-gray-500 hover:text-gray-900' // Trạng thái bình thường
            }
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
        <div className="space-y-4 pt-2">
            {/* Lọc Trạng thái Đơn hàng */}
            <div className="flex flex-wrap gap-x-6 border-b border-gray-200">
                <span className="text-gray-700 font-medium text-sm pr-2 self-end pb-2">Trạng thái ĐH:</span>
                {ORDER_TABS.map((tab) => (
                    <TabButton
                        key={tab.value}
                        label={tab.label}
                        isActive={currentOrderStatus === tab.value}
                        onClick={() => onSelectOrderStatus(tab.value)}
                    />
                ))}
            </div>

            {/* Lọc Trạng thái Thanh toán */}
            <div className="flex flex-wrap gap-x-6 border-b border-gray-200">
                <span className="text-gray-700 font-medium text-sm pr-2 self-end pb-2">Trạng thái TT:</span>
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
    );
}