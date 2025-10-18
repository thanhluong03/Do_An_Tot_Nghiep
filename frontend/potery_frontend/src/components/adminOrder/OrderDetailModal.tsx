import React from "react";
import { Order } from "@/api/services/orderService";
import { X, CreditCard, ShoppingBag, Truck } from "lucide-react";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-200">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
  </div>
);

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const displayTotalAmount =
    typeof order.total_amount === "string" ? parseFloat(order.total_amount) : order.total_amount;

  return (
<div className="fixed inset-0  bg-black/20 z-[1000] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-fadeIn">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Chi tiết Đơn hàng{" "}
            <span className="font-bold text-orange-600">#{order.id}</span>
          </h2>
          <button
            title="close"
            onClick={onClose}
            className="p-3 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-10">
          {/* Giao hàng */}
          <div className="md:col-span-1 space-y-6">
            <section className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <Truck className="w-5 h-5 mr-2 text-orange-600" />
                Giao hàng & Địa chỉ
              </h3>
              <InfoRow
                label="Ngày đặt hàng"
                value={new Date(order.order_date).toLocaleString("vi-VN")}
              />
              <div className="py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600 block mb-1">
                  Địa chỉ giao hàng:
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {order.shipping_address || "Chưa cung cấp"}
                </p>
              </div>
              {order.customer_name && (
                <InfoRow label="Tên khách hàng" value={order.customer_name} />
              )}
              <InfoRow
                label="Trạng thái đơn"
                value={
                  <span
                    className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "CANCELED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                }
              />
            </section>
          </div>

          {/* Thanh toán */}
          <div className="md:col-span-1 space-y-6">
            <section className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200 shadow-md">
              <h3 className="flex items-center text-lg font-bold text-orange-600 mb-4 border-b border-indigo-300 pb-2">
                <CreditCard className="w-5 h-5 mr-2" />
                Tóm tắt Thanh toán
              </h3>
              <InfoRow label="Tổng tiền sản phẩm" value={formatCurrency(displayTotalAmount)} />
              <InfoRow label="Phí vận chuyển" value={<span className="text-green-600 font-semibold">Miễn phí</span>} />
              <div className="pt-4 mt-4 border-t-2 border-indigo-300">
                <InfoRow
                  label="Tổng thanh toán"
                  value={<span className="text-xl font-bold text-indigo-900">{formatCurrency(displayTotalAmount)}</span>}
                />
                <InfoRow label="Phương thức" value={order.payment_method.replace("_", " ")} />
                <InfoRow
                  label="Trạng thái TT"
                  value={
                    <span
                      className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${
                        order.payment_status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  }
                />
              </div>
            </section>
          </div>

          {/* Sản phẩm */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
              Sản phẩm đã đặt ({order.items?.length ?? 0})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg border bg-white shadow-sm hover:border-indigo-400 transition"
                >
                  <div className="flex-1">
                    
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.product_name || `Sản phẩm ID: ${item.product_id}`}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      @{item.store_name || `Cửa hàng ${item.store_id}`}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-sm text-gray-700">x{item.quantity}</p>
                    <p className="text-xs text-indigo-600">
                      {formatCurrency(item.price_at_order * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-5 border-t border-gray-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
