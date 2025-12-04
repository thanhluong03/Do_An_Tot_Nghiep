"use client";
import React, { useState } from "react";
// Giả định các types và service imports từ file của bạn
import { updateOrder, OrderStatus, PaymentStatus, PaymentMethod, Order } from "@/api/services/orderService";
import { X, CheckCircle, Save } from "lucide-react";

interface Props {
    orderId: number;
    currentStatus: OrderStatus;
    currentPaymentStatus: PaymentStatus;
    currentPaymentMethod: PaymentMethod;
    onClose: () => void;
    onUpdated: (id: number, data: any) => void;
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
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao thành công",
    REJECTED: "Từ chối đơn hàng này",
    EXCHANGED: "Đã đổi trả",
    RETURN_REQUESTED: "Đang yêu cầu hoàn trả",
    CANCELLED: "Hủy đơn hàng",
    PENDING_RETURN: "Chờ hoàn trả",
    CONFIRMED_RETURN: "Xác nhận hoàn trả",
    PENDING_DELIVERY: "Chờ giao hàng",
    DELIVERY_FAILED: "Giao hàng thất bại",
    PACKING: "Đang đóng gói",
    SHIPPING_RETURN: "Đang vận chuyển hoàn trả",
    PENDING_DELIVERY_RETURN: "Chờ giao hàng hoàn trả",
};

// Danh sách CÁC TRẠNG THÁI MÀ ADMIN ĐƯỢC PHÉP SỬA qua modal này
const AdminAllowedStatuses: OrderStatus[] = [
    "CREATED",
    "CONFIRMED",
    "PACKING",
    "PENDING_DELIVERY",
    "CONFIRMED_RETURN",
    "EXCHANGED",
    "REJECTED",
    "CANCELLED",
];

const translateOrderStatus = (status: OrderStatus): string => {
    return statusTranslations[status] || status;
};

