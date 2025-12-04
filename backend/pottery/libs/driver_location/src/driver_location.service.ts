import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DriverLocationRepository, OrderRepository, UserRepository } from '@app/database';
import { DriverLocationEntity, DriverStatus, OrderStatus } from '@app/database/entities';
import {
    IAssignDriver,
    IAcceptOrder,
    IRejectOrder,
    IUpdateLocation,
    IGetOrdersForDriver,
} from './driver_location.interface';

@Injectable()
export class DriverLocationService {
    constructor(
        @Inject(DriverLocationRepository)
        private readonly driverLocationRepository: DriverLocationRepository,
        @Inject(OrderRepository)
        private readonly orderRepository: OrderRepository,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    async assignDriver(data: IAssignDriver) {
        try {
            const { order_id, driver_id } = data;

            const order = await this.orderRepository.findById(order_id);

            if (!order) {
                throw new NotFoundException('Đơn hàng không tồn tại');
            }

            const driver = await this.userRepository.findById(driver_id);

            if (!driver) {
                throw new NotFoundException('Nhân viên giao hàng không tồn tại hoặc không hoạt động');
            }

            const existingAssignment = await this.driverLocationRepository.findByOrderId(order_id);

            if (existingAssignment) {
                throw new BadRequestException('Đơn hàng đã được gán cho nhân viên giao hàng khác');
            }
            const driverLocation = await this.driverLocationRepository.create({
                order_id,
                driver_id,
                driver_status: DriverStatus.WAITING_ACCEPT,
                timestamp: new Date(),
            });
            await this.orderRepository.update(order_id, {
                status: OrderStatus.CONFIRMED,
            });

            return {
                success: true,
                message: 'Gán nhân viên giao hàng thành công',
                data: driverLocation,
            };
        } catch (error) {
            console.error('Error assigning driver:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Không thể gán nhân viên giao hàng');
        }
    }

    async getOrdersForDriver(driverId: number, query: IGetOrdersForDriver) {
        try {
            const driverLocations = await this.driverLocationRepository.findByDriverIdWithFilters(
                driverId,
                query.status,
            );

            return {
                success: true,
                message: 'Lấy danh sách đơn hàng thành công',
                data: driverLocations,
            };
        } catch (error) {
            console.error('Error getting orders for driver:', error);
            throw new BadRequestException('Không thể lấy danh sách đơn hàng');
        }
    }

      async acceptOrder(data: IAcceptOrder & { driver_id: number }) {
    try {
      const { order_id, latitude, longitude, driver_id } = data;

      const driverLocation = await this.driverLocationRepository.findByOrderIdAndStatus(
        order_id,
        DriverStatus.WAITING_ACCEPT,
      );

      if (!driverLocation) {
        throw new NotFoundException('Không tìm thấy đơn hàng chờ chấp nhận');
      }

      // Verify driver_id matches
      if (driverLocation.driver_id !== driver_id) {
        throw new BadRequestException('Driver không khớp với đơn hàng được gán');
      }

      // Lấy thông tin đơn hàng để kiểm tra trạng thái
      const order = await this.orderRepository.findById(order_id);
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

            await this.driverLocationRepository.update(driverLocation.id, {
        driver_status: DriverStatus.ACCEPTED,
        latitude,
        longitude,
        timestamp: new Date(),
      });


      // Kiểm tra trạng thái đơn hàng và cập nhật tương ứng
      let newStatus;
      if (order.status === OrderStatus.PENDING_DELIVERY) {
        newStatus = OrderStatus.SHIPPING;
      } else if (order.status === OrderStatus.PENDING_DELIVERY_RETURN) {
        newStatus = OrderStatus.SHIPPING_RETURN;
      } else {
        newStatus = OrderStatus.SHIPPING; // fallback mặc định
      }
      await this.orderRepository.update(order_id, {
        status: newStatus,
      });

      return {
        success: true,
        message: 'Chấp nhận đơn hàng thành công',
      };
    } catch (error) {
      console.error('Error accepting order:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể chấp nhận đơn hàng');
    }
  }

    async rejectOrder(data: IRejectOrder) {
        try {
            const { order_id } = data;

            const driverLocation = await this.driverLocationRepository.findByOrderIdAndStatus(
                order_id,
                DriverStatus.WAITING_ACCEPT,
            );

            if (!driverLocation) {
                throw new NotFoundException('Không tìm thấy đơn hàng chờ chấp nhận');
            }

            await this.driverLocationRepository.softDelete(driverLocation.id);


            return {
                success: true,
                message: 'Từ chối đơn hàng thành công',
            };
        } catch (error) {
            console.error('Error rejecting order:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể từ chối đơn hàng');
        }
    }

  async updateLocation(data: IUpdateLocation & { driver_id: number }) {
    try {
      const { order_id, latitude, longitude, driver_id } = data;

      const driverLocation = await this.driverLocationRepository.findByOrderIdAndStatus(
        order_id,
        DriverStatus.ACCEPTED,
      );

      if (!driverLocation) {
        throw new NotFoundException('Không tìm thấy đơn hàng đang giao');
      }

      // Verify driver_id matches
      if (driverLocation.driver_id !== driver_id) {
        throw new BadRequestException('Driver không khớp với đơn hàng');
      }

      await this.driverLocationRepository.update(driverLocation.id, {
        latitude,
        longitude,
        timestamp: new Date(),
      });

      return {
        success: true,
        message: 'Cập nhật vị trí thành công',
      };
    } catch (error) {
      console.error('Error updating location:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật vị trí');
    }
  }

    async getLocationHistory(orderId: number) {
        try {
            const locationHistory = await this.driverLocationRepository.findLocationHistory(orderId);

            return {
                success: true,
                message: 'Lấy lịch sử vị trí thành công',
                data: locationHistory,
            };
        } catch (error) {
            console.error('Error getting location history:', error);
            throw new BadRequestException('Không thể lấy lịch sử vị trí');
        }
    }

    async getCurrentLocation(orderId: number) {
        try {
            const currentLocation = await this.driverLocationRepository.findCurrentLocation(orderId);

            if (!currentLocation) {
                throw new NotFoundException('Không tìm thấy vị trí hiện tại của đơn hàng');
            }

            return {
                success: true,
                message: 'Lấy vị trí hiện tại thành công',
                data: currentLocation,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Không thể lấy vị trí hiện tại');
        }
    }
}
