import { Test, TestingModule } from '@nestjs/testing';
import { VoucherService } from './voucher.service';
import {
    VoucherRepository,
    VoucherEntity,
    VoucherCustomerRepository,
} from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

describe('VoucherService', () => {
    let service: VoucherService;
    let mockVoucherRepository: any;
    let mockVoucherCustomerRepository: any;
    let mockDataSource: any;

    const createMockVoucher = (
        overrides: Partial<VoucherEntity> = {}
    ): VoucherEntity =>
        ({
            id: 1,
            name: 'Test Voucher',
            start_time: new Date('2024-01-01'),
            end_time: new Date('2024-12-31'),
            effective_period_begins: new Date('2024-01-01'),
            effective_period_ends: new Date('2024-12-31'),
            is_active: true,
            voucher_percentage: 10,
            quantity: 100,
            order_conditions: 50000,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            ...overrides,
        }) as VoucherEntity;

    beforeEach(async () => {
        mockVoucherRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
        };

        mockVoucherCustomerRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };

        mockDataSource = {
            manager: {
                findOne: jest.fn(),
                query: jest.fn(),
                save: jest.fn(),
                delete: jest.fn(),
            },
            createQueryRunner: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VoucherService,
                { provide: VoucherRepository, useValue: mockVoucherRepository },
                { provide: VoucherCustomerRepository, useValue: mockVoucherCustomerRepository },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<VoucherService>(VoucherService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('create', () => {
        it('should create voucher successfully', async () => {
            const createData = {
                name: 'New Voucher',
                start_time: new Date(),
                end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                is_active: true,
                voucher_percentage: 15,
                quantity: 50,
                order_conditions: 200,
            };
            const mockVoucher = createMockVoucher(createData);
            mockVoucherRepository.create.mockResolvedValue(mockVoucher);

            const result = await service.create(createData);

            expect(result.message).toBe('Voucher created successfully');
            expect(result.voucher).toEqual(mockVoucher);
            console.log('✅ Create voucher thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                name: 'New Voucher',
                start_time: new Date(),
                end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                is_active: true,
                voucher_percentage: 15,
                quantity: 50,
                order_conditions: 200,
            };
            mockVoucherRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create voucher');
            expect(result.voucher).toBeNull();
            console.log('✅ Create voucher error handling thành công');
        });
    });

    describe('findAll', () => {
        it('should return vouchers with success message', async () => {
            const mockVouchers = [
                createMockVoucher({ name: 'Voucher 1' }),
                createMockVoucher({ id: 2, name: 'Voucher 2' }),
            ];
            mockVoucherRepository.findAll.mockResolvedValue(mockVouchers);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('Vouchers fetched successfully');
            expect(result.vouchers).toEqual(mockVouchers);
            console.log('✅ Get vouchers thành công');
        });

        it('should return no vouchers found message when empty', async () => {
            mockVoucherRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('No vouchers found');
            expect(result.vouchers).toEqual([]);
            console.log('✅ No vouchers found thành công');
        });
    });

    describe('findOne', () => {
        it('should return voucher when found', async () => {
            const voucherId = 1;
            const mockVoucher = createMockVoucher({ id: voucherId });
            mockVoucherRepository.findById.mockResolvedValue(mockVoucher);

            const result = await service.findOne(voucherId);

            expect(result.message).toBe('Voucher fetched successfully');
            expect(result.voucher).toEqual(mockVoucher);
            console.log('✅ Get voucher by ID thành công');
        });

        it('should throw NotFoundException when voucher not found', async () => {
            const voucherId = 999;
            mockVoucherRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(voucherId)).rejects.toThrow(
                new NotFoundException('Voucher not found')
            );
            console.log('✅ Voucher not found error thành công');
        });
    });
});
