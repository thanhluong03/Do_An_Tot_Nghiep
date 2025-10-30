'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../layouts';
// Giả sử các imports này đã được định nghĩa đúng trong '@/api/services/orderService'
import { getOrderDetail, Order, OrderItem } from '@/api/services/orderService';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, MapPin, Package, CreditCard } from 'lucide-react';

// Hàm định dạng tiền tệ đơn giản
const formatPrice = (amount: string | number) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('vi-VN') + '₫';
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch order detail ---
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;

        const data = await getOrderDetail(Number(orderId));
        // console.log('Order detail:', data);

        // Chuẩn hóa và gán items
        const items: OrderItem[] = data.items || data.current_order?.items || [];

        // Chuẩn hóa tên khách hàng
        const customerName = data.customer_name || data.customer_full_name || 'Khách vãng lai';

        setOrder({ ...data, items, customer_full_name: customerName });
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- Helper để lấy ảnh chính ---
  const getMainImage = (images: any) => {
    if (!images) return null;
    try {
      // Đảm bảo xử lý cả trường hợp API trả về string JSON hoặc array object
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      // Ưu tiên ảnh chính, nếu không có thì lấy ảnh đầu tiên
      const main = parsed.find((img: any) => img.is_main_image) || parsed[0];
      return main && main.image_data ? `data:image/jpeg;base64,${main.image_data}` : null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Clock className="w-6 h-6 animate-spin mr-2 text-[#A38D64]" />
          <span className="text-[#A38D64]">Đang tải chi tiết đơn hàng...</span>
        </div>
      </BaseLayout>
    );
  }

  if (!order) {
    return (
      <BaseLayout>
        <div className="max-w-xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lỗi xác nhận đơn hàng</h1>
          <p className="text-gray-600 mb-6">Không tìm thấy đơn hàng hoặc mã đơn hàng không hợp lệ.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#A38D64] text-white px-6 py-2 rounded-md hover:bg-[#8D7A58] transition"
          >
            Trở về Trang chủ
          </button>
        </div>
      </BaseLayout>
    );
  }

  // --- Định dạng các trường dữ liệu ---
  const shippingAddress = order.shipping_address || order.current_order?.shipping_address || '—';
  const customerName = order.customer_full_name || order.customer_name || 'Khách vãng lai';
  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '—';
  const paymentMethodText =
    order.payment_method === 'ONSITE'
      ? 'COD (Thanh toán khi nhận hàng)'
      : order.payment_method === 'CARD'
        ? 'Thẻ Tín dụng/Ghi nợ'
        : 'Chuyển khoản Ngân hàng';
  const paymentStatusText =
    order.payment_status === 'PAID'
      ? 'Đã thanh toán'
      : order.payment_status === 'UNPAID'
        ? 'Chưa thanh toán'
        : 'Đang xử lý';
  const paymentStatusColor = order.payment_status === 'PAID' ? 'text-green-600' : 'text-red-600';
  const totalAmount = Number(order.total_amount) || 0;
  const originalAmount = Number(order.current_order?.original_amount) || totalAmount;
  const discountAmount = Number(order.current_order?.discount_amount) || 0;
  const shippingFee = 30000; // ✅ Phí vận chuyển cố định, không lưu trong DB


  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-[#EBE8E0]">

          {/* --- Header (Sang trọng hơn) --- */}
          <div className="text-center p-5 bg-[#EFE9DC] border-b border-[#D4C3A3]">
            <CheckCircle className="w-10 h-10 mx-auto text-[#3D6647] mb-4" />
            <h1 className="text-3xl font-serif font-extrabold text-[#2C2A24] mb-2">
              Xác nhận Đơn hàng
            </h1>
            <p className="text-lg text-[#5A5547]">
              Cảm ơn bạn, đơn hàng của bạn đã được đặt thành công!
            </p>

          </div>

          <div className="p-10 lg:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* --- Cột 1: Thông tin giao hàng --- */}
            <div className="lg:col-span-1 p-6 border border-[#EBE8E0] rounded-xl bg-[#FFFCF7]">
              <h2 className="text-lg font-semibold mb-4 text-[#A38D64] flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Thông tin Giao hàng
              </h2>
              <div className="space-y-3 text-sm text-[#2C2A24]">
                <p>
                  <strong className="text-[#7C7768]">Ngày đặt:</strong> <br />
                  <span className="font-medium">{orderDate}</span>
                </p>
                <p>
                  <strong className="text-[#7C7768]">Địa chỉ:</strong> <br />
                  <span className="font-medium">{shippingAddress}</span>
                </p>
                <p className='mt-4'>
                  <strong className="text-[#7C7768]">Trạng thái Đơn hàng:</strong> <br />
                  <span className={`font-bold ${order.status === 'CREATED' ? 'text-blue-500' : 'text-yellow-600'}`}>{order.status}</span>
                </p>
              </div>
            </div>

            {/* --- Cột 2: Tổng quan Thanh toán (Lớn hơn) --- */}
            <div className="lg:col-span-2 p-6 border border-[#EBE8E0] rounded-xl bg-[#F9F7F3]">
              <h2 className="text-lg font-semibold mb-4 text-[#A38D64] flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Tóm tắt Thanh toán
              </h2>
              <div className="space-y-3 text-base text-[#5A5547]">
                <div className="flex justify-between">
                  <span>Tổng tiền sản phẩm</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-300 pt-4">
                  <span className="text-xl font-bold text-[#2C2A24]">TỔNG THANH TOÁN</span>
                  <span className="text-2xl font-extrabold text-[#A38D64]">
                    {formatPrice(totalAmount + shippingFee)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-gray-300 space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="font-medium text-[#7C7768]">Phương thức:</span>
                  <span className="font-semibold text-[#2C2A24]">{paymentMethodText}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-[#7C7768]">Trạng thái thanh toán:</span>
                  <span className={`font-extrabold ${paymentStatusColor}`}>{paymentStatusText}</span>
                </p>
              </div>
            </div>

            {/* --- Cột 3: Sản phẩm (Mở rộng toàn bộ hàng dưới) --- */}
            <div className="lg:col-span-3 p-6 border border-[#EBE8E0] rounded-xl bg-[#FFF]">
              <h2 className="text-xl font-semibold mb-4 text-[#A38D64] flex items-center gap-2">
                <Package className="w-5 h-5" /> Sản phẩm đã đặt ({order.items?.length || 0})
              </h2>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2">
                {order.items?.length ? (
                  order.items.map((item, i) => {
                    const imgSrc = getMainImage(item.product_images);
                    return (
                      <div
                        key={i}
                        className="flex items-start py-4 gap-4"
                      >
                        <div className="w-16 h-16 flex-shrink-0 relative">
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={item.product_name || 'Sản phẩm'}
                              fill
                              sizes='(max-width: 768px) 100vw, 33vw'
                              className="rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 border rounded-lg flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#2C2A24] truncate">{item.product_name || 'Sản phẩm không rõ'}</p>
                          <p className="text-xs text-[#7C7768] mt-1">
                            Cửa hàng: {item.store_name || '—'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-[#A38D64] font-semibold">
                            {formatPrice(Number(item.price_at_order || 0) * (item.quantity || 1))}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            SL: {item.quantity || 1}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic text-center py-6">Không có sản phẩm nào trong đơn hàng này.</p>
                )}
              </div>
            </div>

          </div>

          {/* --- Footer Buttons --- */}
          <div className="text-center p-10 border-t border-[#EBE8E0] bg-[#FFFCF7]">
            <button
              onClick={() => router.push('/')}
              className="bg-[#A38D64] text-white px-10 py-3 rounded-md font-bold text-lg hover:bg-[#8D7A58] transition shadow-lg"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}