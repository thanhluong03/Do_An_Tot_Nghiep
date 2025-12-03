"use client";
import React, { useState } from "react";
import { updateOrder, OrderStatus, PaymentStatus, PaymentMethod } from "@/api/services/orderService";
import { X, CheckCircle, Save } from "lucide-react";

interface Props {
  orderId: number;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  currentPaymentMethod: PaymentMethod;
  onClose: () => void;
  onUpdated: (id: number, data: any) => void;
}
const translateOrderStatus = (status: OrderStatus): string => {
  const translations: Record<OrderStatus, string> = {
    CREATED: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao thành công",
    REJECTED: "Bị từ chối",
    EXCHANGED: "Đã đổi trả",
    RETURN_REQUESTED: "Đang yêu cầu hoàn trả",
    CANCELLED: "Đã hủy",
  };

  return translations[status] || status;
};
export default function OrderStatusModal({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentPaymentMethod,
  onClose,
  onUpdated,
}: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(currentPaymentMethod);
  const [loading, setLoading] = useState(false);
  
  // State mới cho modal xác nhận
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);

  // 1. Hàm lưu chính thức (chỉ chạy sau khi xác nhận)
  const executeSave = async () => {
    setIsConfirmingSave(false);
    setLoading(true);
    try {
      const updateData = {
        status,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      };

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

  // 2. Hàm xử lý khi nhấn nút Lưu (chỉ mở modal xác nhận)
  const handleSaveClick = () => {
    setIsConfirmingSave(true);
  };
  
  // 3. Hàm hủy xác nhận
  const handleCancelSave = () => {
    setIsConfirmingSave(false);
  };
  
  // Kiểm tra xem có thay đổi nào được thực hiện không
  const hasChanges = status !== currentStatus || paymentStatus !== currentPaymentStatus || paymentMethod !== currentPaymentMethod;


  return (
    <>
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
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {currentStatus !== "CONFIRMED" && <option value="CREATED">Chờ xác nhận</option>}
                <option value="CONFIRMED">Đã xác nhận</option>
                {/* <option value="SHIPPING">Đang giao</option>
                <option value="DELIVERED">Đã giao</option> */}
                <option value="EXCHANGED">Đã đổi trả</option>
                <option value="CANCELLED">Hủy</option>
              </select>
            </div>

            {/* Các trường đã bị comment (Payment Status & Payment Method) - Giữ nguyên trạng thái comment */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
              <select
                title="change payment status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="REFUNDED">Hoàn tiền</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <select
                title="change payment method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ ngân hàng</option>
              </select>
            </div> */}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveClick} // Gọi hàm mở modal xác nhận
              disabled={loading || !hasChanges} // Vô hiệu hóa khi đang loading hoặc không có thay đổi
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