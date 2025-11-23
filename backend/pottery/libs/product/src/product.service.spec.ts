
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import {
    ProductRepository,
    ProductImageRepository,
    InventoryRepository,
    InventoryDetailRepository,
    ProductPromotionRepository,
    PromotionRepository,
    CategoryRepository,
    ProductClassificationRepository,
    ProductAttributeRepository,
    ClassificationAttributeRelationshipRepository,
} from '@app/database';

describe('ProductService', () => {
    let service: ProductService;
    let mockProductRepository: any;
    let mockProductImageRepository: any;
    let mockInventoryRepository: any;
    let mockInventoryDetailRepository: any;
    let mockProductPromotionRepository: any;
    let mockPromotionRepository: any;
    let mockCategoryRepository: any;
    let mockProductClassificationRepository: any;
    let mockProductAttributeRepository: any;
    let mockClassificationAttributeRelationshipRepository: any;

    beforeEach(async () => {
        mockProductRepository = { create: jest.fn(), findAll: jest.fn(), findById: jest.fn(), update: jest.fn(), softDelete: jest.fn(), findBySupplier: jest.fn() };
        mockProductImageRepository = { createMany: jest.fn(), findByProductId: jest.fn(), update: jest.fn(), softDelete: jest.fn(), deleteByProductId: jest.fn() };
        mockInventoryRepository = { findByStore: jest.fn(), findAll: jest.fn() };
        mockInventoryDetailRepository = { findByInventoryId: jest.fn() };
        mockProductPromotionRepository = { findActiveByProductId: jest.fn() };
        mockPromotionRepository = { findById: jest.fn() };
        mockCategoryRepository = { findById: jest.fn() };
        mockProductClassificationRepository = { create: jest.fn(), findByProductId: jest.fn(), update: jest.fn(), softDelete: jest.fn() };
        mockProductAttributeRepository = { create: jest.fn(), findByClassificationId: jest.fn(), update: jest.fn(), deleteByClassificationId: jest.fn(), findById: jest.fn() };
        mockClassificationAttributeRelationshipRepository = { createMany: jest.fn(), findByProductId: jest.fn(), update: jest.fn(), deleteByProductId: jest.fn(), findByProductIdForImport: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: ProductImageRepository, useValue: mockProductImageRepository },
                { provide: InventoryRepository, useValue: mockInventoryRepository },
                { provide: InventoryDetailRepository, useValue: mockInventoryDetailRepository },
                { provide: ProductPromotionRepository, useValue: mockProductPromotionRepository },
                { provide: PromotionRepository, useValue: mockPromotionRepository },
                { provide: CategoryRepository, useValue: mockCategoryRepository },
                { provide: ProductClassificationRepository, useValue: mockProductClassificationRepository },
                { provide: ProductAttributeRepository, useValue: mockProductAttributeRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockClassificationAttributeRelationshipRepository },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ ProductService được khởi tạo thành công');
    });

    it('findById should throw error (not implemented)', () => {
        expect(() => service.findById(1)).toThrow('Method not implemented.');
        console.log('✅ findById báo lỗi chưa implement');
    });

    describe('create', () => {
        it('should create product and images', async () => {
            const data = {
                name: 'Test',
                description: 'desc',
                price: 100,
                category_id: 1,
                supplier_id: 1,
                images: [
                    { image_data: Buffer.from('img1') },
                    { image_data: Buffer.from('img2') }
                ],
                classifications: [],
                relationships: []
            };
            mockProductRepository.create.mockResolvedValue({ id: 1 });
            mockProductImageRepository.createMany.mockResolvedValue(undefined);
            const result = await service.create(data);
            expect(result.id).toBe(1);
            expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
            expect(mockProductImageRepository.createMany).toHaveBeenCalled();
            console.log('✅ Tạo sản phẩm và ảnh thành công');
        });
    });

    describe('findAll', () => {
        it('should return products with details', async () => {
            mockProductRepository.findAll.mockResolvedValue([{ id: 1, category_id: 1 }]);
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            const result = await service.findAll({});
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].category_name).toBe('Cat');
            console.log('✅ Lấy danh sách sản phẩm thành công');
        });
    });

    describe('findOne', () => {
        it('should return product details', async () => {
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            const result = await service.findOne(1);
            expect(result.id).toBe(1);
            expect(result.category_name).toBe('Cat');
            console.log('✅ Lấy chi tiết sản phẩm thành công');
        });
        it('should throw NotFoundException if not found', async () => {
            mockProductRepository.findById.mockResolvedValue(null);
            await expect(service.findOne(999)).rejects.toThrow('product not found');
            console.log('✅ Báo lỗi khi không tìm thấy sản phẩm');
        });
    });

    describe('update', () => {
        it('should update product and images', async () => {
            mockProductRepository.update.mockResolvedValue(undefined);
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductImageRepository.createMany.mockResolvedValue(undefined);
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            mockProductAttributeRepository.findByClassificationId.mockResolvedValue([]);
            mockProductClassificationRepository.update.mockResolvedValue(undefined);
            mockProductClassificationRepository.create.mockResolvedValue({ id: 1 });
            mockProductAttributeRepository.create.mockResolvedValue({ id: 1 });
            mockClassificationAttributeRelationshipRepository.createMany.mockResolvedValue(undefined);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            const result = await service.update(1, { name: 'Updated', images: [], classifications: [], relationships: [] });
            expect(result.id).toBe(1);
            expect(result.category_name).toBe('Cat');
            console.log('✅ Cập nhật sản phẩm thành công');
        });
    });

    describe('softDelete', () => {
        it('should soft delete product and images', async () => {
            mockProductRepository.findById.mockResolvedValue({ id: 1 });
            mockProductImageRepository.deleteByProductId.mockResolvedValue(undefined);
            mockProductRepository.softDelete.mockResolvedValue(undefined);
            await service.softDelete(1);
            expect(mockProductImageRepository.deleteByProductId).toHaveBeenCalledWith(1);
            expect(mockProductRepository.softDelete).toHaveBeenCalledWith(1);
            console.log('✅ Xóa mềm sản phẩm thành công');
        });
        it('should throw NotFoundException if not found', async () => {
            mockProductRepository.findById.mockResolvedValue(null);
            await expect(service.softDelete(999)).rejects.toThrow('product not found');
            console.log('✅ Báo lỗi khi xóa mềm sản phẩm không tồn tại');
        });
    });

    describe('findAllByStore', () => {
        it('should return products by store', async () => {
            mockInventoryRepository.findByStore.mockResolvedValue([{ product_id: 1, store_id: 1, quantity_stock: 10, quantity_sold: 2, store: { store_name: 'Store', address: 'Addr' }, inventory_details: [] }]);
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductPromotionRepository.findActiveByProductId.mockResolvedValue(null);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            const result = await service.findAllByStore(1);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].store_id).toBe(1);
            console.log('✅ Lấy sản phẩm theo cửa hàng thành công');
        });
    });

    describe('findAllByInventory', () => {
        it('should return products by inventory', async () => {
            mockInventoryRepository.findAll.mockResolvedValue([{ product_id: 1, store: { deleted_at: null }, quantity_stock: 10, quantity_sold: 2, store_id: 1, id: 1 }]);
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductPromotionRepository.findActiveByProductId.mockResolvedValue(null);
            mockPromotionRepository.findById.mockResolvedValue(null);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]); // Sửa: luôn trả về mảng
            const result = await service.findAllByInventory();
            expect(result.products).toBeDefined();
            console.log('✅ Lấy sản phẩm theo inventory thành công');
        });
    });

    describe('findAllByInventoryWithCategory', () => {
        it('should return products by inventory and category', async () => {
            mockInventoryRepository.findAll.mockResolvedValue([{ product_id: 1, store: { deleted_at: null }, quantity_stock: 10, quantity_sold: 2, store_id: 1, id: 1 }]);
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductPromotionRepository.findActiveByProductId.mockResolvedValue(null);
            mockPromotionRepository.findById.mockResolvedValue(null);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]); // Sửa: luôn trả về mảng
            const result = await service.findAllByInventoryWithCategory(1);
            expect(result.products).toBeDefined();
            console.log('✅ Lấy sản phẩm theo inventory và category thành công');
        });
    });

    describe('findInventoryDetailByProductId', () => {
        it('should return inventory detail by product id', async () => {
            mockInventoryRepository.findAll.mockResolvedValue([{ product_id: 1, store: { deleted_at: null }, id: 1, quantity_stock: 10, quantity_sold: 2 }]);
            mockProductRepository.findById.mockResolvedValue({ id: 1, category_id: 1 });
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductClassificationRepository.findByProductId.mockResolvedValue([]);
            mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]);
            mockProductPromotionRepository.findActiveByProductId.mockResolvedValue(null);
            mockPromotionRepository.findById.mockResolvedValue(null);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            mockClassificationAttributeRelationshipRepository.findByProductId.mockResolvedValue([]);
            const result = await service.findInventoryDetailByProductId(1);
            expect(result.id).toBe(1);
            expect(result.category_name).toBe('Cat');
            console.log('✅ Lấy chi tiết inventory theo product id thành công');
        });
        it('should throw NotFoundException if no inventory found', async () => {
            mockInventoryRepository.findAll.mockResolvedValue([]);
            await expect(service.findInventoryDetailByProductId(999)).rejects.toThrow('No inventory found for this product');
            console.log('✅ Báo lỗi khi không tìm thấy inventory cho sản phẩm');
        });
        it('should throw NotFoundException if product not found', async () => {
            // Đảm bảo có inventory đúng productId nhưng product trả về null
            mockInventoryRepository.findAll.mockResolvedValue([{ product_id: 999, store: { deleted_at: null }, id: 1 }]);
            mockProductRepository.findById.mockResolvedValue(null);
            await expect(service.findInventoryDetailByProductId(999)).rejects.toThrow('product not found');
            console.log('✅ Báo lỗi khi không tìm thấy sản phẩm khi lấy inventory detail');
        });
    });

    describe('findBySupplier', () => {
        it('should return products by supplier', async () => {
            mockProductRepository.findBySupplier.mockResolvedValue([{ id: 1, category_id: 1 }]);
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockCategoryRepository.findById.mockResolvedValue({ name: 'Cat' });
            const result = await service.findBySupplier(1);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].category_name).toBe('Cat');
            console.log('✅ Lấy sản phẩm theo nhà cung cấp thành công');
        });
        it('should return empty array if no products', async () => {
            mockProductRepository.findBySupplier.mockResolvedValue([]);
            const result = await service.findBySupplier(999);
            expect(result).toEqual([]);
            console.log('✅ Trả về mảng rỗng khi không có sản phẩm theo nhà cung cấp');
        });
    });

    describe('getProductClassifications', () => {
        it('should return product classifications', async () => {
            mockClassificationAttributeRelationshipRepository.findByProductIdForImport.mockResolvedValue([{ id: 1, attribute1: { name: 'A1' }, attribute2: { name: 'A2' }, price: 100, quantity: 10, product_attribute_id_1: 1, product_attribute_id_2: 2 }]);
            const result = await service.getProductClassifications(1);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0].name).toBe('A1 - A2');
            console.log('✅ Lấy phân loại sản phẩm thành công');
        });
        it('should return empty array on error', async () => {
            mockClassificationAttributeRelationshipRepository.findByProductIdForImport.mockRejectedValue(new Error('DB error'));
            const result = await service.getProductClassifications(999);
            expect(result).toEqual([]);
            console.log('✅ Trả về mảng rỗng khi lỗi lấy phân loại sản phẩm');
        });
    });

    console.log('\n🎯 Tất cả test cases cho ProductService đã được thực hiện!');
    console.log('📋 Bao gồm: Tạo, lấy, cập nhật, xóa mềm, inventory, nhà cung cấp, phân loại');
    console.log('🔍 Các trường hợp lỗi và thành công đều được kiểm tra');
});