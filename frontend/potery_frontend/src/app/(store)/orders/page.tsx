'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { orderApi } from '../../../api/modules/orders';
import Image from 'next/image';
import Link from 'next/link';
import { productApi } from '../../../api/modules/products';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
const translateStatus = (status: string | undefined): string => {
  if (!status) return 'Không rõ';
  const s = status.toUpperCase();
  switch (s) {
    case 'CREATED':
    case 'PENDING':
      return 'Đang chờ xử lý';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PROCESSING':
      return 'Đang đóng gói';
    case 'SHIPPED':
      return 'Đang vận chuyển';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Đã giao thành công';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'FAILED':
      return 'Thất bại';
    default:
      return status;
  }
};

const translatePaymentStatus = (status: string | undefined): string => {
  if (!status) return 'Chờ thanh toán';
  const s = status.toUpperCase();
  switch (s) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'UNPAID':
      return 'Chưa thanh toán';
    case 'FAILED':
      return 'Thanh toán thất bại';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'CREATED':
    case 'PENDING':
    case 'CONFIRMED':
      return 'text-[#856D4D] bg-[#FFF8E1] border-[#F2E5C9]'; 
    case 'PROCESSING':
    case 'SHIPPED':
      return 'text-[#4A856D] bg-[#E8F5E9] border-[#DCEADF]';
    case 'COMPLETED':
    case 'DELIVERED':
      return 'text-green-700 bg-green-100 border-green-200';
    case 'CANCELLED':
    case 'FAILED':
      return 'text-red-700 bg-red-100 border-red-200';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200';
  }
};
const translatePaymentMethod = (method: string | undefined): string => {
  if (!method) return '—';
  const m = method.toUpperCase();
  switch (m) {
    case 'COD':
    case 'ONSITE':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'VNPAY':
    case 'CARD':
      return 'Thẻ/VNPay';
    default:
      return method;
  }
};
export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<number, any>>({});
  const { clear: clearCart } = useCart();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order_id');

    if (paymentStatus === 'success' && orderId) {
      (async () => {
        try {
          await orderApi.updateOrder(Number(orderId), {
            status: 'CONFIRMED',
            payment_status: 'PAID',
          });
          clearCart();
          toast.success('🎉 Thanh toán thành công!');
          window.history.replaceState({}, '', '/orders');
        } catch (err) {
          console.error('❌ Lỗi cập nhật đơn:', err);
          toast.error('Không thể cập nhật trạng thái đơn hàng.');
        }
      })();
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại, vui lòng thử lại!');
      window.history.replaceState({}, '', '/orders');
    }
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = orders.flatMap(o => o.items?.map((i: any) => i.product_id)).filter(Boolean);
      const uniqueIds = [...new Set(productIds)];
      const result: Record<number, any> = {};

      await Promise.all(uniqueIds.map(async id => {
        try {
          const data = await productApi.getProductById(String(id));
          result[id] = data;
        } catch { }
      }));
      setProductMap(result);
    };

    if (orders.length > 0) fetchProducts();
  }, [orders]);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.getOrdersByCustomer(user.id as string, 1, 50);
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.data || [];
        const seen = new Set();
        const unique = list.filter((o: any) => {
          const id = o?.id ?? o?._id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setOrders(unique);
      } catch (e: any) {
        setError(e?.message || 'Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.id]);

  const formatPrice = (price: number | string) => {
    const num = Number(price) || 0;
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <BaseLayout>
      {/* 1. Thu hẹp max-w container và sử dụng màu nền ấm */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F5F1EB] min-h-[80vh]">

        {/* Tiêu đề: Tinh tế, font serif */}
        <h1 className="text-3xl font-serif mb-8 text-[#2C2A24] text-center tracking-wider relative pb-2 border-b border-[#C4975A]/30">
          Lịch sử Đơn hàng
        </h1>

        {loading && <div className="text-center py-10 text-[#65604E] text-sm">Đang tải đơn hàng...</div>}
        {error && <div className="text-center text-red-600 py-10 text-sm border border-red-300 bg-red-50 rounded-lg mx-auto max-w-lg">{error}</div>}

        {!loading && !error && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-md border border-[#E5E2D8]">
              <p className="text-base mb-4">Bạn chưa có đơn hàng nào.</p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 text-sm bg-[#C4975A] text-white font-medium rounded-full shadow-md hover:bg-[#a97e4a] transition-all"
              >
                Khám phá Sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const id = order.id ?? order._id;
                const info = order.current_order || order;
                const items = info.items || [];
                const total = info.total_amount ?? info.total ?? order.total_amount ?? 0;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl border border-[#E5E2D8] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >

                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#E5E2D8] px-5 py-3 bg-[#F9F8F4]">
                      <div>
                        <div className="font-semibold text-base text-[#2C2A24]">
                          Mã đơn hàng: <span className="font-bold text-[#C4975A]">#{id}</span>
                        </div>
                        <div className="text-xs text-[#65604E] mt-0.5">
                          Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <span
                          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full font-bold border ${getStatusColor(order.status)}`}
                        >
                          {translateStatus(order.status)}
                        </span>
                        <span className='text-xs font-medium text-gray-500'>
                          ({translatePaymentStatus(info.payment_status)})
                        </span>
                      </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="divide-y divide-gray-100">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-5 py-3 hover:bg-[#FEFDFB] transition">
                          <div className="w-16 h-16 relative flex-shrink-0 border border-gray-100 rounded-lg"> {/* Ảnh 64x64, rounded-lg */}
                            <Image
                              src={
                                item?.product_images?.[0]?.image_data
                                  ? `data:image/avif;base64,${item.product_images[0].image_data}`
                                  : productMap[item.product_id]?.images?.[0]
                                    ? productMap[item.product_id].images[0]
                                    : '/no-image.png'
                              }
                              alt={item.product_name || 'Sản phẩm'}
                              fill
                              unoptimized
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#2C2A24] leading-snug truncate">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Số lượng: <span className="font-medium text-[#2C2A24]">{item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right font-semibold text-sm text-[#2C2A24] whitespace-nowrap pt-1">
                            {formatPrice(item.price_at_order * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Tổng cộng & Nút chi tiết */}
                    <div className="flex justify-between items-center px-5 py-3 border-t border-[#E5E2D8] bg-[#F9F8F4]">

                      <div className='text-left'>
                        <div className="text-xs text-gray-600">
                          Thanh toán: <span className="font-semibold text-[#2C2A24]">{translatePaymentMethod(info.payment_method)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Phí vận chuyển: <span className="font-semibold text-[#2C2A24]">Miễn phí</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="text-sm text-[#65604E]">TỔNG CỘNG:</div>
                          <div className="text-xl font-bold text-[#C4975A]">
                            {formatPrice(total)}
                          </div>
                        </div>
                      </div>

                    </div>
                    <div className="flex justify-end p-5 bg-white border-t border-[#E5E2D8]">
                      <Link
                        href={`/orders/${id}`}
                        className="px-6 py-2 text-sm font-semibold border border-[#C4975A] rounded-full
                          hover:bg-gradient-to-r hover:from-[#C4975A] hover:to-[#b88648]
                          hover:text-white text-[#C4975A] transition-all shadow-md"
                      >
                        Xem chi tiết đơn hàng
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </BaseLayout>
  );
}