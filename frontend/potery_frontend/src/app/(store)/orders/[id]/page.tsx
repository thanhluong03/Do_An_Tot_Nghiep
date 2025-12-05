'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../../layouts';
import { orderApi } from '../../../../api/modules/orders';
import { reviewsApi } from '../../../../api/modules/reviews';
import Image from 'next/image';
import { formatPrice } from '../../../../utils/format';
import { Bot, Gift, MessageSquare, Star, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTrackingSocket } from '../../../../hooks/useTrackingSocket';
import { trackingApi } from '../../../../api/services/trackingService';
import { useAuth } from '@/contexts/AuthContext';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, AIChatModal } from '@/components/feature';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
// Trạng thái đơn hàng: dịch sang tiếng Việt
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
// Dynamic import for TrackingMap to avoid SSR issues
const TrackingMap = dynamic(() => import('../../../../components/map/TrackingMap'), {
  ssr: false,
});

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function OrderDetailPage({ params }: PageProps) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if ('then' in params) {
        const resolved = await params;
        setResolvedId(resolved.id);
      } else {
        setResolvedId(params.id);
      }
    })();
  }, [params]);

  if (!resolvedId)
    return (
      <BaseLayout>
        <div className="text-center py-12 text-gray-600">Đang tải dữ liệu...</div>
      </BaseLayout>
    );

  return <OrderDetailClient id={resolvedId} />;
}

