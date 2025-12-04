import React, { useState } from "react";
import { Order } from "@/api/services/orderService";
import { X, CreditCard, ShoppingBag, Truck, RotateCcw, XCircle } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useRef } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}
const statusToVietnamese = (status: string) => {
  switch (status) {
    case "CREATED":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Xác nhận đơn hàng";
    case "SHIPPING":
      return "Đang giao";
    case "DELIVERED":
      return "Đã giao thành công";
    case "EXCHANGED":
      return "Đã đổi trả";
    case "RETURN_REQUESTED":
      return "Đang yêu cầu đổi trả";
    case "CANCELLED":
      return "Hủy đơn hàng";
    case "CONFIRMED_RETURN":
      return "Xác nhận đổi trả";
    case "PENDING_DELIVERY":
      return "Chờ giao hàng";
    case "DELIVERY_FAILED":
      return "Giao hàng thất bại";
    case "PACKING":
      return "Đang đóng gói";
    case "SHIPPING_RETURN":
      return "Đang vận chuyển đổi trả";
    case "PENDING_DELIVERY_RETURN":
      return "Chờ giao hàng đổi trả";
    case "DELIVERY_FAILED_RETURN":
      return "Giao hàng đổi trả thất bại";
    case "CANCELLED_RETURN":
      return "Đã hủy đổi trả";
    case "PACKING_RETURN":
      return "Đang đóng gói đổi trả";
    default:
      return status;
  }
};


const getStatusColor = (status: string) => { 
  switch (status?.toLowerCase()) {
    // --- NORMAL ORDER FLOW ---

    case "created": // Chờ xác nhận
      return "bg-orange-100 text-orange-700"; // Đã sửa để khớp với cái đầu

    case "confirmed": // Xác nhận đơn hàng
      return "bg-indigo-100 text-indigo-700";

    case "packing": // Đang đóng gói
      return "bg-cyan-100 text-cyan-700"; // Đã sửa để khớp với cái đầu

    case "pending_delivery": // Chờ giao hàng
      return "bg-blue-100 text-blue-700"; // Đã sửa để khớp với cái đầu

    case "shipping": // Đang giao
      return "bg-yellow-100 text-yellow-700";

    case "delivered": // Đã giao thành công
      return "bg-green-100 text-green-700";

    case "delivery_failed": // Giao hàng thất bại
      return "bg-red-200 text-red-800"; // Đã sửa để khớp với cái đầu

    case "cancelled": // Hủy đơn hàng
      return "bg-red-100 text-red-700"; // Đã sửa để khớp với cái đầu

    // --- RETURN FLOW ---

    case "return_requested": // Đang yêu cầu hoàn trả
      return "bg-pink-100 text-pink-700";

    case "confirmed_return": // Xác nhận hoàn trả
      return "bg-lime-100 text-lime-700"; // Đã sửa để khớp với cái đầu

    case "packing_return": // Đang đóng gói hoàn trả
      return "bg-cyan-200 text-cyan-800"; // Đã sửa để khớp với cái đầu

    case "pending_delivery_return": // Chờ giao hàng hoàn trả
      return "bg-teal-100 text-teal-700"; // Đã sửa để khớp với cái đầu

    case "shipping_return": // Đang vận chuyển hoàn trả
      return "bg-amber-100 text-amber-700"; // Đã sửa để khớp với cái đầu

    case "delivery_failed_return": // Giao hàng hoàn trả thất bại
      return "bg-red-200 text-red-800"; 

    case "cancelled_return": // Đã hủy hoàn trả
      return "bg-red-100 text-red-700"; // Đã sửa để khớp với cái đầu

    case "exchanged": // Đã đổi trả
      return "bg-purple-100 text-purple-700"; 

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-200">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
  </div>
);
const bufferToDataURL = (bufferData: { data: number[] } | undefined, mimeType: string = 'image/jpeg'): string | undefined => {
  if (!bufferData || !bufferData.data) return undefined;
  try {
    const bytes = new Uint8Array(bufferData.data);
    let binary = '';
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  } catch (e) {
    console.error("Error converting buffer to base64:", e);
    return undefined;
  }
};
// Hàm chuyển đổi định dạng ngày tháng/ngày giờ
const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        // Kiểm tra xem date có hợp lệ không
        if (isNaN(date.getTime())) return "Ngày không hợp lệ";

        // Định dạng đầy đủ (Ví dụ: 18:30:00 04/12/2025)
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return dateString; // Trả về chuỗi gốc nếu có lỗi
    }
};

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  // State cho modal xem ảnh
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(0);
  // Swiper ref cho điều hướng
  const swiperRef = useRef<any>(null);

  const handleOpenImage = (images: string[], idx: number) => {
    setModalImages(images);
    setModalIndex(idx);
  };

  const handleCloseModal = () => {
    setModalImages([]);
    setModalIndex(0);
  };

  if (!order) return null;
  const paymentMethod = String(order.payment_method);
  const displayTotalAmount =
    typeof order.total_amount === "string" ? parseFloat(order.total_amount) : order.total_amount;

  // Lấy thông tin giao dịch chính
  const paymentTransactions = (order as any)?.paymentTransactions || [];
  const mainTxn = paymentTransactions.length > 0 ? paymentTransactions[0] : null;

  // Tính phí vận chuyển từ transaction data
  const shippingFeeFromTransaction = mainTxn && mainTxn.amount ?
    Math.max(0, Number(mainTxn.amount) - displayTotalAmount) : 30000;
  const displayShippingFee = shippingFeeFromTransaction > 0 ? shippingFeeFromTransaction : 30000;

  // Debug: Log payment transaction data  
  console.log('Admin Order Payment Transactions:', paymentTransactions);
  console.log('Admin Order Main Transaction:', mainTxn);
  console.log('Admin Order Shipping Fee:', displayShippingFee);
  console.log('Admin Order Full Data:', order);

