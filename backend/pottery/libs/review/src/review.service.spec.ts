import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { ReviewRepository, ReviewEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { ICreateReview, IListReview, IUpdateReview } from './review.interface';

describe('ReviewService', () => {
    let service: ReviewService;
    let mockReviewRepository: jest.Mocked<ReviewRepository>;

    const mockReview: ReviewEntity = {
        id: 1,
        product_id: 1,
        customer_id: 1,
        rating: 5,
        comment: 'Great product!',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as ReviewEntity;

    beforeEach(async () => {
        const mockRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findByProductId: jest.fn(),
            findByOrderItemId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewService,
                { provide: ReviewRepository, useValue: mockRepo },
            ],
        }).compile();

        service = module.get<ReviewService>(ReviewService);
        mockReviewRepository = module.get(ReviewRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createData: ICreateReview = {
            orderitem_id: 1,
            customer_id: 1,
            rating: 5,
            comment: 'Excellent product',
        };

        it('should create review successfully', async () => {
            mockReviewRepository.create.mockResolvedValue(mockReview);

            const result = await service.create(createData);

            expect(result.message).toBe('Review created successfully');
            expect(result.review).toEqual(mockReview);
            console.log('✅ Tạo review thành công');
        });

        it('should handle creation errors', async () => {
            mockReviewRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create review');
            expect(result.review).toBeNull();
            console.log('❌ Lỗi khi tạo review');
        });
    });

    describe('findAll', () => {
        it('should return reviews successfully', async () => {
            mockReviewRepository.findAll.mockResolvedValue([mockReview]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('Reviews fetched successfully');
            expect(result.reviews).toEqual([mockReview]);
            console.log('✅ Lấy danh sách review thành công');
        });

        it('should return empty when no reviews found', async () => {
            mockReviewRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({});

            expect(result.message).toBe('No reviews found');
            expect(result.reviews).toEqual([]);
            console.log('✅ Không có review nào được trả về');
        });
    });

    describe('findByProduct', () => {
        it('should return reviews for specific product', async () => {
            mockReviewRepository.findByProductId.mockResolvedValue([mockReview]);

            const result = await service.findByProductId(1);

            expect(result.reviews).toEqual([mockReview]);
            expect(mockReviewRepository.findByProductId).toHaveBeenCalledWith(1);
            console.log('✅ Lấy review theo sản phẩm thành công');
        });
    });

    describe('softDelete', () => {
        it('should delete review successfully', async () => {
            mockReviewRepository.findById.mockResolvedValue(mockReview);

            const result = await service.softDelete(1);

            expect(result.message).toBe('Review deleted successfully');
            expect(mockReviewRepository.softDelete).toHaveBeenCalledWith(1);
            console.log('✅ Xóa mềm review thành công');
        });

        it('should throw NotFoundException when review not found', async () => {
            mockReviewRepository.findById.mockResolvedValue(null);

            await expect(service.softDelete(999)).rejects.toThrow(NotFoundException);
            console.log('❌ Không tìm thấy review để xóa (NotFoundException)');
        });
    });
});
