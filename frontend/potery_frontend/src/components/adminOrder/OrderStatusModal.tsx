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
    const [isConfirmingSave, setIsConfirmingSave] = useState(false);

    // KHỞI TẠO CÁC STATE CHO THÔNG TIN HỦY (Đã loại bỏ cancelDate state)
    const [cancelReason, setCancelReason] = useState<string>(initialCancelReason || "");
    const [personCancel, setPersonCancel] = useState<string>(initialPersonCancel || DEFAULT_PERSON_CANCEL);
    // const [cancelDate, setCancelDate] = useState<string>(...);


    const availableStatuses = getAvailableStatuses(currentStatus);
    const isCancelledStatus = status === "CANCELLED" || status === "CANCELLED_RETURN";

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
                                                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-full cursor-default shadow-md"
                                                title={`Trạng thái hiện tại: ${translateOrderStatus(s)}`}
                                            >
                                                <CheckCircle className="inline w-4 h-4 mr-1" />
                                                {translateOrderStatus(s)} (Hiện tại)
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


                        {/* FORM ĐIỀN THÔNG TIN HỦY (Giữ nguyên) */}
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
                            </div>
                        )}

                        {/* Các trường Payment Status & Payment Method (Bạn có thể thêm vào đây) */}
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

            {/* Modal Xác nhận Lưu (Giữ nguyên) */}
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