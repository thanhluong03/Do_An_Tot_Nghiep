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
      } catch {}
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

//   return (
//     <BaseLayout>
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <h1 className="text-2xl font-semibold mb-8 text-[#2C2A24] text-center">
//           Đơn hàng của tôi
//         </h1>

//         {loading && <div className="text-center py-8 text-gray-600">Đang tải…</div>}
//         {error && <div className="text-center text-red-600 py-8">{error}</div>}

//         {!loading && !error && (
//           orders.length === 0 ? (
//             <div className="text-center py-12 text-gray-500">
              
//               <p>Chưa có đơn hàng nào.</p>
//             </div>
//           ) : (
//             <div className="space-y-8">
//               {orders.map((order) => {
//                 const id = order.id ?? order._id;
//                 const info = order.current_order || order;
//                 const items = info.items || [];
//                 const total = info.total_amount ?? info.total ?? order.total_amount ?? 0;

//                 return (
//                   <div
//                     key={id}
//                     className="bg-white rounded-2xl border border-[#E5E2D8] shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
//                   >
//                     {/* Header */}
//                     <div className="flex justify-between items-center border-b p-5 bg-[#F9F8F4]">
//                       <div>
//                         <div className="font-medium text-[#2C2A24]">
//                           Mã đơn hàng: <span className="font-bold">#{id}</span>
//                         </div>
//                         <div className="text-sm text-gray-500 mt-1">
//                           Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
//                         </div>
//                       </div>
//                       <span
//                         className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}
//                       >
//                         {order.status || 'Không rõ'}
//                       </span>
//                     </div>

//                     {/* Thông tin giao hàng & thanh toán */}
//                     <div className="bg-[#FDFCF9] border-b p-4 text-sm text-gray-700 grid sm:grid-cols-2 gap-2">
//                       <p><strong>Địa chỉ giao hàng:</strong> {info.shipping_address || '—'}</p>
//                       <p><strong>Phương thức thanh toán:</strong> {info.payment_method || 'Không rõ'}</p>
//                       <p><strong>Trạng thái thanh toán:</strong> {info.payment_status || 'Không rõ'}</p>
//                     </div>

//                     {/* Danh sách sản phẩm */}
//                     <div className="divide-y">
//                       {items.map((item: any, idx: number) => (
//                         <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4">
//                           <div className="w-24 h-24 relative flex-shrink-0">
//                             <Image
//                               src={
//                                 item?.product_images?.[0]?.image_data
//                                   ? `data:image/avif;base64,${item.product_images[0].image_data}`
//                                   : productMap[item.product_id]?.images?.[0]
//                                     ? productMap[item.product_id].images[0]
//                                     : '/no-image.png'
//                               }
//                               alt={item.product_name || 'Sản phẩm'}
//                               fill
//                               unoptimized
//                               className="object-cover rounded-lg border border-gray-200"
//                             />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="font-medium text-[#2C2A24] truncate">
//                               {item.product_name}
//                             </div>
//                             <div className="text-sm text-gray-500 truncate">
//                               {item.description || ''}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               Cửa hàng: {item.store_name} – {item.store_address}
//                             </div>
//                             <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
//                           </div>
//                           <div className="text-right font-medium text-[#2C2A24] whitespace-nowrap">
//                             {formatPrice(item.price_at_order * item.quantity)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Tổng cộng */}
//                     <div className="flex justify-between items-center p-5 border-t bg-[#F9F8F4]">
//                       <div className="text-sm text-gray-600">
//                         Thanh toán: <strong>{info.payment_method || '—'}</strong>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-sm text-gray-600">Tổng tiền:</div>
//                         <div className="text-xl font-semibold text-[#2C2A24]">
//                           {formatPrice(total)}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Nút hành động */}
//                     <div className="flex justify-end p-4">
//                       <Link
//                         href={`/orders/${id}`}
//                         className="px-5 py-2 text-sm font-medium border rounded-full hover:bg-[#F5F1EB] text-[#2C2A24] transition"
//                       >
//                         Xem chi tiết
//                       </Link>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )
//         )}
//       </div>
//     </BaseLayout>
//   );
// }
return (
    <BaseLayout>
      {/* 1. Thu hẹp max-w container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F5F1EB]">
        
        {/* Tiêu đề: Giảm font */}
        <h1 className="text-3xl font-serif mb-8 text-[#2C2A24] text-center tracking-wider border-b border-[#C4975A]/30 pb-2">
          Lịch sử Đơn hàng
        </h1>

        {loading && <div className="text-center py-10 text-[#65604E] text-sm">Đang tải đơn hàng...</div>}
        {error && <div className="text-center text-red-600 py-10 text-sm">{error}</div>}

        {!loading && !error && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
              <p className="text-base">Bạn chưa có đơn hàng nào.</p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 text-sm bg-[#C4975A] text-white font-medium rounded-full shadow-sm hover:bg-[#a97e4a] transition-all"
              >
                Khám phá Sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-4"> {/* Giảm khoảng cách giữa các đơn hàng */}
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
                    {/* Header: Giảm padding và font size */}
                    <div className="flex justify-between items-center border-b border-[#E5E2D8] px-4 py-3 bg-[#F9F8F4]">
                      <div>
                        <div className="font-semibold text-base text-[#2C2A24]">
                          Mã đơn hàng: <span className="font-bold text-[#C4975A]">#{id}</span>
                        </div>
                        <div className="text-xs text-[#65604E] mt-0.5">
                          Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full font-bold ${getStatusColor(order.status)}`}
                      >
                        {order.status || 'Không rõ'}
                      </span>
                    </div>

                    {/* Thông tin giao hàng & thanh toán: Giảm padding và font size */}
                    <div className="bg-[#FDFCF9] border-b border-[#E5E2D8] px-4 py-2 text-xs text-[#65604E] grid sm:grid-cols-2 gap-1.5">
                      <p><strong>Địa chỉ:</strong> {info.shipping_address || '—'}</p>
                      <p><strong>Phương thức thành toán:</strong> {info.payment_method || 'Không rõ'}</p>
                      <p className="sm:col-span-2"><strong>Trạng thái thanh toán:</strong> <span className="font-semibold">{info.payment_status || 'Chờ thanh toán'}</span></p>
                    </div>

                    {/* Danh sách sản phẩm: Giảm kích thước ảnh, padding và font size */}
                    <div className="divide-y divide-gray-100">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-2 hover:bg-[#FEFDFB] transition">
                          <div className="w-16 h-16 relative flex-shrink-0 border border-gray-100 rounded-md"> {/* Ảnh 64x64 */}
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
                              className="object-cover rounded-md"
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

                    {/* Tổng cộng: Giảm padding và font size */}
                    <div className="flex justify-between items-center px-4 py-3 border-t border-[#E5E2D8] bg-[#F9F8F4]">
                      <div className="text-xs text-gray-600">
                        Phí vận chuyển: <span className="font-semibold text-[#2C2A24]">Miễn phí</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#65604E]">TỔNG CỘNG:</div>
                        <div className="text-xl font-bold text-[#C4975A]">
                          {formatPrice(total)}
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động: Giảm padding và font size */}
                    <div className="flex justify-end px-4 py-2 bg-white">
                      <Link
                        href={`/orders/${id}`}
                        className="px-4 py-1.5 text-xs font-semibold border border-[#C4975A] rounded-full hover:bg-[#C4975A] hover:text-white text-[#C4975A] transition shadow-sm"
                      >
                        Xem chi tiết
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
