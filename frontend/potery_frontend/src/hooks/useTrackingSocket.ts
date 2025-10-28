import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TrackingLocation } from '../api/services/trackingService';

export interface UseTrackingSocketOptions {
  orderId?: number;
  driverId?: number;
  userType: 'customer' | 'driver' | 'admin';
  enabled?: boolean;
}

export interface TrackingSocketCallbacks {
  onLocationUpdate?: (data: TrackingLocation) => void;
  onOrderAccepted?: (data: any) => void;
  onOrderStatusChanged?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useTrackingSocket(
  options: UseTrackingSocketOptions,
  callbacks?: TrackingSocketCallbacks,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastLocation, setLastLocation] = useState<TrackingLocation | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (options.enabled === false) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socket = io(`${API_BASE_URL}/tracking`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to tracking socket');
      setIsConnected(true);
      callbacks?.onConnect?.();

      // Join appropriate room based on user type
      if (options.userType === 'customer' && options.orderId) {
        socket.emit('customer_join', { order_id: options.orderId });
      } else if (options.userType === 'driver' && options.driverId) {
        socket.emit('driver_join', { driver_id: options.driverId });
      } else if (options.userType === 'admin') {
        socket.emit('admin_join');
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from tracking socket');
      setIsConnected(false);
      callbacks?.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      callbacks?.onError?.(error);
    });

    socket.on('location_update', (data: TrackingLocation) => {
      console.log('Location update received:', data);
      setLastLocation(data);
      callbacks?.onLocationUpdate?.(data);
    });

    socket.on('order_accepted', (data: any) => {
      console.log('Order accepted:', data);
      callbacks?.onOrderAccepted?.(data);
    });

    socket.on('order_status_changed', (data: any) => {
      console.log('Order status changed:', data);
      callbacks?.onOrderStatusChanged?.(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    options.enabled,
    options.userType,
    options.orderId,
    options.driverId,
  ]);

  const sendLocationUpdate = (
    driverId: number,
    orderId: number,
    latitude: number,
    longitude: number,
  ) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('driver_location_update', {
        driver_id: driverId,
        order_id: orderId,
        latitude,
        longitude,
      });
    }
  };

  const acceptOrder = (driverId: number, orderId: number, latitude: number, longitude: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('driver_accept_order', {
        driver_id: driverId,
        order_id: orderId,
        latitude,
        longitude,
      });
    }
  };

  return {
    isConnected,
    lastLocation,
    sendLocationUpdate,
    acceptOrder,
  };
}