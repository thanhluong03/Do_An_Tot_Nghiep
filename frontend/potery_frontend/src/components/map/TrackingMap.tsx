'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TrackingMapProps {
  driverLat?: number;
  driverLon?: number;
  customerLat?: number;
  customerLon?: number;
  routeCoordinates?: Array<[number, number]>;
  driverName?: string;
  customerName?: string;
  orderStatus?: string;
  height?: string;
  showRoute?: boolean;
}

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const latOk = Number.isFinite(center?.[0]);
    const lonOk = Number.isFinite(center?.[1]);
    if (!latOk || !lonOk) return;

    if (
      !prevCenterRef.current ||
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1]
    ) {
      map.setView(center, map.getZoom());
      prevCenterRef.current = center;
    }
  }, [center, map]);

  return null;
}

export default function TrackingMap({
  driverLat,
  driverLon,
  customerLat,
  customerLon,
  routeCoordinates,
  driverName = 'Tài xế',
  customerName = 'Khách hàng',
  orderStatus,
  height = '400px',
  showRoute = true,
}: TrackingMapProps) {
  const [center, setCenter] = useState<[number, number]>([10.762622, 106.660172]); // Default to Ho Chi Minh City

  const isValid = (n?: number) => typeof n === 'number' && Number.isFinite(n);

  useEffect(() => {
    // Calculate center based on available points
    const hasDriver = isValid(driverLat) && isValid(driverLon);
    const hasCustomer = isValid(customerLat) && isValid(customerLon);

    if (hasDriver && hasCustomer) {
      const lat = ((driverLat as number) + (customerLat as number)) / 2;
      const lon = ((driverLon as number) + (customerLon as number)) / 2;
      if (isValid(lat) && isValid(lon)) setCenter([lat, lon]);
    } else if (hasDriver) {
      setCenter([driverLat as number, driverLon as number]);
    } else if (hasCustomer) {
      setCenter([customerLat as number, customerLon as number]);
    }
  }, [driverLat, driverLon, customerLat, customerLon]);

  const canShowAnyPoint = (isValid(driverLat) && isValid(driverLon)) || (isValid(customerLat) && isValid(customerLon));

  if (!canShowAnyPoint) {
    return (
      <div
        style={{ height }}
        className="w-full bg-gray-100 flex items-center justify-center rounded-lg border"
      >
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    );
  }

  const purpleOptions = { color: 'purple', weight: 4 };
  const limeOptions = { color: 'lime', weight: 4 };

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver Marker */}
        {isValid(driverLat) && isValid(driverLon) && (
          <Marker
            position={[driverLat as number, driverLon as number]}
            icon={driverIcon}
            key={`driver-${driverLat}-${driverLon}`}
          >
            <Popup>
              <div>
                <strong>{driverName}</strong>
                <br />
                <span className="text-xs text-gray-600">Vị trí hiện tại</span>
                {orderStatus && (
                  <>
                    <br />
                    <span className="text-xs text-blue-600">{orderStatus}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer Marker */}
        {isValid(customerLat) && isValid(customerLon) && (
          <Marker position={[customerLat as number, customerLon as number]} icon={customerIcon}>
            <Popup>
              <div>
                <strong>{customerName}</strong>
                <br />
                <span className="text-xs text-gray-600">Địa điểm giao hàng</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={purpleOptions}
            key={`route-${routeCoordinates.length}`}
          />
        )}

        {/* Direct line if no route provided but both points exist */}
        {showRoute &&
          !routeCoordinates &&
          isValid(driverLat) &&
          isValid(driverLon) &&
          isValid(customerLat) &&
          isValid(customerLon) && (
            <Polyline
              positions={[
                [driverLat as number, driverLon as number],
                [customerLat as number, customerLon as number],
              ]}
              pathOptions={limeOptions}
            />
          )}
      </MapContainer>
    </div>
  );
}

