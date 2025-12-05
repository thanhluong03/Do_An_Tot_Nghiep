'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../layouts';
// Giả sử các imports này đã được định nghĩa đúng trong '@/api/services/orderService'
import { getOrderDetail, Order, OrderItem } from '@/api/services/orderService';
import { orderApi } from '@/api/modules/orders';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, MapPin, Package, CreditCard, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Hàm định dạng tiền tệ đơn giản
const formatPrice = (amount: string | number) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('vi-VN') + '₫';
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = searchParams.get('orderId');
  const orderIds = searchParams.get('orderIds'); // Để hỗ trợ nhiều đơn hàng
  const paymentStatus = searchParams.get('payment'); // success/failed
  const [orders, setOrders] = useState<Order[]>([]); // Thay đổi thành array
  const [loading, setLoading] = useState(true);

  // --- Rollback COD orders nếu payment success (với retry) ---
  useEffect(() => {
    if (paymentStatus === 'success' && user?.id) {
      (async () => {
        // Hàm rollback với retry
        const rollbackCODOrders = async (retryCount = 0) => {
          try {
            // Đợi một chút để đảm bảo backend đã cập nhật xong
            await new Promise(resolve => setTimeout(resolve, 1000 + retryCount * 1000));
            console.log(`🔄 Bắt đầu rollback các đơn COD trong confirmation page (lần thử ${retryCount + 1})...`);
            const allCustomerOrders = await orderApi.getOrdersByCustomer(user.id as string, 1, 100);
            console.log('🔍 Raw response từ getOrdersByCustomer:', allCustomerOrders);

            // Xử lý nhiều cấu trúc response có thể có
            let ordersList: any[] = [];
            if (Array.isArray(allCustomerOrders)) {
              ordersList = allCustomerOrders;
            } else if (allCustomerOrders?.data) {
              if (Array.isArray(allCustomerOrders.data)) {
                ordersList = allCustomerOrders.data;
              } else if (allCustomerOrders.data?.orders && Array.isArray(allCustomerOrders.data.orders)) {
                ordersList = allCustomerOrders.data.orders;
              } else if (allCustomerOrders.data?.data && Array.isArray(allCustomerOrders.data.data)) {
                ordersList = allCustomerOrders.data.data;
              }
            } else if (allCustomerOrders?.orders && Array.isArray(allCustomerOrders.orders)) {
              ordersList = allCustomerOrders.orders;
            }

            console.log('🔍 Tổng số orders của customer:', ordersList.length);

            // Lấy danh sách order IDs MOMO từ URL hoặc sessionStorage
            let momoOrderIds: number[] = [];
            if (orderIds) {
              try {
                const parsed = JSON.parse(orderIds);
                momoOrderIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
              } catch {
                momoOrderIds = orderIds.split(',').map(Number);
              }
            } else if (orderId) {
              // Nếu orderId là transaction reference (bắt đầu bằng MOMO), cần lấy order IDs từ transaction
              if (orderId.startsWith('MOMO')) {
                try {
                  const transactionResponse = await orderApi.getOrdersByTransaction(orderId);
                  if (transactionResponse.success && transactionResponse.data?.orderIds) {
                    momoOrderIds = transactionResponse.data.orderIds.map(Number);
                  }
                } catch (err) {
                  console.error('❌ Lỗi lấy order IDs từ transaction:', err);
                }
              } else {
                momoOrderIds = [Number(orderId)];
              }
            }

            console.log('🔍 MOMO Order IDs:', momoOrderIds);

            // Đảm bảo ordersList là array trước khi filter
            if (!Array.isArray(ordersList)) {
              console.warn('⚠️ ordersList không phải array, bỏ qua rollback');
              return;
            }

            // Tìm các order COD đã bị cập nhật nhầm (PAID hoặc CONFIRMED)
            // NHƯNG KHÔNG rollback các đơn đã hoàn thành (DELIVERED, EXCHANGED, v.v.)
            const codOrdersToRollback = ordersList.filter((order: any) => {
              const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
              const paymentStatus = order?.payment_status || order?.current_order?.payment_status;
              const orderStatus = order?.status || order?.current_order?.status;
              const isCOD = paymentMethod === 'ONSITE' || paymentMethod === 'COD';
              const isPaid = paymentStatus === 'PAID';
              const isConfirmed = orderStatus === 'CONFIRMED';
              // Loại trừ các order MOMO hiện tại
              const isNotMomoOrder = !momoOrderIds.includes(order.id);

              // 🔥 QUAN TRỌNG: KHÔNG rollback các đơn đã hoàn thành giao hàng
              const completedStatuses = ['DELIVERED', 'EXCHANGED', 'DELIVERY_FAILED', 'DELIVERY_FAILED_RETURN'];
              const isNotCompleted = !completedStatuses.includes(orderStatus);

              // Rollback nếu đơn COD bị cập nhật nhầm (PAID hoặc CONFIRMED)
              // VÀ chưa hoàn thành giao hàng
              return isCOD && (isPaid || isConfirmed) && isNotMomoOrder && isNotCompleted;
            });

            if (codOrdersToRollback.length > 0) {
              console.log(`⚠️ Phát hiện ${codOrdersToRollback.length} đơn COD đã bị cập nhật nhầm, đang rollback...`, codOrdersToRollback.map((o: any) => ({ id: o.id, payment_method: o.payment_method, payment_status: o.payment_status })));

              // Rollback lại cả status và payment_status cho các order COD
              await Promise.all(
                codOrdersToRollback.map((order: any) => {
                  const currentStatus = order?.status || order?.current_order?.status;
                  // Chỉ rollback nếu status là CONFIRMED (đã bị cập nhật nhầm)
                  const shouldRollbackStatus = currentStatus === 'CONFIRMED';

                  return orderApi.updateOrder(order.id, {
                    ...(shouldRollbackStatus && { status: 'CREATED' }), // Rollback status về CREATED nếu bị cập nhật nhầm
                    payment_status: 'UNPAID', // Rollback payment_status về UNPAID
                  }).then(() => {
                    console.log(`✅ Đã rollback đơn COD #${order.id} về CREATED và UNPAID`);
                  }).catch(err => {
                    console.error(`❌ Lỗi rollback đơn COD #${order.id}:`, err);
                  });
                })
              );

              console.log('✅ Đã rollback status và payment_status cho các đơn COD trong confirmation page');

              // Retry thêm 2 lần nữa sau 5 giây mỗi lần để đảm bảo
              if (retryCount < 2) {
                setTimeout(() => rollbackCODOrders(retryCount + 1), 5000);
              }
            } else {
              console.log('✅ Không có đơn COD nào bị cập nhật nhầm trong confirmation page');
            }
          } catch (rollbackError) {
            console.error('❌ Lỗi khi rollback đơn COD trong confirmation page:', rollbackError);
            // Retry nếu chưa quá 3 lần
            if (retryCount < 3) {
              setTimeout(() => rollbackCODOrders(retryCount + 1), 3000);
            }
          }
        };

        rollbackCODOrders();
      })();
    }
  }, [paymentStatus, user?.id, orderId, orderIds]);

  // --- Fetch order detail(s) ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let orderIdsToFetch: string[] = [];

        // Xử lý nhiều order IDs
        if (orderIds) {
          try {
            orderIdsToFetch = JSON.parse(orderIds);
          } catch {
            orderIdsToFetch = orderIds.split(',');
          }
        } else if (orderId) {
          // Kiểm tra nếu orderId là transaction reference (bắt đầu bằng MOMO)
          if (orderId.startsWith('MOMO')) {
            console.log('🔄 Detected transaction reference, fetching order IDs...');
            try {
              const transactionResponse = await orderApi.getOrdersByTransaction(orderId);
              console.log('📊 Transaction API response:', transactionResponse);

              if (transactionResponse.success && transactionResponse.data?.orderIds) {
                orderIdsToFetch = transactionResponse.data.orderIds.map(String);
                console.log('✅ Found order IDs from transaction:', orderIdsToFetch);
              } else {
                console.error('❌ Could not get order IDs from transaction reference');
                return;
              }
            } catch (err) {
              console.error('❌ Error fetching orders by transaction:', err);
              return;
            }
          } else {
            orderIdsToFetch = [orderId];
          }
        }

        if (orderIdsToFetch.length === 0) return;

        console.log('📦 Fetching orders:', orderIdsToFetch);

        // Fetch tất cả các đơn hàng
        const orderPromises = orderIdsToFetch.map(async (id) => {
          try {
            console.log('🔄 Đang fetch đơn hàng ID:', id);
            const data = await getOrderDetail(Number(id));
            console.log('📊 Response data cho ID', id, ':', data);

            // Kiểm tra an toàn trước khi truy cập properties
            if (!data) {
              console.error(`❌ Không nhận được dữ liệu cho đơn hàng ${id}`);
              return null;
            }

            // Chuẩn hóa và gán items
            const items: OrderItem[] = data.items || data.current_order?.items || [];
            console.log('📦 Items cho đơn hàng', id, ':', items);

            // Chuẩn hóa tên khách hàng
            const customerName = data.customer_name || data.customer_full_name || 'Khách vãng lai';

            return { ...data, items, customer_full_name: customerName };
          } catch (err) {
            console.error(`❌ Lỗi khi tải đơn hàng ${id}:`, err);
            return null;
          }
        });

        const fetchedOrders = await Promise.all(orderPromises);
        const validOrders = fetchedOrders.filter(order => order !== null) as Order[];

        console.log('✅ Fetched orders (trước khi filter):', validOrders);

        // Nếu là guest checkout (COD) hoặc thanh toán thất bại, hiển thị tất cả đơn
        // Nếu là thanh toán MOMO thành công, chỉ hiển thị đơn MOMO
        let finalOrders = validOrders;

        if (paymentStatus === 'success') {
          // Chỉ filter khi thanh toán thành công - loại bỏ đơn COD
          finalOrders = validOrders.filter((order: Order) => {
            const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
            const isMOMO = paymentMethod === 'CARD' || paymentMethod === 'MOMO';
            console.log(`🔍 Order #${order.id}: paymentMethod=${paymentMethod}, isMOMO=${isMOMO}`);
            return isMOMO;
          });
          console.log('✅ Filtered MOMO orders only:', finalOrders);
        } else {
          // Guest COD hoặc failed payment - hiển thị tất cả
          console.log('✅ Showing all orders (COD/Guest or payment failed)');
        }

        setOrders(finalOrders);
      } catch (err) {
        console.error('❌ Lỗi tổng thể:', err);
        toast.error('Không thể tải thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderId, orderIds, paymentStatus]);

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

  if (!orders || orders.length === 0) {
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

  // --- Tính toán tổng cho tất cả đơn hàng ---
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  // Tính tổng phí vận chuyển từ tất cả order items
  const shippingFee = orders.reduce((sum, order) => {
    const items = order.orderItems || order.current_order?.items || order.items || [];
    const orderShippingFee = items.reduce((itemSum: number, item: any) => {
      return itemSum + (item.shipping_fee ? Number(item.shipping_fee) : 0);
    }, 0);
    return sum + orderShippingFee;
  }, 0);

  const firstOrder = orders[0]; // Lấy thông tin từ đơn hàng đầu tiên cho địa chỉ, khách hàng

  // --- Định dạng các trường dữ liệu từ đơn hàng đầu tiên ---
  const shippingAddress = firstOrder.shipping_address || firstOrder.current_order?.shipping_address || '—';
  const customerName = firstOrder.customer_full_name || firstOrder.customer_name || 'Khách vãng lai';
  const orderDate = firstOrder.order_date
    ? new Date(firstOrder.order_date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '—';
  const paymentMethodText =
    firstOrder.payment_method === 'COD'
      ? 'COD (Thanh toán khi nhận hàng)'
      : firstOrder.payment_method === 'MOMO'
        ? 'Thanh toán MoMo'
        : 'Chuyển khoản Ngân hàng';
  const paymentStatusText =
    firstOrder.payment_status === 'PAID'
      ? 'Đã thanh toán'
      : firstOrder.payment_status === 'UNPAID'
        ? 'Chưa thanh toán'
        : 'Đang xử lý';
  const paymentStatusColor = firstOrder.payment_status === 'PAID' ? 'text-green-600' : 'text-red-600';


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
              Cảm ơn bạn, {orders.length > 1 ? `${orders.length} đơn hàng` : 'đơn hàng'} của bạn đã được đặt thành công!
              {paymentStatus === 'success' && ' 💳 Thanh toán đã được xác nhận.'}
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
                  <span
                    className={`font-bold ${firstOrder.status === 'CREATED'
                      ? 'text-blue-500'
                      : firstOrder.status === 'CONFIRMED'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                      }`}
                  >
                    {firstOrder.status === 'CREATED'
                      ? 'Chờ xác nhận'
                      : firstOrder.status === 'CONFIRMED'
                        ? 'Đã xác nhận'
                        : firstOrder.status}
                  </span>
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

            {/* --- Cột 3: Sản phẩm theo từng cửa hàng (Mở rộng toàn bộ hàng dưới) --- */}
            <div className="lg:col-span-3 p-6 border border-[#EBE8E0] rounded-xl bg-[#FFF]">
              <h2 className="text-xl font-semibold mb-4 text-[#A38D64] flex items-center gap-2">
                <Package className="w-5 h-5" /> Chi tiết đơn hàng ({orders.length} {orders.length > 1 ? 'cửa hàng' : 'đơn hàng'})
              </h2>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {orders.map((order, orderIndex) => {
                  const totalItems = order.items?.length || 0;

                  return (
                    <div key={order.id} className="border border-[#F1F0E8] rounded-lg p-4 bg-[#FFFCF7]">
                      {/* Header cho từng cửa hàng */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EBE8E0]">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#A38D64]" />
                          <h3 className="font-semibold text-[#2C2A24]">
                            {/* Lấy tên cửa hàng từ item đầu tiên */}
                            {order.items?.[0]?.store_name || `Cửa hàng #${order.items?.[0]?.store_id || orderIndex + 1}`}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#7C7768]">Đơn hàng #{order.id}</p>
                          <p className="text-xs text-[#A38D64] font-medium">
                            {totalItems} sản phẩm • {formatPrice(Number(order.total_amount))}
                          </p>
                        </div>
                      </div>

                      {/* Danh sách sản phẩm của cửa hàng */}
                      <div className="divide-y divide-gray-100">
                        {order.items?.length ? (
                          order.items.map((item, i) => {
                            const imgSrc = getMainImage(item.product_images);
                            return (
                              <div
                                key={i}
                                className="flex items-start py-3 gap-4 first:pt-0 last:pb-0"
                              >
                                <div className="w-14 h-14 flex-shrink-0 relative">
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
                                  <p className="font-medium text-[#2C2A24] text-sm">{item.product_name || 'Sản phẩm không rõ'}</p>
                                  {/* Hiển thị thông tin phân loại nếu có */}
                                  {(item.attribute1_name || item.attribute2_name) && (
                                    <div className="flex gap-1 mt-1">
                                      {item.attribute1_name && (
                                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                                          {item.attribute1_name}
                                        </span>
                                      )}
                                      {item.attribute2_name && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                          {item.attribute2_name}
                                        </span>
                                      )}
                                    </div>
                                  )}
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
                          <p className="text-gray-500 italic text-center py-4 text-sm">Không có sản phẩm nào trong đơn hàng này.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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