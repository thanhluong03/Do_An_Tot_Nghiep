'use client';

import React, { useEffect, useState } from 'react';
import { DriverLayout } from '@/layouts/DriverLayout';
import dynamic from 'next/dynamic';
import { useTrackingSocket } from '@/hooks/useTrackingSocket';
import { trackingApi } from '@/api/services/trackingService';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation } from 'lucide-react';

// Dynamic import for TrackingMap
const TrackingMap = dynamic(() => import('@/components/map/TrackingMap'), {
  ssr: false,
});

interface PageProps {
  params: Promise<{ orderId: string }> | { orderId: string };
}

export default function DriverTrackingPage({ params }: PageProps) {
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if ('then' in params) {
        const resolved = await params;
        setResolvedOrderId(resolved.orderId);
      } else {
        setResolvedOrderId(params.orderId);
      }
    })();
  }, [params]);

  if (!resolvedOrderId) {
    return (
      <DriverLayout>
        <div className="text-center py-12">Đang tải...</div>
      </DriverLayout>
    );
  }

  return <DriverTrackingContent orderId={resolvedOrderId} />;
}

function DriverTrackingContent({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [routeData, setRouteData] = useState<Array<[number, number]>>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);

  // Read driver id from admin login context (stored in localStorage)
  const driverId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('adminID') || 0)
    : 0;

  // Load initial tracking data
  useEffect(() => {
    const loadData = async () => {
      try {
        const tracking = await trackingApi.getOrderTracking(parseInt(orderId));
        setTrackingData(tracking);

        if (tracking.driver_location && tracking.customer_coordinates) {
          const route = await trackingApi.getRoute(
            tracking.driver_location.latitude,
            tracking.driver_location.longitude,
            tracking.customer_coordinates.latitude,
            tracking.customer_coordinates.longitude,
          );
          if (route?.coordinates) {
            setRouteData(route.coordinates);
          }
        }
      } catch (err) {
        console.error('Failed to load tracking data:', err);
        setError('Không thể tải dữ liệu tracking');
      }
    };

    loadData();
  }, [orderId]);

  // Connect to WebSocket for real-time tracking
  const { sendLocationUpdate } = useTrackingSocket(
    {
      orderId: parseInt(orderId),
      driverId: driverId || 0,
      userType: 'driver',
      enabled: !!driverId,
    },
    {
      onConnect: () => {
        console.log('✅ Connected to tracking server');
      },
    },
  );

  // Auto-update location every 10 seconds
  useEffect(() => {
    if (!driverId || !sendLocationUpdate) return;

    const interval = setInterval(() => {
      updateLocation();
    }, 10000); // Update every 10 seconds

    // Update once immediately
    updateLocation();

    return () => clearInterval(interval);
  }, [driverId, orderId]);

  const updateLocation = () => {
    if (!navigator.geolocation || !driverId || !sendLocationUpdate) {
      setPositionError('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Send to WebSocket
          sendLocationUpdate(
            driverId,
            parseInt(orderId),
            latitude,
            longitude,
          );

          // Update local state
          setTrackingData((prev: any) => ({
            ...prev,
            driver_location: {
              latitude,
              longitude,
              timestamp: new Date(),
            },
          }));

          // Update route
          if (trackingData?.customer_coordinates) {
            const route = await trackingApi.getRoute(
              latitude,
              longitude,
              trackingData.customer_coordinates.latitude,
              trackingData.customer_coordinates.longitude,
            );
            if (route?.coordinates) {
              setRouteData(route.coordinates);
            }
          }

          setPositionError(null);
        } catch (err) {
          console.error('Failed to update location:', err);
        } finally {
          setIsUpdating(false);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setPositionError('Không thể lấy vị trí. Vui lòng kiểm tra cài đặt bảo mật.');
        setIsUpdating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (error) {
    return (
      <DriverLayout>
        <div className="text-center py-12 text-red-600">{error}</div>
      </DriverLayout>
    );
  }

  if (!trackingData) {
    return (
      <DriverLayout>
        <div className="text-center py-12">Đang tải dữ liệu...</div>
      </DriverLayout>
    );
  }

  const driverLat = trackingData.driver_location?.latitude ?? trackingData.driver_start_coordinates?.latitude;
  const driverLon = trackingData.driver_location?.longitude ?? trackingData.driver_start_coordinates?.longitude;

  return (
    <DriverLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Tracking Đơn hàng #{orderId}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {trackingData.customer_coordinates?.display_name || 'Điểm đến'}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {isUpdating ? 'Đang cập nhật vị trí...' : 'Vị trí đã cập nhật'}
                </p>
                <p className="text-sm text-gray-500">
                  {trackingData.driver_location?.timestamp
                    ? `Lần cuối: ${new Date(trackingData.driver_location.timestamp).toLocaleString('vi-VN')}`
                    : trackingData.driver_start_coordinates?.display_name
                      ? `Điểm xuất phát: ${trackingData.driver_start_coordinates.display_name}`
                      : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            {positionError && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg max-w-xs">
                {positionError}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {(driverLat && driverLon && trackingData.customer_coordinates) && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <TrackingMap
              driverLat={driverLat}
              driverLon={driverLon}
              customerLat={trackingData.customer_coordinates.latitude}
              customerLon={trackingData.customer_coordinates.longitude}
              routeCoordinates={routeData}
              driverName="Vị trí của bạn"
              customerName="Điểm giao hàng"
              orderStatus={trackingData.order_status}
              height="500px"
            />
          </div>
        )}
      </div>
    </DriverLayout>
  );
}


