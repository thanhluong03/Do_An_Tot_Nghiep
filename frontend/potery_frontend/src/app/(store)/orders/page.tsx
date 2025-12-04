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
import { useRouter } from 'next/dist/client/components/navigation';
import { ArrowLeft, Bot, Gift, MessageSquare, Search, User } from 'lucide-react';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, AIChatModal, ReturnOrderModal, CancelOrderModal } from '@/components/feature';
import { voucherApi } from '@/api/modules/voucher';

const translateStatus = (status: string | undefined): string => {
  if (!status) return 'Không rõ';
  const s = status.toUpperCase();
  switch (s) {
    case 'CREATED':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PACKING':
      return 'Đang đóng gói';
    case 'PENDING_DELIVERY':
      return 'Chờ vận chuyển';
    case 'SHIPPING':
      return 'Đang vận chuyển';
    case 'DELIVERED':
      return 'Đã giao thành công';
    case 'DELIVERY_FAILED':
      return 'Đã giao thất bại';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'RETURN_REQUESTED':
      return 'Đang yêu cầu đổi trả';
    case 'CONFIRMED_RETURN':
      return 'Đã xác nhận đổi trả';
    case 'PACKING_RETURN':
      return 'Đang đóng gói đổi trả';
    case 'PENDING_DELIVERY_RETURN':
      return 'Chờ giao hàng đổi trả';
    case 'SHIPPING_RETURN':
      return 'Đang giao hàng đổi trả';
    case 'EXCHANGED':
      return 'Đã đổi trả';
    case 'DELIVERY_FAILED_RETURN':
      return 'Đã giao đổi trả thất bại';
    case 'CANCELLED_RETURN':
      return 'Không chấp nhận đổi trả';
    default:
      return status;
  }
};
const statusTabs = [
  { key: 'ALL', name: 'Tất cả', statuses: [] },
  { key: 'PENDING', name: 'Chờ xử lý', statuses: ['CREATED', 'PENDING'] },
  { key: 'PROCESSING', name: 'Đang giao hàng', statuses: ['CONFIRMED', 'PROCESSING', 'SHIPPING'] },
  { key: 'COMPLETED', name: 'Đã hoàn thành', statuses: ['DELIVERED', 'COMPLETED'] },
  { key: 'CANCELLED', name: 'Đã hủy', statuses: ['CANCELLED', 'FAILED'] },
  { key: 'RETURN_REQUESTED', name: 'Yêu cầu đổi trả', statuses: ['RETURN_REQUESTED'] },
];
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
const translatePaymentMethod = (method: string | undefined): string => {
  if (!method) return '—';
  const m = method.toUpperCase();
  switch (m) {
    case 'COD':
    case 'ONSITE':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'MOMO':
    case 'CARD':
      return 'Thẻ/MoMo';
    default:
      return method;
  }
};
export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<number, any>>({});
  const { clear: clearCart } = useCart();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

  const handleCancelOrder = async (orderId: any) => {
    setCancelOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (reason: string, images: File[]) => {
    if (!cancelOrderId) return;

    setCancelLoading(true);
    setProcessingOrderId(cancelOrderId);

    // Đóng modal ngay lập tức
    setIsCancelModalOpen(false);
    setCancelOrderId(null);

    try {
      await orderApi.updateOrder(
        cancelOrderId,
        {
          status: 'CANCELLED',
          cancel_reason: reason,
          person_cancel: 'CUSTOMER',
        },
        images,
        'cancel_reason_images'
      );

      toast.success('Đã hủy đơn hàng thành công.');

      // Cập nhật trạng thái đơn hàng ngay lập tức
      setOrders(prevOrders =>
        (Array.isArray(prevOrders) ? prevOrders : []).map(order =>
          (order.id ?? order._id) == cancelOrderId
            ? { ...order, status: 'CANCELLED', cancel_reason: reason }
            : order
        )
      );

    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelLoading(false);
      setProcessingOrderId(null);
    }
  };

  const handleReturnOrder = async (orderId: any) => {
    setReturnOrderId(orderId);
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (reason: string, images: File[]) => {
    if (!returnOrderId) return;

    setReturnLoading(true);
    setProcessingOrderId(returnOrderId);

    // Đóng modal ngay lập tức
    setIsReturnModalOpen(false);
    setReturnOrderId(null);

    try {
      await orderApi.updateOrder(
        returnOrderId,
        {
          status: 'RETURN_REQUESTED',
          reason_change: reason,
        },
        images,
        'reason_change_images'
      );

      toast.success('Yêu cầu đổi trả đã được gửi thành công');

      // Cập nhật trạng thái đơn hàng ngay lập tức mà không cần reload
      setOrders(prevOrders =>
        (Array.isArray(prevOrders) ? prevOrders : []).map(order =>
          (order.id ?? order._id) == returnOrderId
            ? { ...order, status: 'RETURN_REQUESTED', reason_change: reason }
            : order
        )
      );

    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu đổi trả');
    } finally {
      setReturnLoading(false);
      setProcessingOrderId(null);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order_id');

    if (paymentStatus === 'success' && orderId) {
      (async () => {
        try {
          // Kiểm tra payment_method của order đầu tiên để đảm bảo đây là đơn MOMO
          let firstOrderDetail;
          let firstOrderPaymentMethod: string | undefined;
          try {
            firstOrderDetail = await orderApi.getOrderDetail(Number(orderId));
            firstOrderPaymentMethod = firstOrderDetail?.payment_method || firstOrderDetail?.data?.payment_method || firstOrderDetail?.current_order?.payment_method;
            console.log('🔍 Payment method của order đầu tiên:', firstOrderPaymentMethod);
            console.log('🔍 Full order detail:', firstOrderDetail);
            
            // QUAN TRỌNG: Chỉ xử lý nếu là đơn MOMO (CARD), KHÔNG xử lý đơn COD (ONSITE)
            if (firstOrderPaymentMethod !== 'CARD' && firstOrderPaymentMethod !== 'MOMO') {
              console.log('⚠️ Order đầu tiên không phải MOMO, bỏ qua tất cả xử lý:', firstOrderPaymentMethod);
              // Nếu không phải MOMO, không làm gì cả và return sớm
              // Backend có thể đã cập nhật nhầm, nhưng frontend sẽ không cập nhật thêm
              clearCart();
              toast.success('🎉 Thanh toán thành công!');
              window.history.replaceState({}, '', '/orders');
              return;
            }
            
            // Chỉ cập nhật nếu là đơn MOMO (CARD)
            console.log('✅ Order đầu tiên là MOMO, tiếp tục xử lý...');
            // Backend đã cập nhật rồi, không cần cập nhật lại ở đây
            // Chỉ log để confirm
            console.log('✅ Order đầu tiên đã được backend cập nhật (MOMO)');
            
            // 🔥 QUAN TRỌNG: Rollback các order COD nếu backend đã cập nhật nhầm
            // Lấy tất cả orders của customer để kiểm tra
            if (user?.id) {
              try {
                console.log('🔄 Bắt đầu rollback các đơn COD trong orders page...');
                const allCustomerOrders = await orderApi.getOrdersByCustomer(user.id as string, 1, 100);
                const ordersList = allCustomerOrders?.data || allCustomerOrders || [];
                console.log('🔍 Tổng số orders của customer:', ordersList.length);
                
                // Lấy danh sách order IDs MOMO từ sessionStorage hoặc URL
                let momoOrderIds: number[] = [Number(orderId)];
                const momoOrderIdsStr = sessionStorage.getItem('momo_order_ids');
                if (momoOrderIdsStr) {
                  try {
                    const parsed = JSON.parse(momoOrderIdsStr);
                    momoOrderIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
                  } catch {
                    // Ignore parse error
                  }
                }
                
                // Tìm các order COD đã bị cập nhật nhầm (PAID hoặc CONFIRMED)
                const codOrdersToRollback = ordersList.filter((order: any) => {
                  const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
                  const paymentStatus = order?.payment_status || order?.current_order?.payment_status;
                  const orderStatus = order?.status || order?.current_order?.status;
                  const isCOD = paymentMethod === 'ONSITE' || paymentMethod === 'COD';
                  const isPaid = paymentStatus === 'PAID';
                  const isConfirmed = orderStatus === 'CONFIRMED';
                  // Loại trừ các order MOMO
                  const isNotMomoOrder = !momoOrderIds.includes(order.id);
                  // Rollback nếu đơn COD bị cập nhật nhầm (PAID hoặc CONFIRMED)
                  return isCOD && (isPaid || isConfirmed) && isNotMomoOrder;
                });
                
                if (codOrdersToRollback.length > 0) {
                  console.log(`⚠️ Phát hiện ${codOrdersToRollback.length} đơn COD đã bị cập nhật nhầm, đang rollback...`, codOrdersToRollback.map((o: any) => ({ id: o.id, payment_method: o.payment_method, payment_status: o.payment_status })));
                  
                  // Rollback lại cả status và payment_status cho các order COD
                  await Promise.all(
                    codOrdersToRollback.map((order: any) =>
                      orderApi.updateOrder(order.id, {
                        status: 'CREATED', // Rollback status về CREATED (chưa xác nhận)
                        payment_status: 'UNPAID', // Rollback payment_status về UNPAID (chưa thanh toán)
                      }).catch(err => {
                        console.error(`❌ Lỗi rollback đơn COD #${order.id}:`, err);
                      })
                    )
                  );
                  
                  console.log('✅ Đã rollback status và payment_status cho các đơn COD trong orders page');
                  
                  // Reload orders để hiển thị đúng
                  window.location.reload();
                } else {
                  console.log('✅ Không có đơn COD nào bị cập nhật nhầm trong orders page');
                }
              } catch (rollbackError) {
                console.error('❌ Lỗi khi rollback đơn COD trong orders page:', rollbackError);
                // Không throw error, chỉ log
              }
            }
          } catch (detailError) {
            console.error('❌ Lỗi lấy thông tin order:', detailError);
            // KHÔNG cập nhật nếu không lấy được thông tin - để tránh cập nhật nhầm đơn COD
            console.warn('⚠️ Không thể lấy thông tin order, bỏ qua tất cả xử lý để tránh cập nhật nhầm đơn COD');
            clearCart();
            toast.success('🎉 Thanh toán thành công!');
            window.history.replaceState({}, '', '/orders');
            return;
          }

          // Kiểm tra xem có danh sách order IDs khác từ sessionStorage không (nhiều đơn từ nhiều cửa hàng)
          // QUAN TRỌNG: Chỉ xử lý các order từ sessionStorage nếu order đầu tiên là MOMO
          // Nếu order đầu tiên không phải MOMO, đã return ở trên rồi
          const momoOrderIdsStr = sessionStorage.getItem('momo_order_ids');
          if (momoOrderIdsStr) {
            try {
              const allOrderIds: number[] = JSON.parse(momoOrderIdsStr);
              console.log('💾 Tìm thấy danh sách order IDs từ sessionStorage:', allOrderIds);
              console.log('💾 Order đầu tiên từ URL:', orderId);
              console.log('💾 Tất cả order IDs từ sessionStorage:', allOrderIds);

              // Cập nhật payment_status cho tất cả các order còn lại (trừ order đầu tiên đã cập nhật)
              // NHƯNG chỉ cập nhật các order có payment_method = 'CARD' (MOMO)
              const remainingOrderIds = allOrderIds.filter(id => id !== Number(orderId));
              if (remainingOrderIds.length > 0) {
                console.log(`🔄 Kiểm tra và cập nhật payment_status cho ${remainingOrderIds.length} đơn hàng còn lại:`, remainingOrderIds);
                
                // Lấy thông tin từng order để kiểm tra payment_method
                const ordersToUpdate: number[] = [];
                await Promise.all(
                  remainingOrderIds.map(async (orderId) => {
                    try {
                      const orderDetail = await orderApi.getOrderDetail(orderId);
                      const paymentMethod = orderDetail?.payment_method || orderDetail?.data?.payment_method || orderDetail?.current_order?.payment_method;
                      console.log(`🔍 Order #${orderId} - Payment method:`, paymentMethod);
                      console.log(`🔍 Order #${orderId} - Full detail:`, orderDetail);
                      
                      // QUAN TRỌNG: Chỉ thêm vào danh sách cập nhật nếu là MOMO
                      // KHÔNG cập nhật đơn COD (ONSITE)
                      if (paymentMethod === 'CARD' || paymentMethod === 'MOMO') {
                        ordersToUpdate.push(orderId);
                        console.log(`✅ Order #${orderId} là MOMO, sẽ được cập nhật`);
                      } else {
                        console.log(`⚠️ Order #${orderId} không phải MOMO (${paymentMethod}), bỏ qua - KHÔNG cập nhật`);
                        console.log(`⚠️ Đây có thể là đơn COD, sẽ KHÔNG được cập nhật`);
                      }
                    } catch (err) {
                      console.error(`❌ Lỗi lấy thông tin order #${orderId}:`, err);
                      // KHÔNG thêm vào danh sách cập nhật nếu không lấy được thông tin
                      console.warn(`⚠️ Bỏ qua order #${orderId} vì không lấy được thông tin - để tránh cập nhật nhầm`);
                    }
                  })
                );

                // Chỉ cập nhật các order MOMO
                if (ordersToUpdate.length > 0) {
                  console.log(`🔄 Cập nhật payment_status cho ${ordersToUpdate.length} đơn MOMO:`, ordersToUpdate);
                  console.log(`⚠️ Các đơn COD sẽ KHÔNG được cập nhật`);
                  await Promise.all(
                    ordersToUpdate.map(orderId =>
                      orderApi.updateOrder(orderId, {
                        status: 'CONFIRMED',
                        payment_status: 'PAID',
                      }).catch(err => {
                        console.error(`❌ Lỗi cập nhật đơn #${orderId}:`, err);
                      })
                    )
                  );
                  console.log('✅ Đã cập nhật payment_status cho tất cả các đơn MOMO');
                } else {
                  console.log('⚠️ Không có đơn MOMO nào cần cập nhật từ sessionStorage');
                }
              } else {
                console.log('ℹ️ Không có đơn hàng nào khác cần cập nhật');
              }

              // Xóa sessionStorage sau khi xử lý xong
              sessionStorage.removeItem('momo_order_ids');
            } catch (parseErr) {
              console.error('❌ Lỗi parse momo_order_ids:', parseErr);
            }
          } else {
            console.log('ℹ️ Không có momo_order_ids trong sessionStorage');
          }

          // 🔥 Cập nhật trạng thái voucher cho MOMO sau khi thanh toán thành công
          const voucherCustomerIdStr = sessionStorage.getItem('selected_voucher_customer_id');
          const voucherIdStr = sessionStorage.getItem('selected_voucher_id');
          const customerIdStr = sessionStorage.getItem('selected_customer_id');
          
          if (voucherCustomerIdStr && user?.id) {
            try {
              const voucherCustomerId = Number(voucherCustomerIdStr);
              console.log(`✨ [VOUCHER UPDATE MOMO] Cập nhật voucher_customer_id=${voucherCustomerId} cho user ${user.id} sau khi thanh toán MOMO thành công`);
              
              // Cập nhật status voucher trên server thành USED
              const result = await voucherApi.updateVoucherCustomerStatus(voucherCustomerId);
              console.log('✅ [VOUCHER UPDATE MOMO] Kết quả cập nhật voucher:', result);
              console.log('✅ [VOUCHER UPDATE MOMO] Voucher đã được cập nhật status thành USED trong DB');
              
              toast.success('✅ Voucher đã được sử dụng thành công!');
              
              // Xóa khỏi sessionStorage sau khi xử lý xong
              sessionStorage.removeItem('selected_voucher_customer_id');
              console.log('🗑️ [VOUCHER UPDATE MOMO] Đã xóa voucher_customer_id khỏi sessionStorage');
            } catch (voucherError) {
              console.error('❌ [VOUCHER UPDATE MOMO] Lỗi cập nhật trạng thái voucher sau khi thanh toán MOMO:', voucherError);
              sessionStorage.removeItem('selected_voucher_customer_id');
            }
          } else if (voucherIdStr && customerIdStr && user?.id) {
            // Fallback: Query lại nếu không có voucher_customer_id
            try {
              const voucherId = Number(voucherIdStr);
              const customerId = Number(customerIdStr);
              console.log(`✨ [VOUCHER UPDATE MOMO] Query voucher_customer_id từ voucher_id=${voucherId} và customer_id=${customerId}`);
              
              // Query voucher_customer_id từ voucher_id và customer_id
              const voucherCustomerId = await voucherApi.getVoucherCustomerIdByVoucherAndCustomer(customerId, voucherId);
              
              if (voucherCustomerId) {
                console.log(`✨ [VOUCHER UPDATE MOMO] Cập nhật voucher_customer_id=${voucherCustomerId} cho user ${user.id} sau khi thanh toán MOMO thành công`);
                
                // Cập nhật status voucher trên server thành USED
                const result = await voucherApi.updateVoucherCustomerStatus(voucherCustomerId);
                console.log('✅ [VOUCHER UPDATE MOMO] Kết quả cập nhật voucher:', result);
                console.log('✅ [VOUCHER UPDATE MOMO] Voucher đã được cập nhật status thành USED trong DB');
                
                toast.success('✅ Voucher đã được sử dụng thành công!');
              } else {
                console.warn('⚠️ [VOUCHER UPDATE MOMO] Không tìm thấy voucher_customer_id');
              }
              
              // Xóa khỏi sessionStorage sau khi xử lý xong
              sessionStorage.removeItem('selected_voucher_id');
              sessionStorage.removeItem('selected_customer_id');
              console.log('🗑️ [VOUCHER UPDATE MOMO] Đã xóa voucher_id và customer_id khỏi sessionStorage');
            } catch (voucherError) {
              console.error('❌ [VOUCHER UPDATE MOMO] Lỗi cập nhật trạng thái voucher sau khi thanh toán MOMO:', voucherError);
              // Vẫn xóa sessionStorage để tránh lặp lại
              sessionStorage.removeItem('selected_voucher_id');
              sessionStorage.removeItem('selected_customer_id');
            }
          } else {
            console.log('ℹ️ [VOUCHER UPDATE MOMO] Không có voucher_id hoặc customer_id trong sessionStorage hoặc user chưa đăng nhập');
          }

          clearCart();
          toast.success('🎉 Thanh toán thành công!');
          window.history.replaceState({}, '', '/orders');
        } catch (err) {
          console.error('❌ Lỗi cập nhật đơn:', err);
          toast.error('Không thể cập nhật trạng thái đơn hàng.');
        }
      })();
    } else if (paymentStatus === 'failed') {
      // Xóa sessionStorage nếu thanh toán thất bại
      sessionStorage.removeItem('momo_order_ids');
      // Voucher đã được cập nhật khi tạo đơn, nhưng nếu thanh toán thất bại thì có thể cần rollback
      // Tạm thời chỉ xóa sessionStorage
      if (sessionStorage.getItem('selected_voucher_customer_id')) {
        sessionStorage.removeItem('selected_voucher_customer_id');
      }
      toast.error('❌ Thanh toán thất bại, vui lòng thử lại!');
      window.history.replaceState({}, '', '/orders');
    }
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = (Array.isArray(orders) ? orders : []).flatMap(o => o.items?.map((i: any) => i.product_id)).filter(Boolean);
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

    if ((Array.isArray(orders) ? orders : []).length > 0) fetchProducts();
  }, [orders]);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true; // Prevent state update if component unmounted

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await orderApi.getOrdersByCustomer(user.id as string, 1, 50);

        if (!isMounted) return; // Component unmounted, don't update state

        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.data || data?.orders || [];
        const seen = new Set();
        const unique = list.filter((o: any) => {
          const id = o?.id ?? o?._id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setOrders(Array.isArray(unique) ? unique : []);
        
        // 🔥 QUAN TRỌNG: Kiểm tra và rollback đơn COD bị cập nhật nhầm mỗi khi load orders
        if (isMounted && list.length > 0) {
          (async () => {
            try {
              console.log('🔄 Kiểm tra đơn COD bị cập nhật nhầm khi load orders page...');
              
              // Lấy danh sách order IDs MOMO từ sessionStorage (nếu có)
              let momoOrderIds: number[] = [];
              const momoOrderIdsStr = sessionStorage.getItem('momo_order_ids');
              if (momoOrderIdsStr) {
                try {
                  const parsed = JSON.parse(momoOrderIdsStr);
                  momoOrderIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
                } catch {
                  // Ignore parse error
                }
              }
              
              // Nếu không có momo_order_ids, tìm tất cả đơn MOMO từ danh sách orders
              if (momoOrderIds.length === 0) {
                momoOrderIds = list
                  .filter((o: any) => {
                    const paymentMethod = o?.payment_method || o?.current_order?.payment_method;
                    return paymentMethod === 'CARD' || paymentMethod === 'MOMO';
                  })
                  .map((o: any) => o.id || o._id)
                  .filter(Boolean);
              }
              
              console.log('🔍 MOMO Order IDs:', momoOrderIds);
              
              // Tìm các order COD đã bị cập nhật nhầm (PAID hoặc CONFIRMED)
              const codOrdersToRollback = list.filter((order: any) => {
                const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
                const paymentStatus = order?.payment_status || order?.current_order?.payment_status;
                const orderStatus = order?.status || order?.current_order?.status;
                const isCOD = paymentMethod === 'ONSITE' || paymentMethod === 'COD';
                const isPaid = paymentStatus === 'PAID';
                const isConfirmed = orderStatus === 'CONFIRMED';
                // Loại trừ các order MOMO
                const orderId = order.id || order._id;
                const isNotMomoOrder = !momoOrderIds.includes(orderId);
                // Rollback nếu đơn COD bị cập nhật nhầm (PAID hoặc CONFIRMED)
                return isCOD && (isPaid || isConfirmed) && isNotMomoOrder;
              });
              
              if (codOrdersToRollback.length > 0) {
                console.log(`⚠️ Phát hiện ${codOrdersToRollback.length} đơn COD đã bị cập nhật nhầm, đang rollback...`, codOrdersToRollback.map((o: any) => ({ id: o.id || o._id, payment_method: o.payment_method, payment_status: o.payment_status })));
                
                // Rollback lại cả status và payment_status cho các order COD
                await Promise.all(
                  codOrdersToRollback.map((order: any) => {
                    const orderId = order.id || order._id;
                    const currentStatus = order?.status || order?.current_order?.status;
                    // Chỉ rollback nếu status là CONFIRMED (đã bị cập nhật nhầm)
                    const shouldRollbackStatus = currentStatus === 'CONFIRMED';
                    
                    return orderApi.updateOrder(orderId, {
                      ...(shouldRollbackStatus && { status: 'CREATED' }), // Rollback status về CREATED nếu bị cập nhật nhầm
                      payment_status: 'UNPAID', // Rollback payment_status về UNPAID
                    }).then(() => {
                      console.log(`✅ Đã rollback đơn COD #${orderId} về CREATED và UNPAID`);
                    }).catch(err => {
                      console.error(`❌ Lỗi rollback đơn COD #${orderId}:`, err);
                    });
                  })
                );
                
                console.log('✅ Đã rollback status và payment_status cho các đơn COD trong orders page');
                
                // Reload orders để hiển thị đúng
                if (isMounted) {
                  window.location.reload();
                }
              } else {
                console.log('✅ Không có đơn COD nào bị cập nhật nhầm trong orders page');
              }
            } catch (rollbackError) {
              console.error('❌ Lỗi khi rollback đơn COD trong orders page:', rollbackError);
            }
          })();
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || 'Không thể tải đơn hàng');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [isAuthenticated, user?.id]);

  const formatPrice = (price: number | string) => {
    const num = Number(price) || 0;
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Hàm tính phí vận chuyển dựa trên transaction data (giống logic admin)
  const getShippingFee = (order: any) => {
    const info = order.current_order || order;
    // Kiểm tra paymentTransactions cả trong current_order và order trực tiếp
    const paymentTransactions = order.paymentTransactions || info?.paymentTransactions || [];
    const mainTxn = paymentTransactions.length > 0 ? paymentTransactions[0] : null;

    // Debug log
    console.log(`Order ${order.id} - Payment Transactions:`, paymentTransactions);
    console.log(`Order ${order.id} - Main Transaction:`, mainTxn);
    console.log(`Order ${order.id} - Total Amount:`, info.total_amount);

    if (mainTxn && mainTxn.amount) {
      const shippingFee = Math.max(0, Number(mainTxn.amount) - Number(info.total_amount));
      console.log(`Order ${order.id} - Calculated Shipping Fee:`, shippingFee);
      return shippingFee > 0 ? shippingFee : 30000;
    }
    console.log(`Order ${order.id} - Using default shipping fee: 30000`);
    return 30000; // Mặc định 30k nếu không có transaction
  };
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) => {
    const normalizedStatus = order.status?.toUpperCase();

    // 1. Lọc theo Tab Trạng thái
    const currentTab = statusTabs.find(tab => tab.key === activeTab);
    const statusMatch = activeTab === 'ALL' || currentTab?.statuses.includes(normalizedStatus);

    if (!statusMatch) return false;

    // 2. Lọc theo Thanh tìm kiếm (ID hoặc Tên sản phẩm)
    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase().trim();
    const orderId = (order.id ?? order._id)?.toString();

    // Check nếu ID khớp
    if (orderId?.includes(query)) return true;

    // Check nếu Tên sản phẩm khớp
    const items = order.current_order?.items || order.items || [];
    const productNameMatch = items.some((item: any) =>
      item.product_name?.toLowerCase().includes(query)
    );

    if (productNameMatch) return true;

    return false;
  });
  const tabCounts = statusTabs.reduce((acc, tab) => {
    const count = (Array.isArray(orders) ? orders : []).filter((order) => {
      const normalizedStatus = order.status?.toUpperCase();

      // 1. Check Status Match (sử dụng tiêu chí của tab hiện tại)
      const statusMatch = tab.key === 'ALL' || tab.statuses.includes(normalizedStatus);
      if (!statusMatch) return false;

      // 2. Check Search Query Match (giữ nguyên logic tìm kiếm)
      if (searchQuery.trim() === "") return true;

      const query = searchQuery.toLowerCase().trim();
      const orderId = (order.id ?? order._id)?.toString();

      if (orderId?.includes(query)) return true;

      const items = order.current_order?.items || order.items || [];
      const productNameMatch = items.some((item: any) =>
        item.product_name?.toLowerCase().includes(query)
      );

      return productNameMatch;
    }).length;

    acc[tab.key] = count;
    return acc;
  }, {} as Record<string, number>);
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return "text-orange-700 bg-orange-100";
      case "confirmed":
        return "bg-indigo-100 text-indigo-700";
      case "shipping":
        return "bg-yellow-100 text-yellow-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      case "rejected":
        return "bg-gray-200 text-gray-700";
      case "exchanged":
        return "bg-purple-100 text-purple-700";
      case "return_requested":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <BaseLayout>
      {isAuthenticated && user?.id && (
        <>
          {/* Voucher Modal */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/10">
              <VoucherModal
                customerId={user.id}
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
              />
            </div>
          )}

          {/* Chat Modal */}
          {isChatOpen && (
            <ChatModal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              userId={Number(user.id)}
              storeId={0}
              conversationId={conversationId} // ✅ truyền id xuống
            />
          )}

          {/* AI Chat Modal */}
          <AIChatModal
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
            userId={Number(user.id)}
          />

          {/* Return Order Modal */}
          {isReturnModalOpen && (
            <ReturnOrderModal
              isOpen={isReturnModalOpen}
              onClose={() => {
                setIsReturnModalOpen(false);
                setReturnOrderId(null);
              }}
              onSubmit={handleReturnSubmit}
              loading={returnLoading}
            />
          )}

          {/* Cancel Order Modal */}
          {isCancelModalOpen && (
            <CancelOrderModal
              isOpen={isCancelModalOpen}
              onClose={() => {
                setIsCancelModalOpen(false);
                setCancelOrderId(null);
              }}
              onSubmit={handleCancelSubmit}
              loading={cancelLoading}
            />
          )}

          {/* Floating Buttons */}
          <div
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${isChatDropdownOpen ? 'right-1' : 'right-1'
              }`}
          >
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              <Gift className="w-6 h-6" />
            </button>

            {/* Chat Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChatDropdownOpen(prev => !prev)}
                className="bg-[#8B7D6B] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                title="Bắt đầu trò chuyện"
              >
                <MessageSquare className="w-6 h-6" />
              </button>

              {isChatDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 flex flex-col gap-3 transition-all duration-300 ease-out transform origin-top-right">
                  {/* Nút Chat với Admin */}
                  <div className="relative group">
                    <button
                      onClick={async () => {
                        if (!isAuthenticated || !user?.id) return;
                        try {
                          const created = await conversationApi.createConversation({
                            sender_id: Number(user.id),
                            sender_type: 'USER',
                            content: '',
                            user_id: Number(user.id),
                            store_id: 1,
                          });
                          const conv = created?.conversation || created?.data || created;
                          setConversationId(conv?.id || null);
                          setIsChatOpen(true);
                          setIsChatDropdownOpen(false);
                        } catch (err) {
                          console.error('❌ Lỗi tạo conversation:', err);
                        }
                      }}
                      className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với Admin"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Nút Chat với AI */}
                  <div className="relative group">
                    <button
                      onClick={() => {
                        setIsAIChatOpen(true); // 2. Mở popup AI chat
                        setIsChatDropdownOpen(false);
                      }}
                      className="bg-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với AI"
                    >
                      <Bot className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 p-4 ml-10 rounded-xl text-gray-500 hover:bg-gray-100 active:scale-95 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="">Trang trước đó</span>
      </button>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F5F1EB] min-h-[80vh]">

        {/* Tiêu đề: Tinh tế, font serif */}
        <h1 className="text-3xl font-serif mb-8 text-[#2C2A24] text-center tracking-wider relative pb-2 border-b border-[#C4975A]/30">
          Lịch sử Đơn hàng
        </h1>
        <div className="bg-white p-4 rounded-xl shadow-lg mb-2 border border-[#E5E2D8]">
          {/* Thanh tìm kiếm */}
          <div className="mb-2">
            {/* Thêm relative để định vị icon bên trong */}
            <div className="relative">
              {/* Icon Search */}
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              {/* Input field */}
              <input
                type="text"
                placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // Thay đổi p-3 thành pl-10 để nhường chỗ cho icon
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#C4975A] focus:border-[#C4975A] transition duration-150"
              />
            </div>
          </div>
          {/* Tabs trạng thái */}
          <div className="flex flex-wrap gap-2 sm:gap-4 pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                px-2 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 flex gap-2
                ${activeTab === tab.key
                    ? 'bg-[#C4975A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {tab.name}
                <span className={`
                    text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full
                    ${activeTab === tab.key ? 'bg-white text-[#C4975A]' : 'bg-gray-100 text-gray-800'}
                `}>
                  {tabCounts[tab.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-10 text-[#65604E] text-sm">Đang tải đơn hàng...</div>}
        {error && <div className="text-center text-red-600 py-10 text-sm border border-red-300 bg-red-50 rounded-lg mx-auto max-w-lg">{error}</div>}

        {!loading && !error && (


          filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-md border border-[#E5E2D8]">
              <p className="text-base mb-4">
                {orders.length === 0
                  ? 'Bạn chưa có đơn hàng nào.'
                  : 'Không tìm thấy đơn hàng nào khớp với tiêu chí tìm kiếm/lọc.'
                }
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 text-sm bg-[#C4975A] text-white font-medium rounded-full shadow-md hover:bg-[#a97e4a] transition-all"
              >
                Khám phá Sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const id = order.id ?? order._id;
                const info = order.current_order || order;
                const items = info.items || [];
                const isProcessing = processingOrderId === id;
                console.log(`Order ID: ${id}, Status: ${order.status}`);
                return (
                  <div
                    key={id}
                    className={`bg-white rounded-xl border border-[#E5E2D8] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${isProcessing ? 'opacity-75 pointer-events-none' : ''
                      }`}
                  >

                    {/* Header */}
                    <div className="flex justify-between items-center px-5 py-3 border-b border-[#E5E2D8]">
                      <div>
                        <div className="font-semibold text-base text-[#2C2A24] ">
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
                          ({translatePaymentStatus(order.payment_status)})
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
                            {(item.attribute1_name || item.attribute2_name) && (
                              <div className="text-xs text-[#A38D64] font-semibold mt-0.5">
                                Phân loại:
                                {item.attribute1_name && (
                                  <span> {item.attribute1_name}</span>
                                )}
                                {item.attribute2_name && (
                                  <span>{item.attribute1_name ? ' - ' : ''}{item.attribute2_name}</span>
                                )}
                              </div>
                            )}
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
                    <div className="flex justify-between items-center px-5 py-3 border-[#E5E2D8]">

                      <div className='text-left'>
                        <div className="text-sm text-gray-600">
                          Thanh toán: <span className="font-semibold text-[#2C2A24]">{translatePaymentMethod(info.payment_method)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Phí vận chuyển: <span className="font-semibold text-[#2C2A24]">{formatPrice(getShippingFee(order))}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="text-sm font-semibold  text-gray-600">Tổng tiền hàng: <span>{formatPrice(info.total_amount)}</span></div>
                          <div className="text-sm font-semibold  text-gray-600">Tổng thanh toán: <span className="font-bold text-[#A38D64]">{formatPrice(info.total_amount + getShippingFee(order))}</span></div>
                        </div>
                      </div>

                    </div>
                    <div className="flex justify-end items-center p-5 bg-white border-t border-[#E5E2D8] gap-4">
                      {['CREATED', 'PENDING', 'CONFIRMED', 'SHIPPING'].includes(order.status?.toUpperCase()) && (
                        <button
                          onClick={() => handleCancelOrder(id)}
                          disabled={isProcessing}
                          className={`px-6 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {isProcessing && cancelLoading && (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {isProcessing && cancelLoading ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </button>
                      )}
                      {(() => {
                        const isDelivered = order.status?.toUpperCase() === 'DELIVERED';

                        // Lấy ngày giao hàng (tùy API bạn)
                        const deliveredAt = order.delivery_date || order.delivered_at || order.updated_at;

                        if (!deliveredAt) return null;

                        const diffDays =
                          (new Date().getTime() - new Date(deliveredAt).getTime()) /
                          (1000 * 60 * 60 * 24);

                        const within7Days = diffDays <= 7;

                        return isDelivered && within7Days ? (
                          <button
                            onClick={() => handleReturnOrder(id)}
                            disabled={isProcessing}
                            className={`px-6 py-2 cursor-pointer text-sm font-semibold border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-md flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            {isProcessing && returnLoading && (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {isProcessing && returnLoading ? 'Đang xử lý...' : 'Đổi trả đơn hàng'}
                          </button>
                        ) : null;
                      })()}
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
    </BaseLayout >
  );
}