function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  // review state
  const [reviewedProducts, setReviewedProducts] = useState<number[]>([]);
  const [showReviewInput, setShowReviewInput] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const Star = ({ filled, size = 20 }: { filled: boolean; size?: number }) => {
    const fillColor = filled ? '#ffdc7bff' : 'transparent';
    const strokeColor = '#ffdc7bff';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ display: 'inline-block', verticalAlign: 'middle', cursor: 'pointer' }}
      >
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // tracking state
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [routeData, setRouteData] = useState<Array<[number, number]>>([]);
  const [showMap, setShowMap] = useState(false);
  // trạng thái hiển thị lịch sử trạng thái
  const [showStatusHistory, setShowStatusHistory] = useState(false);

  // ---------------- Fetch order detail ----------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrderDetail(id);
        const data = res?.data || res;

        setOrder(data);

        // load danh sách reviewed - fallback về product_id nếu không có orderitem_id
        if (data?.current_order?.items?.length) {
          const reviewed: number[] = [];

          for (const item of data.current_order.items) {
            const orderItemId = resolveOrderItemId(item);
            const reviews = await reviewsApi.list(item.product_id);

            // Kiểm tra có review nào cho orderitem_id này và customer_id này không
            const hasReviewed = reviews?.some((r) => {
              const customerMatch = String(r.customer_id) === String(data.customer_id);
              // Nếu có orderitem_id thì ưu tiên kiểm tra theo đó, không thì fallback về product_id
              const itemMatch = orderItemId && r.orderitem_id
                ? String(r.orderitem_id) === String(orderItemId)
                : true; // Fallback: chỉ cần customer match

              return customerMatch && itemMatch;
            });

            if (hasReviewed) {
              const checkId = orderItemId || item.product_id;
              reviewed.push(checkId);
            }
          }
          setReviewedProducts(reviewed);
        }

        // Load tracking data
        try {
          const { trackingApi } = await import('../../../../api/services/trackingService');
          const tracking = await trackingApi.getOrderTracking(parseInt(id));
          setTrackingData(tracking);

          // If both driver and customer coordinates exist, get route
          if (
            tracking.driver_location &&
            tracking.customer_coordinates
          ) {
            const route = await trackingApi.getRoute(
              tracking.driver_location.latitude,
              tracking.driver_location.longitude,
              tracking.customer_coordinates.latitude,
              tracking.customer_coordinates.longitude,
            );
            if (route && route.coordinates) {
              setRouteData(route.coordinates);
            }
          }
        } catch (trackingError) {
          console.error('Failed to load tracking data:', trackingError);
        }
      } catch (e: any) {
        setError(e?.message || 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // WebSocket for real-time tracking - only for shipping orders
  const { lastLocation } = useTrackingSocket(
    {
      orderId: parseInt(id),
      userType: 'customer',
      enabled: !!order && ['SHIPPING', 'CONFIRMED'].includes(order.status),
    },
    {
      onLocationUpdate: (data) => {
        console.log('🔔 Real-time location update:', data);
        // Update tracking data when new location is received
        setTrackingData((prev: any) => ({
          ...prev,
          driver_location: {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
          },
        }));

        // Update route if both points exist
        if (trackingData?.customer_coordinates) {
          trackingApi.getRoute(
            data.latitude,
            data.longitude,
            trackingData.customer_coordinates.latitude,
            trackingData.customer_coordinates.longitude,
          ).then(route => {
            if (route?.coordinates) {
              setRouteData(route.coordinates);
            }
          });
        }
      },
    },
  );

  // ---------------- Helper ----------------
  // Hàm lấy phí vận chuyển từ order items
  const getShippingFee = () => {
    // Tính tổng shipping fee từ các order items
    return items.reduce((sum: number, item: any) => {
      const itemShippingFee = item.shipping_fee ? Number(item.shipping_fee) : 0;
      return sum + itemShippingFee;
    }, 0) || 0;
  };

  // Hàm lấy shipping messages từ order items
  const getShippingMessages = () => {
    const messages = items
      .map((item: any) => item.shipping_message)
      .filter((msg: string) => msg && msg.trim() !== '');
    return messages.length > 0 ? messages : null;
  };

  // Đồng bộ màu trạng thái với danh sách đơn hàng
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
      case "cancelled_return":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ---------------- resolveOrderItemId ----------------
  function resolveOrderItemId(it: any) {
    // nếu có sẵn id thì dùng luôn
    if (it.orderitem_id || it.order_item_id || it.id)
      return it.orderitem_id ?? it.order_item_id ?? it.id;

    // thử lấy trong current_order.items vì backend không có order_items riêng
    const allItems = order?.current_order?.items ?? [];

    const found = allItems.find(
      (oi: any) =>
        String(oi.product_id) === String(it.product_id) &&
        Number(oi.store_id) === Number(it.store_id)
    );

    if (found) {
      return found.id ?? found.orderitem_id ?? found.order_item_id ?? null;
    }

    console.warn('❌ Không tìm thấy orderitem_id cho sản phẩm:', it);
    return null;
  }

  // ---------------- UI render ----------------
  const router = useRouter();

  if (loading)
    return (
      <BaseLayout>
        <div className="text-center py-12 text-gray-600">Đang tải đơn hàng...</div>
      </BaseLayout>
    );

  if (error)
    return (
      <BaseLayout>
        <div className="text-center py-12 text-red-600">{error}</div>
      </BaseLayout>
    );

  if (!order) return null;

  const current = order.current_order || {};
  const items = current.items || [];
  const statusHistory = order.statusHistory || [];
  const paymentTransactions = order?.paymentTransactions || [];
  const mainTxn = paymentTransactions.length > 0 ? paymentTransactions[0] : null;

  return (
    <BaseLayout>
      {/* Nút quay lại */}
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center gap-2 p-3 ml-2 mb-4 rounded-xl text-gray-500 hover:bg-gray-100 active:scale-95 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Trang trước đó</span>
      </button>
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
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 bg-[#F5F1EB] min-h-[80vh]">
        <h1 className="text-3xl font-serif mb-8 text-[#2C2A24] text-center tracking-wider relative pb-2 border-b border-[#C4975A]/30">Chi tiết đơn hàng #{order.id}</h1>
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10 justify-center items-start">
          {/* Sản phẩm bên trái chiếm nhiều hơn */}
          <div className="lg:w-8/12 w-full">
            <div className="bg-white rounded-xl border border-[#E5E2D8] shadow-lg p-4">
              <h2 className="text-xl font-bold text-[#A38D64] mb-1 text-center">Sản phẩm</h2>
              <div className="divide-y">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="py-4 border-b last:border-none">
                    <div className="flex gap-6 items-center">
                      <Image
                        src={
                          it?.product_images?.[0]?.image_data
                            ? `data:image/avif;base64,${it.product_images[0].image_data}`
                            : it?.image
                              ? it.image
                              : '/no-image.png'
                        }
                        alt={it.product_name || 'Sản phẩm'}
                        width={110}
                        height={110}
                        unoptimized
                        className="rounded-lg border object-cover w-28 h-28 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base text-[#2C2A24] leading-snug truncate mb-1">{it.product_name}</div>
                        {(it.attribute1_name || it.attribute2_name) && (
                          <div className="text-xs text-[#A38D64] font-semibold mb-1">
                            Phân loại:
                            {it.attribute1_name && (
                              <span> {it.attribute1_name}</span>
                            )}
                            {it.attribute2_name && (
                              <span>{it.attribute1_name ? ' - ' : ''}{it.attribute2_name}</span>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 mb-1">
                          Cửa hàng: <span className="font-semibold">{it.store_name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">Địa chỉ: {it.store_address}</div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Số lượng: <span className="font-semibold">{it.quantity}</span></span>
                          <span className="text-base font-bold text-[#2C2A24]">{formatPrice(it.price_at_order)}</span>
                        </div>
                        <div className="text-sm text-[#A38D64] font-semibold mb-1 text-right">Tổng: {formatPrice(it.price_at_order * it.quantity)}</div>
                      </div>
                    </div>

                    {/* review UI - only when order is DELIVERED */}
                    {String(order?.status).toUpperCase() === 'DELIVERED' && (
                      <div className="mt-4">
                        {(() => {
                          const orderItemId = resolveOrderItemId(it);
                          const checkId = orderItemId || it.product_id; // Fallback về product_id
                          const isReviewed = reviewedProducts.includes(checkId);
                          return !isReviewed;
                        })() ? (
                          showReviewInput === (resolveOrderItemId(it) || it.product_id) ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} onClick={() => setRating(star)}>
                                    <Star filled={star <= rating} size={20} />
                                  </span>
                                ))}
                              </div>
                              <textarea
                                placeholder="Nhập nhận xét của bạn..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm"
                              />
                              <div>
                                <label className="block font-medium mb-1">Chọn ảnh (có thể chọn nhiều):</label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={e => {
                                    const files = Array.from(e.target.files || []);
                                    setImages(files);
                                    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
                                  }}
                                />
                              </div>
                              {previewUrls.length > 0 && (
                                <div className="flex space-x-2 mt-2">
                                  {previewUrls.map((url, idx) => (
                                    <Image
                                      key={idx}
                                      src={url}
                                      alt={`preview-${idx}`}
                                      width={80}
                                      height={80}
                                      className="rounded-lg object-cover border"
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={async () => {
                                    try {
                                      const orderitem_id = resolveOrderItemId(it);
                                      if (!orderitem_id) {
                                        alert('Không tìm thấy orderitem_id cho sản phẩm này.');
                                        return;
                                      }
                                      const formData = new FormData();
                                      formData.append('orderitem_id', String(orderitem_id));
                                      formData.append('customer_id', String(order.customer_id));
                                      formData.append('rating', String(rating || 5));
                                      formData.append('comment', String(comment ?? ''));
                                      images.forEach((file) => {
                                        formData.append('images', file);
                                      });
                                      await reviewsApi.create(formData);
                                      alert('Đánh giá thành công!');
                                      setReviewedProducts((prev) => [...prev, orderitem_id || it.product_id]);
                                      setShowReviewInput(null);
                                      setRating(0);
                                      setComment('');
                                      setImages([]);
                                      setPreviewUrls([]);
                                    } catch {
                                      alert('Không thể gửi đánh giá.');
                                    }
                                  }}
                                  className="bg-[#A38D64] text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Gửi đánh giá
                                </button>
                                <button
                                  onClick={() => setShowReviewInput(null)}
                                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => setShowReviewInput(resolveOrderItemId(it) || it.product_id)}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                              >
                                Đánh giá sản phẩm
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="mt-2 text-sm text-green-600 font-medium">
                            ✅ Bạn đã đánh giá sản phẩm này
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Thông tin đơn hàng bên phải: gộp vào một card */}
          <div className="lg:w-5/12 xl:w-4/12 w-full flex flex-col items-start min-w-[340px]">
            <div className="bg-white rounded-xl border border-[#E5E2D8] shadow-lg p-4 flex flex-col gap-6 min-w-[320px]">
              {/* status */}
              <div>
                <div className="flex justify-between items-center mb-3 whitespace-nowrap">
                  <div className="text-gray-900 font-bold text-[17px]">Đơn hàng</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-[15px] font-bold shadow border ${getStatusColor(order.status)} whitespace-nowrap`}>
                    {translateStatus(order.status)}
                  </div>
                </div>

                <div className="text-[15px]">Trạng thái: <span className="font-bold text-gray-900">{translatePaymentStatus(order.payment_status)}</span></div>
                <div className="text-gray-500 text-[14px] font-medium">
                  Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
                  {mainTxn && (
                    <div className="text-[14px] text-gray-500">Thời gian thanh toán: {new Date(mainTxn.txn_time).toLocaleString('vi-VN')}</div>
                  )}
                  {order.note && (
                    <div className="text-gray-800 text-[15px] font-medium mt-2">
                      <span className="text-[16px] font-bold text-[#A38D64]">Ghi chú:</span>
                      <span className="block">{order.note}</span>
                    </div>
                  )}
                </div>
                {/* status history toggle */}
                {statusHistory.length > 0 && (
                  <div>
                    <button
                      className="text-sm font-bold text-[#A38D64] mt-4 underline hover:text-[#C4975A]"
                      onClick={() => setShowStatusHistory((prev) => !prev)}
                    >
                      Lịch sử trạng thái
                    </button>
                    {showStatusHistory && (
                      <div className="space-y-4 mt-2">
                        {statusHistory.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow" />
                            <div className="text-gray-700 text-xs">
                              <span className="font-bold text-green-700">{translateStatus(s.status)}</span>
                              {s.actor?.name && (
                                <span className="ml-2 text-gray-500">(bởi <span className="font-semibold">{s.actor.name}</span>)</span>
                              )}
                              {' '}— {new Date(s.created_at).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* shipping */}
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-[16px] font-bold text-[#A38D64]">Địa chỉ giao hàng</h2>
                  {(trackingData?.driver_location || trackingData?.driver_start_coordinates) && trackingData?.customer_coordinates && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="text-sm text-blue-700 font-semibold px-3 py-1 rounded-lg border border-blue-100 hover:bg-blue-50 transition"
                    >
                      {showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}
                    </button>
                  )}
                </div>
                <div className="text-gray-800 text-[15px] font-medium mb-2">{order.shipping_address || 'Chưa có địa chỉ'}</div>
                {/* Tracking Map */}
                {showMap && trackingData && (
                  <div className="mt-4">
                    <TrackingMap
                      driverLat={trackingData.driver_location?.latitude ?? trackingData.driver_start_coordinates?.latitude}
                      driverLon={trackingData.driver_location?.longitude ?? trackingData.driver_start_coordinates?.longitude}
                      customerLat={trackingData.customer_coordinates?.latitude}
                      customerLon={trackingData.customer_coordinates?.longitude}
                      routeCoordinates={routeData}
                      driverName="Tài xế"
                      customerName="Khách hàng"
                      orderStatus={order.status}
                      height="400px"
                    />
                    {(trackingData.driver_location || trackingData.driver_start_coordinates) && (
                      <div className="text-[14px] text-gray-500 mt-2">
                        {trackingData.driver_location
                          ? `Cập nhật lần cuối: ${new Date(trackingData.driver_location.timestamp).toLocaleString('vi-VN')}`
                          : `Điểm xuất phát (từ địa chỉ tài xế): ${trackingData.driver_start_coordinates?.display_name ?? ''}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {['CANCELLED', 'CANCELLED_RETURN'].includes(order.status) && order.cancel_reason && (

                <p className="text-sm font-semibold text-gray-500">
                  Lý do hủy: <span className="font-normal text-gray-500">{order.cancel_reason}</span>
                </p>
                    
              )}
              {['CANCELLED', 'CANCELLED_RETURN'].includes(order.status) && order.person_cancel && (

                <p className="text-sm font-semibold text-gray-500">
                  Người hủy: <span className="font-normal text-gray-500">{order.person_cancel}</span>
                </p>
                    
              )}
              {['DELIVERY_FAILED'].includes(order.status) && order.delivery_fail_reason && (

                <p className="text-sm font-semibold text-gray-500">
                  Lý do giao thất bại: <span className="font-normal text-gray-500">{order.delivery_fail_reason}</span>
                </p>
              )}
              {['DELIVERY_FAILED_RETURN'].includes(order.status) && order.delivery_fail_return_reason && (

                <p className="text-sm font-semibold text-gray-500">
                  Lý do giao thất bại: <span className="font-normal text-gray-500">{order.delivery_fail_return_reason}</span>
                </p>

              )}
              {/* payment */}
              <div>
                <h2 className="text-[16px] font-bold text-[#A38D64] mb-2">Thanh toán</h2>
                <div className="text-gray-700 space-y-2 text-[15px]">
                  {mainTxn && (
                    <span className="text-[15px] text-gray-900 mb-2 block">Mã giao dịch: <span className="font-semibold">{mainTxn.gateway_txn_ref}</span></span>
                  )}
                  <div>Phương thức: <span className="text-[15px] text-gray-900">{
                    order.payment_method === 'ONSITE'
                      ? 'Thanh toán khi nhận hàng (COD)'
                      : order.payment_method === 'CARD'
                        ? 'Thanh toán MoMo'
                        : order.payment_method
                  }</span></div>
                  {mainTxn && mainTxn.txn_status && (
                    <div className="text-[15px] text-gray-900 mb-2 flex items-center gap-2">
                      <span>Trạng thái giao dịch:</span>
                      <span className={`font-semibold ${mainTxn.txn_status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'}`}>
                        {mainTxn.txn_status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </div>
                  )}
                  <div>Tổng tiền hàng: <span className="font-bold">{formatPrice(order.total_amount)}</span></div>
                  <div>
                    Phí vận chuyển: <span className="font-bold">{formatPrice(getShippingFee())}</span>
                    {getShippingMessages() && getShippingMessages()!.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1 pl-2">
                        {getShippingMessages()!.map((msg: string, index: number) => (
                          <div key={index}>• {msg}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-[16px] text-[#A38D64]">
                    Tổng thanh toán: {formatPrice(Number(order.total_amount || 0) + getShippingFee())}
                    {mainTxn && (
                      <div className="font-bold text-[16px] text-[#A38D64] mt-1">Số tiền đã thanh toán: <span className="font-semibold">{Number(mainTxn.amount).toLocaleString('vi-VN')} đ</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
