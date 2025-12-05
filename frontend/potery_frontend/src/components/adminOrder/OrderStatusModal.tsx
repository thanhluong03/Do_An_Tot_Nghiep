"use client";
import React, { useEffect, useState } from "react";
// Giả định các types và service imports từ file của bạn
import { updateOrder, OrderStatus, PaymentStatus, PaymentMethod, Order } from "@/api/services/orderService";
import { X, CheckCircle } from "lucide-react";

interface Props {
    orderId: number;
    currentStatus: OrderStatus;
    currentPaymentStatus: PaymentStatus;
    currentPaymentMethod: PaymentMethod;
    onClose: () => void;
    onUpdated: (id: number, data: Record<string, unknown>) => void;
    // Giả định thêm các prop cho dữ liệu hủy ban đầu nếu có
    initialCancelReason?: string | null;
    // Đã loại bỏ initialCancelDate khỏi Props
    initialCancelDate?: string | null;
    initialPersonCancel?: string | null;
}

// =========================================================================
// 1. LOGIC VÀ DỊCH THUẬT (Translation & Flow Logic)
// =========================================================================

// Danh sách tất cả các trạng thái và bản dịch tiếng Việt
const statusTranslations: Record<OrderStatus, string> = {
    CREATED: "Chờ xác nhận",
    CONFIRMED: "Xác nhận đơn hàng",
    SHIPPING: "Đang vận chuyển",
    DELIVERED: "Đã giao thành công",
    EXCHANGED: "Đã đổi trả",
    RETURN_REQUESTED: "Đang yêu cầu đổi trả",
    CANCELLED: "Hủy đơn hàng",

    CONFIRMED_RETURN: "Xác nhận yêu cầu đổi trả",
    PENDING_DELIVERY: "Chờ người giao hàng",
    DELIVERY_FAILED: "Giao hàng thất bại",
    PACKING: "Đang đóng gói",
    SHIPPING_RETURN: "Đang vận chuyển đổi trả",
    PENDING_DELIVERY_RETURN: "Chờ giao hàng đổi trả",
    DELIVERY_FAILED_RETURN: "Giao hàng đổi trả thất bại",
    CANCELLED_RETURN: "Hủy đổi trả đối với đơn hàng",
    PACKING_RETURN: "Đang đóng gói đổi trả",
};

// Danh sách CÁC TRẠNG THÁI MÀ ADMIN ĐƯỢC PHÉP SỬA qua modal này
const AdminAllowedStatuses: OrderStatus[] = [
    "CREATED",
    "CONFIRMED",
    "PACKING",
    "PENDING_DELIVERY",
    "CONFIRMED_RETURN",
    "PACKING_RETURN",
    "PENDING_DELIVERY_RETURN",
    "CANCELLED_RETURN",
    "EXCHANGED",
    "CANCELLED",
];

// Hàm màu trạng thái giống OrderTable
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
        case "PENDING_REFUND":
            return "bg-blue-100 text-blue-700";
        // --- DEFAULT ---
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const translateOrderStatus = (status: OrderStatus): string => {
    return statusTranslations[status] || status;
};

const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const allowed = AdminAllowedStatuses;

    const available: OrderStatus[] = [currentStatus];
    const isFinal =
        currentStatus === "CANCELLED" ||
        currentStatus === "CANCELLED_RETURN" ||
        currentStatus === "EXCHANGED" ||
        currentStatus === "DELIVERED";

    if (!isFinal) {
        available.push(
            currentStatus.includes("RETURN") ? "CANCELLED_RETURN" : "CANCELLED"
        );
    }
    switch (currentStatus) {
        // ---------- NORMAL ORDER FLOW ----------
        case "CREATED":
            available.push("CONFIRMED");
            break;

        case "CONFIRMED":
            available.push("PACKING");
            break;

        case "PACKING":
            available.push("PENDING_DELIVERY");
            break;

        case "PENDING_DELIVERY":
            // chỉ cho cancel
            break;
        case "RETURN_REQUESTED":
            available.push("CONFIRMED_RETURN");
            break;
        // ---------- RETURN FLOW ----------
        case "CONFIRMED_RETURN":
            available.push("PACKING_RETURN");
            break;

        case "PACKING_RETURN":
            available.push("PENDING_DELIVERY_RETURN");
            break;

        case "PENDING_DELIVERY_RETURN":
            // chỉ cancel return
            break;

        // ---------- END STATES ----------
        case "EXCHANGED":
        case "CANCELLED":
        case "CANCELLED_RETURN":
        case "DELIVERED":
            return [currentStatus];
    }
    let finalStatuses = Array.from(new Set(available)).filter(s =>
        allowed.includes(s)
    );

    // =============================================
    // 4) Đưa current lên đầu
    // =============================================
    if (!finalStatuses.includes(currentStatus)) {
        finalStatuses.unshift(currentStatus);
    } else {
        finalStatuses = finalStatuses.sort((a, b) =>
            a === currentStatus ? -1 : 1
        );
    }

    return finalStatuses;
};


