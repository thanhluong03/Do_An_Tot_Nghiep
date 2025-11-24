
import { Test, TestingModule } from '@nestjs/testing';
import { DriverLocationService } from './driver_location.service';
import { DriverLocationRepository, OrderRepository, UserRepository } from '@app/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DriverStatus, OrderStatus } from '@app/database/entities';

describe('DriverLocationService', () => {
    let service: DriverLocationService;
    let mockDriverLocationRepository: any;
    let mockOrderRepository: any;
    let mockUserRepository: any;

    beforeEach(async () => {
        mockDriverLocationRepository = {
            findByOrderId: jest.fn(),
            create: jest.fn(),
            findByDriverIdWithFilters: jest.fn(),
            findByOrderIdAndStatus: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findLocationHistory: jest.fn(),
            findCurrentLocation: jest.fn(),
        };
        mockOrderRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        mockUserRepository = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriverLocationService,
                { provide: DriverLocationRepository, useValue: mockDriverLocationRepository },
                { provide: OrderRepository, useValue: mockOrderRepository },
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile();

        service = module.get<DriverLocationService>(DriverLocationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('assignDriver', () => {
        it('should assign driver successfully', async () => {
            try {
                mockOrderRepository.findById.mockResolvedValue({ id: 1 });
                mockUserRepository.findById.mockResolvedValue({ id: 2 });
                mockDriverLocationRepository.findByOrderId.mockResolvedValue(null);
                mockDriverLocationRepository.create.mockResolvedValue({ id: 10 });
                mockOrderRepository.update.mockResolvedValue(undefined);
                const result = await service.assignDriver({ order_id: 1, driver_id: 2 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Gán nhân viên giao hàng thành công');
                console.log('✅ Assign driver thành công');
            } catch (error) {
                console.error('❌ Assign driver thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException if order not found', async () => {
            try {
                mockOrderRepository.findById.mockResolvedValue(null);
                await expect(service.assignDriver({ order_id: 1, driver_id: 2 })).rejects.toThrow(NotFoundException);
                console.log('✅ Assign driver order not found error thành công');
            } catch (error) {
                console.error('❌ Assign driver order not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('getOrdersForDriver', () => {
        it('should get orders for driver successfully', async () => {
            try {
                mockDriverLocationRepository.findByDriverIdWithFilters.mockResolvedValue([{ id: 1 }]);
                const result = await service.getOrdersForDriver(2, { status: DriverStatus.ACCEPTED });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Lấy danh sách đơn hàng thành công');
                console.log('✅ Get orders for driver thành công');
            } catch (error) {
                console.error('❌ Get orders for driver thất bại', error);
                throw error;
            }
        });
    });

    describe('acceptOrder', () => {
        it('should accept order successfully', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue({ id: 1, driver_id: 2 });
                mockDriverLocationRepository.update.mockResolvedValue(undefined);
                mockOrderRepository.update.mockResolvedValue(undefined);
                const result = await service.acceptOrder({ order_id: 1, latitude: 10, longitude: 20, driver_id: 2 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Chấp nhận đơn hàng thành công');
                console.log('✅ Accept order thành công');
            } catch (error) {
                console.error('❌ Accept order thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException if order not found', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue(null);
                await expect(service.acceptOrder({ order_id: 1, latitude: 10, longitude: 20, driver_id: 2 })).rejects.toThrow(NotFoundException);
                console.log('✅ Accept order not found error thành công');
            } catch (error) {
                console.error('❌ Accept order not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('rejectOrder', () => {
        it('should reject order successfully', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue({ id: 1 });
                mockDriverLocationRepository.softDelete.mockResolvedValue(undefined);
                mockOrderRepository.update.mockResolvedValue(undefined);
                const result = await service.rejectOrder({ order_id: 1 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Từ chối đơn hàng thành công');
                console.log('✅ Reject order thành công');
            } catch (error) {
                console.error('❌ Reject order thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException if order not found', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue(null);
                await expect(service.rejectOrder({ order_id: 1 })).rejects.toThrow(NotFoundException);
                console.log('✅ Reject order not found error thành công');
            } catch (error) {
                console.error('❌ Reject order not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('updateLocation', () => {
        it('should update location successfully', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue({ id: 1, driver_id: 2 });
                mockDriverLocationRepository.update.mockResolvedValue(undefined);
                const result = await service.updateLocation({ order_id: 1, latitude: 10, longitude: 20, driver_id: 2 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Cập nhật vị trí thành công');
                console.log('✅ Update location thành công');
            } catch (error) {
                console.error('❌ Update location thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException if order not found', async () => {
            try {
                mockDriverLocationRepository.findByOrderIdAndStatus.mockResolvedValue(null);
                await expect(service.updateLocation({ order_id: 1, latitude: 10, longitude: 20, driver_id: 2 })).rejects.toThrow(NotFoundException);
                console.log('✅ Update location not found error thành công');
            } catch (error) {
                console.error('❌ Update location not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('getLocationHistory', () => {
        it('should get location history successfully', async () => {
            try {
                mockDriverLocationRepository.findLocationHistory.mockResolvedValue([{ id: 1 }]);
                const result = await service.getLocationHistory(1);
                expect(result.success).toBe(true);
                expect(result.message).toBe('Lấy lịch sử vị trí thành công');
                console.log('✅ Get location history thành công');
            } catch (error) {
                console.error('❌ Get location history thất bại', error);
                throw error;
            }
        });
    });

    describe('getCurrentLocation', () => {
        it('should get current location successfully', async () => {
            try {
                mockDriverLocationRepository.findCurrentLocation.mockResolvedValue({ id: 1 });
                const result = await service.getCurrentLocation(1);
                expect(result.success).toBe(true);
                expect(result.message).toBe('Lấy vị trí hiện tại thành công');
                console.log('✅ Get current location thành công');
            } catch (error) {
                console.error('❌ Get current location thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException if current location not found', async () => {
            try {
                mockDriverLocationRepository.findCurrentLocation.mockResolvedValue(null);
                await expect(service.getCurrentLocation(1)).rejects.toThrow(NotFoundException);
                console.log('✅ Get current location not found error thành công');
            } catch (error) {
                console.error('❌ Get current location not found error thất bại', error);
                throw error;
            }
        });
    });
});
