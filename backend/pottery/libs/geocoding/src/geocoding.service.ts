import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

@Injectable()
export class GeocodingService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org';

  /**
   * Convert address text to coordinates (latitude, longitude)
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await axios.get(`${this.nominatimUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'Pottery-Delivery-App',
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          display_name: result.display_name,
          address: result.address || {},
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await axios.get(`${this.nominatimUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'Pottery-Delivery-App',
        },
      });

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Get route between two points using OSRM (OpenStreetMap Routing Machine)
   * Note: This is a simplified version. For production, you might want to use a dedicated routing service
   */
  async getRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<{ coordinates: Array<[number, number]>; distance: number; duration: number } | null> {
    try {
      // Using OSRM demo server - for production, you should set up your own OSRM instance
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson',
          },
        },
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [
          coord[1],
          coord[0],
        ]) as Array<[number, number]>; // Convert lon,lat to lat,lon

        return {
          coordinates,
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
        };
      }

      return null;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  }
}