// Hàm lọc trạng thái để ngăn chuyển ngược và giới hạn lựa chọn (Giữ nguyên)
const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const allowed = AdminAllowedStatuses;

    let available: OrderStatus[] = [currentStatus];

    // 1. Luôn thêm trạng thái hủy nếu nó chưa phải là trạng thái cuối cùng
    if (currentStatus !== "CANCELLED" && currentStatus !== "REJECTED" && currentStatus !== "DELIVERED" && currentStatus !== "EXCHANGED") {
        available.push("CANCELLED");
    }

    // 2. Xử lý logic chuyển tiếp chính (ngăn chuyển ngược và giới hạn options)
    if (currentStatus === "CREATED") {
        available = [...available, "CONFIRMED", "CANCELLED"];
    } else if (currentStatus === "CONFIRMED") {
        available = [...available, "PACKING", "CANCELLED"];
    } else if (currentStatus === "PACKING") {
        available = [...available, "PENDING_DELIVERY", "CANCELLED"];
    } else if (currentStatus === "PENDING_DELIVERY") {
        available = [...available, "CANCELLED"];
    } else if (currentStatus === "RETURN_REQUESTED") {
        available = [...available, "CONFIRMED_RETURN", "CANCELLED"];
    } else if (currentStatus === "CONFIRMED_RETURN") {
        available = [...available, "EXCHANGED", "CANCELLED"];
    } else if (currentStatus === "EXCHANGED" || currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
        // Trạng thái cuối cùng, không thể thay đổi, chỉ giữ trạng thái hiện tại
        return [currentStatus];
    }

    // 3. Lọc lại kết quả để chỉ bao gồm các trạng thái được phép và loại bỏ trùng lặp
    let finalStatuses = Array.from(new Set(available))
        .filter(s => allowed.includes(s));

    // Đảm bảo trạng thái hiện tại luôn là option đầu tiên và có mặt
    if (!finalStatuses.includes(currentStatus)) {
        finalStatuses.unshift(currentStatus);
    } else {
        // Đặt currentStatus lên đầu danh sách
        finalStatuses = finalStatuses.sort((a, b) => (a === currentStatus ? -1 : 1));
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
    const [isConfirmingSave, setIsConfirmingSave] = useState(false);

    // KHỞI TẠO CÁC STATE CHO THÔNG TIN HỦY (Đã loại bỏ cancelDate state)
    const [cancelReason, setCancelReason] = useState<string>(initialCancelReason || "");
    const [personCancel, setPersonCancel] = useState<string>(initialPersonCancel || DEFAULT_PERSON_CANCEL);
    // const [cancelDate, setCancelDate] = useState<string>(...);


    const availableStatuses = getAvailableStatuses(currentStatus);
    const isCancelledStatus = status === "CANCELLED";

    const executeSave = async () => {
        setIsConfirmingSave(false);
        setLoading(true);
        try {
            let updateData: any = {
                status,
                payment_status: paymentStatus,
                payment_method: paymentMethod,
            };
            
            if (isCancelledStatus) {
                // Kiểm tra xem lý do có được điền không
                if (!cancelReason.trim()) {
                    alert("Vui lòng điền Lý do hủy.");
                    setLoading(false);
                    return;
                }

                updateData = {
                    ...updateData,
                    cancel_reason: cancelReason.trim() || null, 
                    // ĐÃ LOẠI BỎ cancel_date
                    // cancel_date: cancelDate,
                    person_cancel: personCancel.trim() || null,
                    actorType: 'ADMIN', // Thêm actorType cho việc hủy từ phía Admin
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
        // Thêm kiểm tra validation trước khi xác nhận lưu
        if (isCancelledStatus && !cancelReason.trim()) {
            alert("Vui lòng điền Lý do hủy.");
            return;
        }
        setIsConfirmingSave(true);
    };

    const handleCancelSave = () => {
        setIsConfirmingSave(false);
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

        // Kiểm tra 2 trường khi đang ở trạng thái CANCELLED
        (isCancelledStatus && (
            cancelReason !== initialCancelReasonValue ||
            personCancel !== initialPersonCancelValue 
            // Đã loại bỏ kiểm tra cancelDate
        )) ||

        // Nếu chuyển từ CANCELLED sang trạng thái khác (cần lưu updateData reset fields thành null)
        (!isCancelledStatus && currentStatus === "CANCELLED")
    );

    return (
        <>
            {/* Overlay và Modal chính */}
            <div className="fixed inset-0 bg-black/30 z-[1100] flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                    <button
                        title="close"
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-semibold mb-5 text-gray-900">Cập nhật Trạng thái Đơn hàng</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng</label>
                            <select
                                title="change order status"
                                value={status}
                                onChange={(e) => {
                                    const newStatus = e.target.value as OrderStatus;
                                    setStatus(newStatus);

                                    if (newStatus !== "CANCELLED") {
                                        // Reset hoàn toàn khi KHÔNG phải là CANCELLED
                                        setCancelReason(initialCancelReason || "");
                                        setPersonCancel(initialPersonCancel || DEFAULT_PERSON_CANCEL);
                                        // Đã loại bỏ setCancelDate
                                        return;
                                    }

                                    // Nếu chuyển từ trạng thái khác sang CANCELLED → đặt Person Cancel mặc định
                                    if (currentStatus !== "CANCELLED") {
                                        setPersonCancel(DEFAULT_PERSON_CANCEL);
                                    }
                                    // Nếu đang CANCELLED và vẫn giữ CANCELLED → giữ nguyên dữ liệu cũ
                                }}

                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {/* HIỂN THỊ CÁC TRẠNG THÁI ĐÃ LỌC */}
                                {availableStatuses.map((s) => (
                                    <option key={s} value={s}>
                                        {translateOrderStatus(s)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* FORM ĐIỀN THÔNG TIN HỦY */}
                        {isCancelledStatus && (
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Người hủy đơn hàng</label>
                                    <input
                                        type="text"
                                        title="person cancelled"
                                        value={personCancel}
                                        onChange={(e) => setPersonCancel(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                {/* ĐÃ LOẠI BỎ INPUT NGÀY GIỜ HỦY */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giờ hủy đơn hàng</label>
                                    <input
                                        type="datetime-local"
                                        title="cancellation date"
                                        value={cancelDate}
                                        onChange={(e) => setCancelDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div> */}
                            </div>
                        )}

                        {/* Các trường Payment Status & Payment Method (Giữ nguyên) */}
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

            {/* Modal Xác nhận Lưu */}
            {isConfirmingSave && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/20 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative border-t-4 border-orange-500">
                        <h3 className="text-xl font-bold text-orange-700 mb-3 flex items-center">
                            <Save className="w-5 h-5 mr-2" /> Xác Nhận Lưu Thay Đổi
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng #{orderId} từ <span className="font-semibold text-indigo-600">{translateOrderStatus(currentStatus)}</span> thành <span className="font-semibold text-green-600">{translateOrderStatus(status)}</span> không?
                            {isCancelledStatus && (
                                <span className="block mt-2 text-sm text-red-500 font-medium">Lưu ý: Đơn hàng sẽ bị hủy với lý do: {cancelReason}.</span>
                            )}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelSave}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={executeSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Đồng ý Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}