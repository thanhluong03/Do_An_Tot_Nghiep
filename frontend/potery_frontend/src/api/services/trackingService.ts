import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface TrackingLocation {
  order_id: number;
  driver_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface OrderTrackingData {
  order_id: number;
  order_status: string;
  shipping_address: string;
  customer_coordinates: {
    latitude: number;
    longitude: number;
    display_name: string;
  } | null;
  driver_location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  driver_id: number | null;
  driver_status: string | null;
}

export interface RouteData {
  coordinates: Array<[number, number]>;
  distance: number;
  duration: number;
}

export const trackingApi = {
  /**
   * Get tracking information for an order
   */
  async getOrderTracking(orderId: number): Promise<OrderTrackingData> {
    const response = await axios.get(`${API_BASE_URL}/tracking/order/${orderId}`);
    return response.data;
  },

  /**
   * Get route between two points
   */
  async getRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteData | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/route`, {
        params: { startLat, startLon, endLat, endLon },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  },

  /**
   * Geocode an address
   */
  async geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
    display_name: string;
  } | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/geocode`, {
        params: { address },
      });
      return response.data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },

  /**
   * Reverse geocode coordinates
   */
  async reverseGeocode(lat: number, lon: number): Promise<{ address: string } | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/reverse-geocode`, {
        params: { lat, lon },
      });
      return response.data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  /**
   * Get location history for an order
   */
  async getLocationHistory(orderId: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/order/${orderId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting location history:', error);
      return null;
    }
  },
};