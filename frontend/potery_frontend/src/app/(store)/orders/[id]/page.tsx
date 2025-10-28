'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../../layouts';
import { orderApi } from '../../../../api/modules/orders';
import { reviewsApi } from '../../../../api/modules/reviews';
import Image from 'next/image';
import { formatPrice } from '../../../../utils/format';
import { Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTrackingSocket } from '../../../../hooks/useTrackingSocket';
import { trackingApi } from '../../../../api/services/trackingService';

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

  // review state
  const [reviewedProducts, setReviewedProducts] = useState<number[]>([]);
  const [showReviewInput, setShowReviewInput] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // tracking state
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [routeData, setRouteData] = useState<Array<[number, number]>>([]);
  const [showMap, setShowMap] = useState(false);

  // ---------------- Fetch order detail ----------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrderDetail(id);
        const data = res?.data || res;

        // Ghi log xem cấu trúc thực tế
        console.log('🧩 Order detail loaded:', data);
        console.log('🧩 Order items (backend):', data?.current_order?.order_items);
        console.log('🧩 Items hiển thị:', data?.current_order?.items);

        setOrder(data);

        // load danh sách reviewed
        if (data?.current_order?.items?.length) {
          const productIds = data.current_order.items.map((it: any) => it.product_id);
          const reviewed: number[] = [];

          for (const pid of productIds) {
            const reviews = await reviewsApi.list(pid);
            if (reviews?.some((r) => String(r.customer_id) === String(data.customer_id))) {
              reviewed.push(pid);
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
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
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

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-[#2C2A24] mb-2">
          Chi tiết đơn hàng #{order.id}
        </h1>

        {/* status */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-700 font-medium">Trạng thái đơn hàng:</div>
              <div
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </div>
            </div>
            <div className="text-right text-gray-600 text-sm">
              Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* shipping */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
            {trackingData?.driver_location && trackingData?.customer_coordinates && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}
              </button>
            )}
          </div>
          <div className="text-gray-700">{order.shipping_address || 'Chưa có địa chỉ'}</div>
          
          {/* Tracking Map */}
          {showMap && trackingData && (
            <div className="mt-4">
              <TrackingMap
                driverLat={trackingData.driver_location?.latitude}
                driverLon={trackingData.driver_location?.longitude}
                customerLat={trackingData.customer_coordinates?.latitude}
                customerLon={trackingData.customer_coordinates?.longitude}
                routeCoordinates={routeData}
                driverName="Tài xế"
                customerName="Khách hàng"
                orderStatus={order.status}
                height="400px"
              />
              {trackingData.driver_location && (
                <div className="text-xs text-gray-500 mt-2">
                  Cập nhật lần cuối: {new Date(trackingData.driver_location.timestamp).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* payment */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Thanh toán</h2>
          <div className="text-gray-700">
            <div>Phương thức: {order.payment_method}</div>
            <div>Trạng thái: {order.payment_status}</div>
            <div>Tổng tiền: {formatPrice(order.total_amount)}</div>
          </div>
        </div>

        {/* items */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="divide-y">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="py-4 border-b last:border-none">
                <div className="flex justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={
                        it?.product_images?.[0]?.image_data
                          ? `data:image/avif;base64,${it.product_images[0].image_data}`
                          : it?.image
                          ? it.image
                          : '/no-image.png'
                      }
                      alt={it.product_name || 'Sản phẩm'}
                      width={96}
                      height={96}
                      unoptimized
                      className="rounded-lg border object-cover w-24 h-24"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{it.product_name}</div>
                      <div className="text-sm text-gray-500">{it.description}</div>
                      <div className="text-sm text-gray-600">
                        Cửa hàng: <span className="font-medium">{it.store_name}</span>
                      </div>
                      <div className="text-sm text-gray-500">Địa chỉ: {it.store_address}</div>
                      <div className="text-sm text-gray-600">Số lượng: {it.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-gray-800">
                    {formatPrice(it.price_at_order * it.quantity)}
                  </div>
                </div>

                {/* review UI */}
                <div className="mt-3 ml-28">
                  {!reviewedProducts.includes(it.product_id) ? (
                    showReviewInput === it.product_id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              onClick={() => setRating(star)}
                              className={`w-5 h-5 cursor-pointer ${
                                star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <textarea
                          placeholder="Nhập nhận xét của bạn..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const orderitem_id = resolveOrderItemId(it);
                                if (!orderitem_id) {
                                  alert('Không tìm thấy orderitem_id cho sản phẩm này.');
                                  console.error('❌ Không tìm thấy orderitem_id:', it);
                                  return;
                                }

                                const payload = [
                                  {
                                    orderitem_id: Number(orderitem_id),
                                    customer_id: Number(order.customer_id),
                                    rating: Number(rating || 5),
                                    comment: String(comment ?? ''),
                                  },
                                ];

                                console.log('📦 Gửi review payload:', payload);
                                await reviewsApi.create(payload);

                                alert('Đánh giá thành công!');
                                setReviewedProducts((prev) => [...prev, it.product_id]);
                                setShowReviewInput(null);
                                setRating(0);
                                setComment('');
                              } catch (err) {
                                console.error('Gửi đánh giá lỗi:', err);
                                alert('Không thể gửi đánh giá. Xem console để biết chi tiết.');
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
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
                      <button
                        onClick={() => setShowReviewInput(it.product_id)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Đánh giá sản phẩm
                      </button>
                    )
                  ) : (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      ✅ Bạn đã đánh giá sản phẩm này
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* status history */}
        {statusHistory.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Lịch sử trạng thái</h2>
            <div className="space-y-2">
              {statusHistory.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="text-gray-700 text-sm">
                    <span className="font-medium">{s.status}</span> —{' '}
                    {new Date(s.changed_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
