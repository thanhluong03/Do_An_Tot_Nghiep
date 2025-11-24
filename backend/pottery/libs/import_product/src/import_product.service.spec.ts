
import { Test, TestingModule } from '@nestjs/testing';
import { ImportProductService } from './import_product.service';
import { ImportProductRepository, ImportProductDetailRepository, ProductRepository, SupplierRepository, ClassificationAttributeRelationshipRepository } from '@app/database';

describe('ImportProductService', () => {
    let service: ImportProductService;
    let mockImportProductRepository: any;
    let mockImportProductDetailRepository: any;
    let mockProductRepository: any;
    let mockSupplierRepository: any;
    let mockClassificationAttributeRelationshipRepository: any;

    beforeEach(async () => {
        mockImportProductRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findAll: jest.fn(),
        };
        mockImportProductDetailRepository = {
            createDetail: jest.fn(),
            findByImportProductId: jest.fn(),
            update: jest.fn(),
            softDeleteDetail: jest.fn(),
        };
        mockProductRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        mockSupplierRepository = {
            findById: jest.fn(),
        };
        mockClassificationAttributeRelationshipRepository = {
            findByProductId: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImportProductService,
                { provide: ImportProductRepository, useValue: mockImportProductRepository },
                { provide: ImportProductDetailRepository, useValue: mockImportProductDetailRepository },
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: SupplierRepository, useValue: mockSupplierRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockClassificationAttributeRelationshipRepository },
            ],
        }).compile();

        service = module.get<ImportProductService>(ImportProductService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('create', () => {
        it('should create import product without classification', async () => {
            try {
                mockImportProductRepository.create.mockResolvedValue({ id: 1 });
                mockProductRepository.findById.mockResolvedValue({ id: 1, quantity: 10 });
                mockProductRepository.update.mockResolvedValue(undefined);
                const result = await service.create({ product_id: 1, supplier_id: 2, import_quantity: 5, import_price: 100 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Nhập sản phẩm thành công');
                console.log('✅ Create import product không phân loại thành công');
            } catch (error) {
                console.error('❌ Create import product không phân loại thất bại', error);
                throw error;
            }
        });

        it('should handle error when create fails', async () => {
            try {
                mockImportProductRepository.create.mockRejectedValue(new Error('DB error'));
                const result = await service.create({ product_id: 1, supplier_id: 2, import_quantity: 5, import_price: 100 });
                expect(result.success).toBe(false);
                expect(result.message).toBe('Nhập sản phẩm thất bại');
                console.log('✅ Create import product error handling thành công');
            } catch (error) {
                console.error('❌ Create import product error handling thất bại', error);
                throw error;
            }
        });
    });

    describe('update', () => {
        it('should update import product successfully', async () => {
            try {
                mockImportProductRepository.findById.mockResolvedValue({ id: 1, product_id: 1, import_quantity: 5 });
                mockImportProductDetailRepository.findByImportProductId.mockResolvedValue([]);
                mockProductRepository.findById.mockResolvedValue({ id: 1, quantity: 10 });
                mockImportProductRepository.update.mockResolvedValue(undefined);
                mockProductRepository.update.mockResolvedValue(undefined);
                const result = await service.update(1, { import_quantity: 10, import_price: 200 });
                expect(result.success).toBe(true);
                expect(result.message).toBe('Cập nhật phiếu nhập hàng thành công');
                console.log('✅ Update import product thành công');
            } catch (error) {
                console.error('❌ Update import product thất bại', error);
                throw error;
            }
        });

        it('should return not found message if import product not found', async () => {
            try {
                mockImportProductRepository.findById.mockResolvedValue(null);
                const result = await service.update(999, { import_quantity: 10 });
                expect(result.success).toBe(false);
                expect(result.message).toBe('Không tìm thấy phiếu nhập hàng');
                console.log('✅ Update import product not found thành công');
            } catch (error) {
                console.error('❌ Update import product not found thất bại', error);
                throw error;
            }
        });
    });

    describe('delete', () => {
        it('should delete import product successfully', async () => {
            try {
                mockImportProductRepository.findById.mockResolvedValue({ id: 1, product_id: 1, import_quantity: 5 });
                mockImportProductDetailRepository.findByImportProductId.mockResolvedValue([]);
                mockImportProductRepository.softDelete.mockResolvedValue(undefined);
                mockProductRepository.findById.mockResolvedValue({ id: 1, quantity: 10 });
                mockProductRepository.update.mockResolvedValue(undefined);
                const result = await service.delete(1);
                expect(result.success).toBe(true);
                expect(result.message).toBe('Xóa phiếu nhập hàng thành công');
                console.log('✅ Delete import product thành công');
            } catch (error) {
                console.error('❌ Delete import product thất bại', error);
                throw error;
            }
        });

        it('should return not found message if import product not found', async () => {
            try {
                mockImportProductRepository.findById.mockResolvedValue(null);
                const result = await service.delete(999);
                expect(result.success).toBe(false);
                expect(result.message).toBe('Không tìm thấy phiếu nhập hàng');
                console.log('✅ Delete import product not found thành công');
            } catch (error) {
                console.error('❌ Delete import product not found thất bại', error);
                throw error;
            }
        });
    });

    describe('list', () => {
        it('should list import products successfully', async () => {
            try {
                mockImportProductRepository.findAll.mockResolvedValue([
                    { id: 1, product: { name: 'P1' }, supplier: { name: 'S1' }, product_id: 1, supplier_id: 1, import_quantity: 5, import_price: 100, created_at: new Date(), updated_at: new Date() },
                ]);
                mockImportProductDetailRepository.findByImportProductId.mockResolvedValue([]);
                const result = await service.list({ page: 1, size: 10 });
                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.page).toBe(1);
                expect(result.size).toBe(10);
                console.log('✅ List import products thành công');
            } catch (error) {
                console.error('❌ List import products thất bại', error);
                throw error;
            }
        });
    });
});
