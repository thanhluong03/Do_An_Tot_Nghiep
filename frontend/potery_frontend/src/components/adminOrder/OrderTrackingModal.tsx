'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import TrackingMap from '../map/TrackingMap';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { trackingApi } from '../../api/services/trackingService';

interface OrderTrackingModalProps {
  orderId: number;
  orderStatus: string;
  customerAddress?: string;
  onClose: () => void;
}

export default function OrderTrackingModal({
  orderId,
  orderStatus,
  customerAddress,
  onClose,
}: OrderTrackingModalProps) {
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [routeData, setRouteData] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrackingData();
  }, [orderId]);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      const tracking = await trackingApi.getOrderTracking(orderId);
      setTrackingData(tracking);

      // If both driver and customer coordinates exist, get route
      const dLat = tracking.driver_location?.latitude ?? tracking.driver_start_coordinates?.latitude;
      const dLon = tracking.driver_location?.longitude ?? tracking.driver_start_coordinates?.longitude;
      if (dLat != null && dLon != null && tracking.customer_coordinates) {
        const route = await trackingApi.getRoute(
          dLat,
          dLon,
          tracking.customer_coordinates.latitude,
          tracking.customer_coordinates.longitude,
        );
        if (route && route.coordinates) {
          setRouteData(route.coordinates);
        }
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tracking data:', err);
      setError(err?.message || 'Không thể tải dữ liệu tracking');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for real-time tracking
  const { lastLocation } = useTrackingSocket(
    {
      orderId,
      userType: 'admin',
      enabled: ['SHIPPING', 'CONFIRMED'].includes(orderStatus),
    },
    {
      onLocationUpdate: (data) => {
        console.log('Location update received:', data);
        // Update tracking data when new location is received
        setTrackingData((prev: any) => ({
          ...prev,
          driver_location: {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
          },
        }));

        // Refresh route if customer coordinates exist
        if ((trackingData?.customer_coordinates) || (lastLocation && trackingData?.customer_coordinates)) {
          setTimeout(async () => {
            const route = await trackingApi.getRoute(
              data.latitude,
              data.longitude,
              trackingData.customer_coordinates.latitude,
              trackingData.customer_coordinates.longitude,
            );
            if (route && route.coordinates) {
              setRouteData(route.coordinates);
            }
          }, 500);
        }
      },
    },
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/20 z-[1000] flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-100">
          <div className="p-8 text-center">
            <p className="text-gray-600">Đang tải dữ liệu tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-[1000] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Theo dõi đơn hàng #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : trackingData ? (
            <>
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Thông tin đơn hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Trạng thái: </span>
                      <span
                        className={`font-semibold ${
                          orderStatus === 'DELIVERED'
                            ? 'text-green-600'
                            : orderStatus === 'SHIPPING'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {orderStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Địa chỉ giao hàng: </span>
                      <span className="font-medium">{customerAddress || trackingData.shipping_address}</span>
                    </div>
                  </div>
                </div>

                {trackingData.driver_location && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2">Vị trí tài xế</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Vĩ độ: </span>
                        <span className="font-medium">{trackingData.driver_location.latitude}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kinh độ: </span>
                        <span className="font-medium">{trackingData.driver_location.longitude}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cập nhật: </span>
                        <span className="font-medium">
                          {new Date(trackingData.driver_location.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map */}
              {trackingData.driver_location || trackingData.driver_start_coordinates || trackingData.customer_coordinates ? (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Bản đồ tracking</h3>
                  <TrackingMap
                    driverLat={trackingData.driver_location?.latitude ?? trackingData.driver_start_coordinates?.latitude}
                    driverLon={trackingData.driver_location?.longitude ?? trackingData.driver_start_coordinates?.longitude}
                    customerLat={trackingData.customer_coordinates?.latitude}
                    customerLon={trackingData.customer_coordinates?.longitude}
                    routeCoordinates={routeData}
                    driverName="Tài xế"
                    customerName="Khách hàng"
                    orderStatus={orderStatus}
                    height="500px"
                  />
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  Chưa có dữ liệu vị trí để hiển thị bản đồ
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-600">
              Không có dữ liệu tracking
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

