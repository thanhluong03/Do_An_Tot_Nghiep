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

  // Fallback coordinates for common districts in Hanoi
  private readonly hanoiDistrictCoords: Record<string, { lat: number; lon: number }> = {
    // --- Quận nội thành ---
    'ba đình': { lat: 21.0342, lon: 105.8195 },
    'hoàn kiếm': { lat: 21.0285, lon: 105.8542 },
    'đống đa': { lat: 21.0186, lon: 105.8270 },
    'hai bà trưng': { lat: 20.9988, lon: 105.8516 },
    'cầu giấy': { lat: 21.0333, lon: 105.7944 },
    'thanh xuân': { lat: 20.9949, lon: 105.8052 },
    'hoàng mai': { lat: 20.9817, lon: 105.8516 },
    'long biên': { lat: 21.0369, lon: 105.8947 },
    'tây hồ': { lat: 21.0717, lon: 105.8195 },
    'nam từ liêm': { lat: 21.0285, lon: 105.7449 },
    'bắc từ liêm': { lat: 21.073, lon: 105.758 },

    // --- Huyện ngoại thành ---
    'đông anh': { lat: 21.1390, lon: 105.8480 },
    'gia lâm': { lat: 21.0207, lon: 105.9580 },
    'thanh trì': { lat: 20.9463, lon: 105.8560 },
    'thường tín': { lat: 20.8405, lon: 105.8441 },
    'phú xuyên': { lat: 20.7386, lon: 105.9360 },
    'chương mỹ': { lat: 20.9270, lon: 105.6920 },
    'thanh oai': { lat: 20.8730, lon: 105.7780 },
    'mê linh': { lat: 21.1678, lon: 105.7000 },
    'hoài đức': { lat: 21.0486, lon: 105.7039 },
    'quốc oai': { lat: 20.9900, lon: 105.6400 },
    'đan phượng': { lat: 21.1040, lon: 105.6640 },
    'phúc thọ': { lat: 21.1286, lon: 105.5337 },
    'thạch thất': { lat: 21.0480, lon: 105.5260 },
    'ứng hòa': { lat: 20.7350, lon: 105.7700 },
    'mỹ đức': { lat: 20.6980, lon: 105.7330 },
    'ba vì': { lat: 21.1450, lon: 105.4010 },
    'sóc sơn': { lat: 21.2667, lon: 105.8499 },

    // --- Thị xã ---
    'sơn tây': { lat: 21.1400, lon: 105.5000 },
  };


  /**
   * Normalize address for better geocoding results
   * Remove duplicate city/country mentions
   */
  private normalizeAddress(address: string, city: string): string {
    let normalized = address.trim();

    // Remove existing Hà Nội, Vietnam, Việt Nam mentions to avoid duplication
    normalized = normalized.replace(/,?\s*(Hà Nội|Ha Noi|Hanoi)\s*,?/gi, '');
    normalized = normalized.replace(/,?\s*(Việt Nam|Viet Nam|Vietnam)\s*,?/gi, '');

    // Clean up multiple commas and spaces
    normalized = normalized.replace(/,+/g, ',').replace(/\s+/g, ' ').trim();
    normalized = normalized.replace(/^,|,$/g, '').trim();

    // Add city and country
    return `${normalized}, ${city}, Vietnam`;
  }

  /**
   * Convert address text to coordinates (latitude, longitude)
   * Uses fallback strategy if exact address not found
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      console.log('🔍 Geocoding address:', address);

      // Try exact address first
      let response = await axios.get(`${this.nominatimUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 5, // Get more results for fallback
          addressdetails: 1,
          countrycodes: 'vn', // Restrict to Vietnam
        },
        headers: {
          'User-Agent': 'Pottery-Delivery-App/1.0',
          'Accept-Language': 'vi,en',
        },
        timeout: 10000, // 10 seconds timeout
      });

      console.log('📡 Nominatim response:', {
        status: response.status,
        dataLength: response.data?.length,
        results: response.data?.map((r: any) => r.display_name),
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          display_name: result.display_name,
          address: result.address || {},
        };
        console.log('✅ Geocoded successfully:', coords);
        return coords;
      }

      // Fallback: Try without house number
      console.log('⚠️ Exact address not found, trying fallback...');
      const fallbackAddress = this.createFallbackAddress(address);
      if (fallbackAddress !== address) {
        console.log('🔄 Trying fallback address:', fallbackAddress);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limit

        response = await axios.get(`${this.nominatimUrl}/search`, {
          params: {
            q: fallbackAddress,
            format: 'json',
            limit: 1,
            addressdetails: 1,
            countrycodes: 'vn',
          },
          headers: {
            'User-Agent': 'Pottery-Delivery-App/1.0',
            'Accept-Language': 'vi,en',
          },
          timeout: 10000,
        });

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          const coords = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            display_name: result.display_name,
            address: result.address || {},
          };
          console.log('✅ Geocoded with fallback:', coords);
          return coords;
        }
      }

      console.warn('⚠️ No results found for address:', address);
      return null;
    } catch (error) {
      console.error('❌ Geocoding error for address:', address);
      console.error('❌ Error details:', error.message);
      if (error.response) {
        console.error('❌ API Response status:', error.response.status);
        console.error('❌ API Response data:', error.response.data);
      }
      return null; // Return null instead of throwing to allow graceful degradation
    }
  }

  /**
   * Create fallback address by removing house number
   * e.g., "379 Xuân Phương, Nam Từ Liêm, Hà Nội" -> "Xuân Phương, Nam Từ Liêm, Hà Nội"
   */
  private createFallbackAddress(address: string): string {
    // Remove leading numbers and common patterns
    return address
      .replace(/^\d+[A-Za-z]?\s+/, '') // Remove house numbers like "379 " or "19A "
      .replace(/^Số\s+\d+\s+/, '') // Remove "Số 379 "
      .trim();
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

  /**
   * Calculate shipping fee based on distance between store and delivery address
   * - 0-5km: Free
   * - 5-10km: 10,000 VND
   * - 10-20km: 20,000 VND
   * - 20km+: 30,000 VND
   * - Outside Hanoi: Partner-dependent fee
   */
  async calculateShippingFee(
    storeAddress: string,
    deliveryAddress: string,
    city: string,
  ): Promise<{ fee: number; distance: number; isHanoi: boolean; message: string }> {
    try {
      console.log('📍 Calculating shipping fee:', { storeAddress, deliveryAddress, city });

      // Normalize city name
      const normalizedCity = city.trim().toLowerCase();
      const isHanoi = normalizedCity.includes('hà nội') || normalizedCity.includes('ha noi') || normalizedCity.includes('hanoi');

      // If not in Hanoi, return partner-dependent fee
      if (!isHanoi) {
        console.log('❌ Not in Hanoi, returning partner fee');
        return {
          fee: 30000,
          distance: 0,
          isHanoi: false,
          message: 'Phí vận chuyển phụ thuộc vào đối tác vận chuyển',
        };
      }

      // Geocode both addresses with delay between requests
      console.log('🔍 Geocoding store address:', storeAddress);
      const normalizedStoreAddress = this.normalizeAddress(storeAddress, 'Hà Nội');
      console.log('📝 Normalized store address:', normalizedStoreAddress);
      let storeCoords = await this.geocode(normalizedStoreAddress);

      // Try fallback with district coordinates if geocoding fails
      if (!storeCoords) {
        console.warn('⚠️ Geocoding failed, trying district fallback for store');
        storeCoords = this.getDistrictCoordinates(storeAddress);
      }

      if (!storeCoords) {
        console.error('❌ Failed to geocode store address:', storeAddress);
        return {
          fee: 30000,
          distance: 0,
          isHanoi: true,
          message: 'Không thể xác định địa chỉ cửa hàng, áp dụng phí mặc định',
        };
      }

      console.log('✅ Store coordinates:', storeCoords);

      // Add delay to respect Nominatim rate limits (1 request per second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('🔍 Geocoding delivery address:', deliveryAddress);
      const normalizedDeliveryAddress = this.normalizeAddress(deliveryAddress, 'Hà Nội');
      console.log('📝 Normalized delivery address:', normalizedDeliveryAddress);
      let deliveryCoords = await this.geocode(normalizedDeliveryAddress);

      // Try fallback with district coordinates if geocoding fails
      if (!deliveryCoords) {
        console.warn('⚠️ Geocoding failed, trying district fallback for delivery');
        deliveryCoords = this.getDistrictCoordinates(deliveryAddress);
      }

      if (!deliveryCoords) {
        console.error('❌ Failed to geocode delivery address:', deliveryAddress);
        return {
          fee: 30000,
          distance: 0,
          isHanoi: true,
          message: 'Không thể xác định địa chỉ giao hàng, áp dụng phí mặc định',
        };
      }

      console.log('✅ Delivery coordinates:', deliveryCoords);

      // Calculate distance using Haversine formula (in meters)
      const distance = this.calculateHaversineDistance(
        storeCoords.latitude,
        storeCoords.longitude,
        deliveryCoords.latitude,
        deliveryCoords.longitude,
      );

      const distanceKm = distance / 1000;

      console.log(`📏 Calculated distance: ${distanceKm.toFixed(2)}km`);

      // Determine fee based on distance
      let fee = 0;
      let message = '';

      if (distanceKm <= 5) {
        fee = 0;
        message = `Miễn phí vận chuyển (${distanceKm.toFixed(1)}km)`;
      } else if (distanceKm <= 10) {
        fee = 10000;
        message = `Phí vận chuyển 10.000đ (${distanceKm.toFixed(1)}km)`;
      } else if (distanceKm <= 20) {
        fee = 20000;
        message = `Phí vận chuyển 20.000đ (${distanceKm.toFixed(1)}km)`;
      } else {
        fee = 30000;
        message = `Phí vận chuyển 30.000đ (${distanceKm.toFixed(1)}km)`;
      }

      console.log(`✅ Shipping fee calculated: ${fee}đ - ${message}`);

      return {
        fee,
        distance: distanceKm,
        isHanoi: true,
        message,
      };
    } catch (error) {
      console.error('❌ Error calculating shipping fee:', error);
      if (error.response) {
        console.error('❌ API Response:', error.response.data);
      }
      return {
        fee: 30000,
        distance: 0,
        isHanoi: true,
        message: 'Lỗi tính phí vận chuyển, áp dụng phí mặc định',
      };
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get approximate coordinates for a district in Hanoi
   * Used as fallback when exact geocoding fails
   */
  private getDistrictCoordinates(address: string): GeocodeResult | null {
    const normalizedAddress = address.toLowerCase();

    for (const [district, coords] of Object.entries(this.hanoiDistrictCoords)) {
      if (normalizedAddress.includes(district)) {
        console.log(`📍 Using fallback coordinates for district: ${district}`);
        return {
          latitude: coords.lat,
          longitude: coords.lon,
          display_name: `${district}, Hà Nội, Vietnam`,
          address: {},
        };
      }
    }

    return null;
  }
}