// Hàm tiện ích để định dạng ngày giờ (Đã loại bỏ vì không dùng)
// const getDateTimeLocalString = (dateInput?: string | null): string => {
//     return (dateInput ? new Date(dateInput) : new Date()).toISOString().slice(0, 16);
// };

const DEFAULT_PERSON_CANCEL = "ADMIN";
// =========================================================================
// 2. COMPONENT CHÍNH (Main Component)
// =========================================================================

export default function OrderStatusModal({
    orderId,
    currentStatus,
    currentPaymentStatus,
    currentPaymentMethod,
    onClose,
    onUpdated,
    initialCancelReason,
    // Đã loại bỏ initialCancelDate khỏi destructuring
    // initialCancelDate, 
    initialPersonCancel,
}: Props) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(currentPaymentMethod);
    const [loading, setLoading] = useState(false);

    // KHỞI TẠO CÁC STATE CHO THÔNG TIN HỦY (Đã loại bỏ cancelDate state)
    const [cancelReason, setCancelReason] = useState<string>(initialCancelReason || "");
    const [personCancel, setPersonCancel] = useState<string>(initialPersonCancel || DEFAULT_PERSON_CANCEL);

    // State để theo dõi trạng thái hoàn tiền khi hủy đơn hàng đã thanh toán
    const [refundStatus, setRefundStatus] = useState<PaymentStatus | null>(null);
    // const [cancelDate, setCancelDate] = useState<string>(...);

    // Khi chọn trạng thái "DELIVERED", tự động đặt thanh toán thành "PAID"
    useEffect(() => {
        if (status === "DELIVERED" && paymentStatus !== "PAID") {
            setPaymentStatus("PAID");
        }

        // Reset refundStatus khi chuyển khỏi trạng thái CANCELLED
        if (status !== "CANCELLED" && status !== "CANCELLED_RETURN") {
            setRefundStatus(null);
        }
    }, [status, paymentStatus]);


    const availableStatuses = getAvailableStatuses(currentStatus);
    const isCancelledStatus = status === "CANCELLED" || status === "CANCELLED_RETURN";

    // Kiểm tra xem đơn hàng đã bị hủy từ trước chưa
    const isAlreadyCancelled = currentStatus === "CANCELLED" || currentStatus === "CANCELLED_RETURN";

    // Kiểm tra xem có đang hủy đơn mới không (chuyển từ trạng thái khác sang CANCELLED)
    const isCancellingNow = isCancelledStatus && !isAlreadyCancelled;

    // Kiểm tra đơn cần hoàn tiền
    const needsRefund = currentPaymentStatus === "PAID" || currentPaymentStatus === "PENDING_REFUND";

    const executeSave = async () => {
        setLoading(true);
        try {
            let updateData: Record<string, unknown> = {
                status,
                payment_status: paymentStatus,
                payment_method: paymentMethod,
            };

            if (isCancellingNow) {
                // Đang hủy đơn mới - yêu cầu lý do hủy
                if (!cancelReason.trim()) {
                    alert("Vui lòng điền Lý do hủy.");
                    setLoading(false);
                    return;
                }

                // Nếu đơn hàng đã thanh toán và đã chọn trạng thái hoàn tiền
                if (needsRefund && refundStatus) {
                    updateData = {
                        ...updateData,
                        payment_status: refundStatus, // REFUNDED hoặc PENDING_REFUND
                        cancel_reason: cancelReason.trim() || null,
                        person_cancel: personCancel.trim() || null,
                        actorType: 'ADMIN',
                    };
                } else {
                    updateData = {
                        ...updateData,
                        cancel_reason: cancelReason.trim() || null,
                        person_cancel: personCancel.trim() || null,
                        actorType: 'ADMIN',
                    };
                }
            } else if (isAlreadyCancelled && refundStatus) {
                // Đơn đã hủy, chỉ cập nhật trạng thái thanh toán
                updateData = {
                    ...updateData,
                    payment_status: refundStatus,
                };
            } else {
                // Đảm bảo các trường hủy được reset/gửi null nếu không phải là "CANCELLED"
                updateData = {
                    ...updateData,
                    cancel_reason: null,
                    cancel_date: null, // Vẫn gửi null cho backend để xóa/reset trường này
                    person_cancel: null,
                    actorType: null, // Gửi null để backend reset actorType
                };
            }

            // Giả định `onUpdated` đã thực hiện gọi API `updateOrder`
            await onUpdated(orderId, updateData);
            onClose();
        } catch (error) {
            console.error("Error updating order:", error);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClick = () => {
        // Nếu đang hủy đơn mới (không phải đơn đã hủy), yêu cầu lý do
        if (isCancellingNow && !cancelReason.trim()) {
            alert("Vui lòng điền Lý do hủy.");
            return;
        }

        // Nếu hủy đơn hàng đã thanh toán, bắt buộc chọn trạng thái hoàn tiền
        if (isCancellingNow && needsRefund && !refundStatus) {
            alert("Vui lòng chọn trạng thái hoàn tiền.");
            return;
        }

        // Nếu đơn đã hủy và đang cập nhật trạng thái thanh toán, yêu cầu chọn
        if (isAlreadyCancelled && currentPaymentStatus === "PENDING_REFUND" && !refundStatus) {
            alert("Vui lòng chọn trạng thái hoàn tiền.");
            return;
        }

        executeSave();
    };

    // Lấy ra giá trị so sánh ban đầu để xử lý trường hợp null/undefined
    const initialCancelReasonValue = initialCancelReason || "";
    const initialPersonCancelValue = initialPersonCancel || DEFAULT_PERSON_CANCEL;
    // const initialCancelDateValue = getDateTimeLocalString(initialCancelDate); // Đã loại bỏ

    // Kiểm tra xem có thay đổi nào được thực hiện không
    const hasChanges = (
        status !== currentStatus ||
        paymentStatus !== currentPaymentStatus ||
        paymentMethod !== currentPaymentMethod ||

        // Kiểm tra khi đang hủy đơn mới
        (isCancellingNow && (
            cancelReason !== initialCancelReasonValue ||
            personCancel !== initialPersonCancelValue ||
            (needsRefund && refundStatus !== null)
        )) ||

        // Kiểm tra khi đơn đã hủy và cập nhật trạng thái thanh toán
        (isAlreadyCancelled && refundStatus !== null) ||

        // Nếu chuyển từ CANCELLED sang trạng thái khác (cần lưu updateData reset fields thành null)
        (!isCancelledStatus && currentStatus === "CANCELLED")
    );

    return (
        <>
            {/* Overlay và Modal chính */}
            <div className="fixed inset-0 bg-black/30 z-[1100] flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-[700px] p-8 relative">
                    <button
                        title="close"
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-semibold mb-5 text-gray-900">Cập nhật Trạng thái Đơn hàng</h2>

                    <div className="space-y-4">

                        {/* ⭐️ PHẦN CẬP NHẬT TRẠNG THÁI MỚI (Dùng Buttons) ⭐️ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái đơn hàng</label>

                            <div className="flex flex-wrap gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                {availableStatuses.map((s) => {
                                    const isCurrent = s === currentStatus;
                                    const isSelected = s === status;
                                    const isCancel = s.includes("CANCELLED");

                                    // 1. CSS cho trạng thái hiện tại (Current Status - Không bấm được)
                                    if (isCurrent && s === status) {
                                        return (
                                            <div
                                                key={s}
                                                className={`px-4 py-2 font-semibold rounded-full cursor-default shadow-md ${getStatusColor(s as OrderStatus)}`}
                                                title={`Trạng thái hiện tại: ${translateOrderStatus(s)}`}
                                            >
                                                <CheckCircle className="inline w-4 h-4 mr-1" />
                                                {translateOrderStatus(s)}
                                            </div>
                                        );
                                    }

                                    // 2. CSS cho trạng thái chuyển tiếp (Selectable Status)
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                const newStatus = s as OrderStatus;
                                                setStatus(newStatus);

                                                // Reset/Set mặc định logic tương tự như trong dropdown
                                                if (newStatus !== "CANCELLED") {
                                                    setCancelReason(initialCancelReason || "");
                                                    setPersonCancel(initialPersonCancel || DEFAULT_PERSON_CANCEL);
                                                } else if (currentStatus !== "CANCELLED") {
                                                    setPersonCancel(DEFAULT_PERSON_CANCEL);
                                                }
                                            }}
                                            className={`px-4 py-2 font-medium rounded-full transition-all border 
                                                ${isSelected // Nếu trạng thái này được chọn (nhưng không phải là currentStatus)
                                                    ? 'bg-orange-100 border-orange-600 text-orange-700 shadow-sm'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                                                }
                                                ${isCancel && !isSelected ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
                                            `}
                                            title={`Chuyển sang: ${translateOrderStatus(s)}`}
                                        >
                                            {translateOrderStatus(s)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* ⭐️ KẾT THÚC PHẦN CẬP NHẬT TRẠNG THÁI MỚI ⭐️ */}


                        {/* FORM ĐIỀN THÔNG TIN HỦY - Chỉ hiện khi đang hủy đơn mới */}
                        {isCancellingNow && (
                            <div className="space-y-4 p-4 border border-red-300 rounded-lg bg-red-50">
                                <h3 className="text-lg font-semibold text-red-600">Thông tin hủy Đơn hàng</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy <span className="text-red-500">*</span></label>
                                    <textarea
                                        title="cancel reason"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        rows={3}
                                        className="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập lý do hủy đơn hàng..."
                                    />
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Người hủy đơn hàng</label>
                                    <input
                                        type="text"
                                        title="person cancelled"
                                        value={personCancel}
                                        onChange={(e) => setPersonCancel(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div> */}

                                {/* Hiển thị select trạng thái hoàn tiền nếu đơn hàng cần hoàn tiền */}
                                {needsRefund && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái hoàn tiền <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            title="refund status"
                                            value={refundStatus || ""}
                                            onChange={(e) => {
                                                const selectedRefundStatus = e.target.value as PaymentStatus;
                                                setRefundStatus(selectedRefundStatus);
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="">-- Chọn trạng thái hoàn tiền --</option>
                                            <option value="REFUNDED">Đã hoàn trả</option>
                                            <option value="PENDING_REFUND">Chưa hoàn trả</option>
                                        </select>

                                        {refundStatus === ("PENDING_REFUND" as PaymentStatus) && (
                                            <p className="mt-2 text-sm text-amber-600">
                                                Đơn hàng sẽ được đánh dấu &quot;Chưa hoàn trả&quot;. Bạn có thể cập nhật sau.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FORM CẬP NHẬT TRẠNG THÁI HOÀN TIỀN CHO ĐơN ĐÃ HỦY */}
                        {isAlreadyCancelled && currentPaymentStatus === "PENDING_REFUND" && (
                            <div className="space-y-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
                                <h3 className="text-lg font-semibold text-blue-600">Cập nhật trạng thái hoàn tiền</h3>
                                <p className="text-sm text-gray-600">Đơn hàng đã bị hủy. Vui lòng cập nhật trạng thái hoàn tiền.</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái hoàn tiền <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        title="refund status"
                                        value={refundStatus || ""}
                                        onChange={(e) => {
                                            const selectedRefundStatus = e.target.value as PaymentStatus;
                                            setRefundStatus(selectedRefundStatus);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Chọn trạng thái hoàn tiền --</option>
                                        <option value="REFUNDED">Đã hoàn trả</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={loading || !hasChanges}
                            className={`flex items-center gap-2 px-5 py-2 font-medium rounded-lg transition 
                                ${loading || !hasChanges
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}