// Kiểm tra trạng thái hủy đơn
  const isCancelled = order.status === 'CANCELLED';
  return (
    <div className="fixed inset-0  bg-black/20 z-[1000] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-fadeIn">
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
                    className={`font-bold text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                  >
                    {statusToVietnamese(order.status)}
                  </span>
                }
              />
              {/* Hiển thị ghi chú bên dưới Trạng thái đơn */}
              {order.note && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-600 block mb-1">Ghi chú:</span>
                  <p className="text-sm text-gray-900 bg-yellow-50 rounded px-2 py-1">{order.note}</p>
                </div>
              )}
            </section>
           
              
            {/* Thông tin hoàn trả */}
            {order.returnReason && (
              <section className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
                <h3 className="flex items-center text-lg font-semibold text-red-800 mb-4 border-b border-red-200 pb-2">
                  <RotateCcw className="w-5 h-5 mr-2 text-red-600" />
                  Thông tin hoàn trả
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">
                      Lý do:
                    </span>
                    <p className="text-sm font-text rounded bg-white">
                      {order.returnReason}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">
                      Thời gian yêu cầu hoàn trả:
                    </span>
                    <p className="text-sm font-text rounded bg-white">
                      {order.reason_change_date ? formatDate(order.reason_change_date) : "N/A"}
                    </p>
                  </div>
                  {order.returnReasonImage && order.returnReasonImage.length > 0 && (
                    <div>
                      <div className="border-t border-gray-200 mb-2"></div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">
                        Ảnh minh chứng:
                      </span>
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2">
                          {order.returnReasonImage.map((imgObj, idx) => {
                            if (!imgObj.image) return null;

                            const imageUrl = `data:image/jpeg;base64,${imgObj.image}`;
                            const allImages = (order.returnReasonImage || [])
                              .filter(img => img.image)
                              .map(img => `data:image/jpeg;base64,${img.image}`);

                            return (
                              <button
                                key={imgObj.id || idx}
                                type="button"
                                className="focus:outline-none"
                                onClick={() => handleOpenImage(allImages, allImages.indexOf(imageUrl))}
                              >
                                <Image
                                  src={imageUrl}
                                  alt={`Return ${idx + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded border border-gray-300 hover:ring-2 hover:ring-orange-400 transition-all"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Thanh toán */}
          <div className="md:col-span-1 space-y-6">
            <section className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-md">
              <h3 className="flex items-center text-lg font-bold text-orange-600 mb-4 border-b border-indigo-300 pb-2">
                <CreditCard className="w-5 h-5 mr-2" />
                Tóm tắt Thanh toán
              </h3>

              {/* Mã giao dịch */}
              {mainTxn && mainTxn.gateway_txn_ref && (
                <InfoRow
                  label="Mã giao dịch"
                  value={<span className="font-semibold text-gray-900">{mainTxn.gateway_txn_ref}</span>}
                />
              )}

              <InfoRow
                label="Phương thức"
                value={
                  paymentMethod === "ONSITE"
                    ? "Thanh toán khi nhận hàng"
                    : paymentMethod === "CARD"
                      ? "Thanh toán MoMo"
                      : paymentMethod === "BANK_TRANSFER"
                        ? "Chuyển khoản"
                        : "Không xác định"
                }
              />

              {/* Thời gian thanh toán */}
              {mainTxn && mainTxn.created_at && (
                <InfoRow
                  label="Thời gian thanh toán"
                  value={<span className="font-semibold text-gray-900">
                    {new Date(mainTxn.created_at).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>}
                />
              )}

              <InfoRow label="Tổng tiền sản phẩm" value={formatCurrency(displayTotalAmount)} />
              <InfoRow
                label="Phí vận chuyển"
                value={<span className="text-green-600">{formatCurrency(displayShippingFee)}</span>}
              />
              <div className="pt-4 mt-4 border-t-2 border-indigo-300">
                <InfoRow
                  label="Tổng thanh toán"
                  value={<span className="text-xl font-bold text-indigo-900">{formatCurrency(displayTotalAmount + displayShippingFee)}</span>}
                />

                {/* Tiền giao dịch */}
                {mainTxn && mainTxn.amount && (
                  <InfoRow
                    label="Tiền giao dịch"
                    value={<span className="text-lg font-bold text-green-600">{Number(mainTxn.amount).toLocaleString('vi-VN')} đ</span>}
                  />
                )}

                <InfoRow
                  label="Trạng thái thanh toán"
                  value={
                    <span
                      className={`font-bold text-xs px-2 py-1 rounded-full ${order.payment_status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {order.payment_status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  }
                />
                {mainTxn && mainTxn.txn_status && (
                  <InfoRow
                    label="Trạng thái giao dịch"
                    value={
                      <span className={`font-semibold text-gray-900 ${mainTxn.txn_status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'}`}>
                        {mainTxn.txn_status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                      </span>
                    }
                  />
                )}
              </div>
            </section>
             {/* THÔNG TIN HỦY ĐƠN HÀNG */}
            {isCancelled && order.cancel_reason && (
              <section className="bg-red-50 rounded-xl p-5 border border-red-300 shadow-sm">
                <h3 className="flex items-center text-lg font-semibold text-red-800 mb-4 border-b border-red-200 pb-2">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Thông tin từ chối đơn hàng
                </h3>

                <div className="space-y-3">
                  <div className="py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600 block mb-1">
                      Lý do từ chối:
                    </span>
                    <p className="text-sm font-semibold text-red-700 bg-red-100 p-2 rounded">
                      {order.cancel_reason}
                    </p>
                  </div>

                  {order.cancel_reason_image && order.cancel_reason_image.length > 0 && (
                    <div>
                      <div className="border-t border-gray-200 mb-2"></div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">
                        Ảnh lý do hủy:
                      </span>
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2">
                          {order.cancel_reason_image.map((imgObj, idx) => {
                            if (!imgObj.image) return null;

                            const imageUrl = `data:image/jpeg;base64,${imgObj.image}`;
                            const allImages = (order.cancel_reason_image || [])
                              .filter(img => img.image)
                              .map(img => `data:image/jpeg;base64,${img.image}`);

                            return (
                              <button
                                title="oepn"
                                key={imgObj.id || idx}
                                type="button"
                                className="focus:outline-none"
                                onClick={() => handleOpenImage(allImages, allImages.indexOf(imageUrl))}
                              >
                                <Image
                                  src={imageUrl}
                                  alt={`Return ${idx + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded border border-gray-300 hover:ring-2 hover:ring-orange-400 transition-all"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
              Sản phẩm đã đặt ({order.items?.length ?? 0})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {order.items?.map((item, index) => {
                const mainImage = item.product_images?.find((img: any) => img.is_main_image);

                return (
                  <div
                    key={index}
                    className="flex items-center p-1 rounded-lg border-gray-200 border bg-white shadow-sm hover:border-indigo-400 transition"
                  >
                    <div className="w-16 h-16 flex-shrink-0 mr-3">
                      {mainImage?.image_data ? (
                        <img
                          src={`data:image/jpeg;base64,${mainImage.image_data}`}
                          alt={item.product_name || "Sản phẩm"}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs rounded-md">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.product_name || `Sản phẩm ID: ${item.product_id}`}
                      </p>
                      {(item.attribute1_name || item.attribute2_name) && (
                        <p className="text-xs text-gray-500">
                          {`${item.attribute1_name}    `}
                          {item.attribute2_name}
                        </p>
                      )}

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
                );
              })}

            </div>
          </div>
        </div>

        {/* Modal xem ảnh hoàn trả */}
        {modalImages.length > 0 && (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            style={{ cursor: 'default', background: 'rgba(30,30,30,0.45)' }}
          >
            <button
              className="absolute top-6 right-6 z-[2010] focus:outline-none group"
              onClick={handleCloseModal}
              type="button"
              aria-label="Đóng"
            >
              <svg width={40} height={40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 14L26 26M26 14L14 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-500 transition-colors duration-150" />
              </svg>
            </button>
            <div className="relative w-[90vw] max-w-[700px] p-0">
              <Swiper
                initialSlide={modalIndex}
                spaceBetween={16}
                slidesPerView={1}
                style={{ width: '100%', height: '100%' }}
                grabCursor={true}
                speed={600}
                effect="slide"
                centeredSlides={false}
                loop={modalImages.length > 1}
                modules={[Navigation]}
                onSwiper={swiper => { swiperRef.current = swiper; }}
              >
                {modalImages.map((img, idx) => (
                  <SwiperSlide key={idx} style={{ padding: 0, margin: 0 }}>
                    <div style={{ width: '100%', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image
                        src={img}
                        alt={`Ảnh hoàn trả lớn ${idx + 1}`}
                        fill
                        sizes="100vw"
                        className="object-cover rounded-xl shadow-lg"
                        style={{ margin: 0, width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '80vh', background: 'none' }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Nút điều hướng ngoài Swiper, style giống mẫu */}
              <button
                className="absolute left-[-60px] top-1/2 z-[2020] -translate-y-1/2 flex items-center justify-center"
                style={{ width: 56, height: 56, background: 'transparent', boxShadow: 'none', border: 'none' }}
                aria-label="Trước"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M25 32L13 20L25 8" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="absolute right-[-60px] top-1/2 z-[2020] -translate-y-1/2 flex items-center justify-center"
                style={{ width: 56, height: 56, background: 'transparent', boxShadow: 'none', border: 'none' }}
                aria-label="Sau"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M15 8L27 20L15 32" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
