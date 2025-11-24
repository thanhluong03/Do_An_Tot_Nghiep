import { Test, TestingModule } from '@nestjs/testing';
import { PromotionService } from './promotion.service';
import { PromotionRepository, PromotionEntity, ProductPromotionRepository } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { ICreatePromotion, IListPromotion, IUpdatePromotion } from './promotion.interface';

describe('PromotionService', () => {
    let service: PromotionService;
    let mockPromotionRepository: jest.Mocked<PromotionRepository>;
    let mockProductPromotionRepository: any;

    const mockPromotion: PromotionEntity = {
        id: 1,
        name: 'Test Promotion',
        description: 'Test Description',
        discount_type: 'percentage',
        discount_value: 10,
        start_date: new Date(),
        end_date: new Date(Date.now() + 86400000),
        is_active: true,
        productPromotions: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as PromotionEntity;

    beforeEach(async () => {
        const mockRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };
        mockProductPromotionRepository = {
            findAll: jest.fn(),
            findByProductIds: jest.fn(),
            softDeleteByProductId: jest.fn(),
            updatePromotionForProduct: jest.fn(),
            createMany: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromotionService,
                { provide: PromotionRepository, useValue: mockRepo },
                { provide: ProductPromotionRepository, useValue: mockProductPromotionRepository },
            ],
        }).compile();
        service = module.get<PromotionService>(PromotionService);
        mockPromotionRepository = module.get(PromotionRepository);
    });
    describe('update', () => {
        it('should update promotion successfully', async () => {
            mockPromotionRepository.update.mockResolvedValue(undefined);
            mockPromotionRepository.findById.mockResolvedValue(mockPromotion);
            const result = await service.update(1, { name: 'Updated' });
            expect(result.message).toBe('Promotion updated successfully');
            expect(result.promotion).toEqual(mockPromotion);
            console.log('✅ Cập nhật promotion thành công');
        });
        it('should throw NotFoundException if not found after update', async () => {
            mockPromotionRepository.update.mockResolvedValue(undefined);
            mockPromotionRepository.findById.mockResolvedValue(null);
            await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundException);
            console.log('❌ Không tìm thấy promotion để cập nhật (NotFoundException)');
        });
    });

    describe('softDeleteExpiredPromotions', () => {
        it('should soft delete expired promotions', async () => {
            const expiredPromo = { ...mockPromotion, id: 2, end_date: new Date(Date.now() - 86400000) };
            mockPromotionRepository.findAll.mockResolvedValue([mockPromotion, expiredPromo]);
            mockPromotionRepository.softDelete.mockResolvedValue(undefined);
            const result = await service.softDeleteExpiredPromotions();
            expect(result.count).toBe(1);
            expect(result.message).toContain('Đã xóa mềm 1 promotion hết hạn!');
            console.log('✅ Xóa mềm promotion hết hạn thành công');
        });
    });

    describe('getAllProductPromotions', () => {
        it('should return all product promotions', async () => {
            const mockPP = [{ product_id: 1, promotion_id: 2, product: {}, promotion: {} }];
            mockProductPromotionRepository.findAll.mockResolvedValue(mockPP);
            const result = await service.getAllProductPromotions();
            expect(result[0].productId).toBe(1);
            expect(result[0].promotionId).toBe(2);
            console.log('✅ Lấy danh sách product promotion thành công');
        });
    });

    describe('setProductPromotion', () => {
        it('should update and create product promotions', async () => {
            mockProductPromotionRepository.findByProductIds.mockResolvedValue([
                { product_id: 1, promotion_id: 2 },
                { product_id: 2, promotion_id: 3 },
            ]);
            mockProductPromotionRepository.updatePromotionForProduct.mockResolvedValue(undefined);
            mockProductPromotionRepository.createMany.mockResolvedValue(undefined);
            mockProductPromotionRepository.softDeleteByProductId.mockResolvedValue(undefined);
            const assignments = [
                { productId: 1, promotionId: 5 }, // update
                { productId: 2, promotionId: null }, // delete
                { productId: 3, promotionId: 7 }, // create
            ];
            const result = await service.setProductPromotion(assignments);
            expect(result.message).toContain('Cập nhật gán cho 3 sản phẩm thành công');
            console.log('✅ Gán/cập nhật/xóa product promotion thành công');
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createData: ICreatePromotion = {
            name: 'New Promotion',
            description: 'New Description',
            discount_type: 'percentage',
            discount_value: 15,
            start_date: new Date(),
            end_date: new Date(Date.now() + 86400000),
        };

        it('should create promotion successfully', async () => {
            mockPromotionRepository.create.mockResolvedValue(mockPromotion);

            const result = await service.create(createData);

            expect(result.message).toBe('Promotion created successfully');
            expect(result.promotion).toEqual(mockPromotion);
            console.log('✅ Tạo promotion thành công');
        });

        it('should handle creation errors', async () => {
            mockPromotionRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create promotion');
            expect(result.promotion).toBeNull();
            console.log('✅ Xử lý lỗi khi tạo promotion');
        });
    });

    describe('findAll', () => {
        it('should return promotions successfully', async () => {
            mockPromotionRepository.findAll.mockResolvedValue([mockPromotion]);
            const result = await service.findAll({ page: 1, size: 10 });
            expect(result.message).toBe('Promotions fetched successfully');
            expect(result.promotions).toEqual([mockPromotion]);
            console.log('✅ Lấy danh sách promotion thành công');
        });
        it('should return empty when no promotions found', async () => {
            mockPromotionRepository.findAll.mockResolvedValue([]);
            const result = await service.findAll({});
            expect(result.message).toBe('No promotions found');
            expect(result.promotions).toEqual([]);
            console.log('✅ Không có promotion nào được trả về');
        });
    });

    describe('findOne', () => {
        it('should return promotion when found', async () => {
            mockPromotionRepository.findById.mockResolvedValue(mockPromotion);
            const result = await service.findOne(1);
            expect(result.promotion).toEqual(mockPromotion);
            console.log('✅ Lấy promotion thành công');
        });
        it('should throw NotFoundException when not found', async () => {
            mockPromotionRepository.findById.mockResolvedValue(null);
            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            console.log('❌ Không tìm thấy promotion (NotFoundException)');
        });
    });

    describe('softDelete', () => {
        it('should delete promotion successfully', async () => {
            mockPromotionRepository.findById.mockResolvedValue(mockPromotion);
            const result = await service.softDelete(1);
            expect(result.message).toBe('Promotion deleted successfully');
            expect(mockPromotionRepository.softDelete).toHaveBeenCalledWith(1);
            console.log('✅ Xóa mềm promotion thành công');
        });
        it('should throw NotFoundException when promotion not found for deletion', async () => {
            mockPromotionRepository.findById.mockResolvedValue(null);
            await expect(service.softDelete(999)).rejects.toThrow(NotFoundException);
            console.log('❌ Không tìm thấy promotion để xóa (NotFoundException)');
        });
    });
});
