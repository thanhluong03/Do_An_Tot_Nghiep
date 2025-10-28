import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { GeocodingService, GeocodeResult } from '@app/geocoding';
import { OrderRepository, DriverLocationRepository, UserRepository } from '@app/database';
import { DriverLocationService } from '@app/driver_location';

interface CurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

@Controller('tracking')
export class TrackingController {
  constructor(
    @Inject(GeocodingService)
    private readonly geocodingService: GeocodingService,
    @Inject(OrderRepository)
    private readonly orderRepository: OrderRepository,
    @Inject(DriverLocationRepository)
    private readonly driverLocationRepository: DriverLocationRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly driverLocationService: DriverLocationService,
  ) {}

  /**
   * Get tracking information for an order
   */
  @Get('order/:orderId')
  async getOrderTracking(@Param('orderId') orderId: number) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      return { error: 'Order not found' };
    }

    // Get driver location
    const driverLocation = await this.driverLocationRepository.findByOrderId(orderId);
    
    // Geocode customer address
    let customerCoordinates: GeocodeResult | null = null;
    if (order.shipping_address) {
      try {
        customerCoordinates = await this.geocodingService.geocode(order.shipping_address);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Get current driver location
    let currentLocation: CurrentLocation | null = null;
    if (driverLocation) {
      currentLocation = {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        timestamp: driverLocation.timestamp,
      };
    }

    // Fallback: derive driver start coordinates from driver's saved address
    // Only when we don't have a valid current GPS (lat/lon missing or null)
    let driverStartCoordinates: GeocodeResult | null = null;
    try {
      const needFallback =
        !driverLocation ||
        driverLocation.latitude === null ||
        driverLocation.longitude === null ||
        typeof driverLocation.latitude !== 'number' ||
        typeof driverLocation.longitude !== 'number';

      if (needFallback && driverLocation?.driver_id) {
        const driver = await this.userRepository.findById(driverLocation.driver_id);
        if (driver?.address) {
          try {
            const geo = await this.geocodingService.geocode(driver.address);
            if (geo) driverStartCoordinates = geo;
          } catch (geErr) {
            // swallow geocoding errors for fallback
          }
        }
      }
    } catch (e) {
      // ignore fallback errors
    }

    return {
      order_id: order.id,
      order_status: order.status,
      shipping_address: order.shipping_address,
      customer_coordinates: customerCoordinates
        ? {
            latitude: customerCoordinates.latitude,
            longitude: customerCoordinates.longitude,
            display_name: customerCoordinates.display_name,
          }
        : null,
      driver_location: currentLocation,
      driver_id: driverLocation?.driver_id || null,
      driver_status: driverLocation?.driver_status || null,
      driver_start_coordinates: driverStartCoordinates
        ? {
            latitude: driverStartCoordinates.latitude,
            longitude: driverStartCoordinates.longitude,
            display_name: driverStartCoordinates.display_name,
          }
        : null,
    };
  }

  /**
   * Get route between driver and customer
   */
  @Get('route')
  async getRoute(
    @Query('startLat') startLat: number,
    @Query('startLon') startLon: number,
    @Query('endLat') endLat: number,
    @Query('endLon') endLon: number,
  ) {
    if (!startLat || !startLon || !endLat || !endLon) {
      return { error: 'Missing required coordinates' };
    }

    const route = await this.geocodingService.getRoute(
      startLat,
      startLon,
      endLat,
      endLon,
    );

    return route || { error: 'Could not calculate route' };
  }

  /**
   * Geocode an address
   */
  @Get('geocode')
  async geocodeAddress(@Query('address') address: string) {
    if (!address) {
      return { error: 'Address is required' };
    }

    const result = await this.geocodingService.geocode(address);
    return result || { error: 'Could not geocode address' };
  }

  /**
   * Reverse geocode coordinates
   */
  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    if (!lat || !lon) {
      return { error: 'Latitude and longitude are required' };
    }

    const result = await this.geocodingService.reverseGeocode(lat, lon);
    return { address: result };
  }

  /**
   * Get location history for an order
   */
  @Get('order/:orderId/history')
  async getLocationHistory(@Param('orderId') orderId: number) {
    const history = await this.driverLocationService.getLocationHistory(orderId);
    return history;
  }
}