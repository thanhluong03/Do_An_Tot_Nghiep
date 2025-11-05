"use client";
import React, { useState } from "react";
import { updateOrder, OrderStatus, PaymentStatus, PaymentMethod } from "@/api/services/orderService";
import { X, CheckCircle } from "lucide-react";

interface Props {
  orderId: number;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  currentPaymentMethod: PaymentMethod;
  onClose: () => void;
  onUpdated: (id: number, data: any) => void;

}

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

  const handleSave = async () => {
  setLoading(true);
  try {
    const updateData = {
      status,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    };

    await onUpdated(orderId, updateData); // ✅ gọi hàm của cha
    onClose();
  } catch (err) {
    alert("Cập nhật thất bại, vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};


  return (
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
              title="change"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="CREATED">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              {/* <option value="SHIPPING">SHIPPING - Đang giao</option>
              <option value="DELIVERED">DELIVERED - Đã giao</option> */}
              <option value="REJECTED">Từ chối</option>
              {/* <option value="CANCELLED">CANCELED - Đã hủy</option> */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
            <select
              title="change"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="UNPAID">Chưa thanh toán</option>
              {/* <option value="PENDING">PENDING - Đang xử lý</option> */}
              <option value="PAID">Đã thanh toán</option>
              <option value="REFUNDED">Hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
            <select
              title="change"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CARD">Thẻ ngân hàng</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
