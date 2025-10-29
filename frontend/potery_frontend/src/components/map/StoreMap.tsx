'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import CSS của Leaflet
import L from 'leaflet';
import React, { useEffect } from 'react'; // 👈 THÊM 1: Import useEffect

// --- Sửa lỗi icon mặc định của Leaflet (Giữ nguyên) ---
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- Kết thúc sửa lỗi icon ---

interface StoreMapProps {
  location: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
}

// 
// 🔴 SỬA LỖI Ở ĐÂY 🔴
//
// Component này giúp bản đồ tự động di chuyển khi bạn bấm tab
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  
  // 👈 SỬA 2: Bọc logic side-effect trong useEffect
  useEffect(() => {
    if (map) { // ✅ THÊM: Kiểm tra xem map đã sẵn sàng chưa
      map.setView(coords, 16);
    }
  }, [coords, map]); // 👈 Chỉ chạy lại khi 'coords' hoặc 'map' thay đổi

  return null; // Không render gì cả
}

export default function StoreMap({ location }: StoreMapProps) {
  const position: [number, number] = [location.lat, location.lng];

  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <ChangeMapView coords={position} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <b>{location.name}</b><br />{location.address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}