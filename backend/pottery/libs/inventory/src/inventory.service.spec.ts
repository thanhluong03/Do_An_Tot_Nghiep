import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import {
    InventoryRepository,
    InventoryDetailRepository,
    ClassificationAttributeRelationshipRepository,
    ProductRepository,
    StoreRepository,
    InventoryEntity,
    InventoryDetailEntity,
} from '@app/database';
import { NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
    let service: InventoryService;
    let mockInventoryRepository: jest.Mocked<InventoryRepository>;
    let mockInventoryDetailRepository: jest.Mocked<InventoryDetailRepository>;
    let mockClassificationRepo: any;
    let mockProductRepository: any;

    const mockInventory: InventoryEntity = {
        id: 1,
        product_id: 1,
        store_id: 1,
        quantity_stock: 100,
        quantity_sold: 10,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as InventoryEntity;

    beforeEach(async () => {
        const mockRepos = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findByInventoryId: jest.fn(),
            deleteByInventoryId: jest.fn(),
            findByProductId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                { provide: InventoryRepository, useValue: mockRepos },
                { provide: InventoryDetailRepository, useValue: mockRepos },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockRepos },
                { provide: ProductRepository, useValue: mockRepos },
                { provide: StoreRepository, useValue: mockRepos },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
        mockInventoryRepository = module.get(InventoryRepository);
        mockInventoryDetailRepository = module.get(InventoryDetailRepository);
        mockClassificationRepo = module.get(ClassificationAttributeRelationshipRepository);
        mockProductRepository = module.get(ProductRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('getTotalQuantityStock', () => {
        it('should return sum of detail quantities when details exist', async () => {
            try {
                const mockDetails = [
                    { quantity_stock: 50 } as InventoryDetailEntity,
                    { quantity_stock: 30 } as InventoryDetailEntity,
                ];
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue(
                    mockDetails,
                );
                const result = await service.getTotalQuantityStock(1);
                expect(result).toBe(80);
                expect(
                    mockInventoryDetailRepository.findByInventoryId,
                ).toHaveBeenCalledWith(1);
                console.log('✅ getTotalQuantityStock với details thành công');
            } catch (error) {
                console.error('❌ getTotalQuantityStock với details thất bại', error);
                throw error;
            }
        });

        it('should return inventory quantity_stock when no details exist', async () => {
            try {
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]);
                const result = await service.getTotalQuantityStock(1, mockInventory);
                expect(result).toBe(100);
                console.log('✅ getTotalQuantityStock không có details thành công');
            } catch (error) {
                console.error('❌ getTotalQuantityStock không có details thất bại', error);
                throw error;
            }
        });

        it('should return 0 when no details and no inventory provided', async () => {
            try {
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]);
                const result = await service.getTotalQuantityStock(1);
                expect(result).toBe(0);
                console.log('✅ getTotalQuantityStock không có details và inventory thành công');
            } catch (error) {
                console.error('❌ getTotalQuantityStock không có details và inventory thất bại', error);
                throw error;
            }
        });
    });

    describe('getTotalQuantitySold', () => {
        it('should return sum of detail quantities sold when details exist', async () => {
            try {
                const mockDetails = [
                    { quantity_sold: 20 } as InventoryDetailEntity,
                    { quantity_sold: 15 } as InventoryDetailEntity,
                ];
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue(
                    mockDetails,
                );
                const result = await service.getTotalQuantitySold(1);
                expect(result).toBe(35);
                console.log('✅ getTotalQuantitySold với details thành công');
            } catch (error) {
                console.error('❌ getTotalQuantitySold với details thất bại', error);
                throw error;
            }
        });

        it('should return inventory quantity_sold when no details exist', async () => {
            try {
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue([]);
                const result = await service.getTotalQuantitySold(1, mockInventory);
                expect(result).toBe(10);
                console.log('✅ getTotalQuantitySold không có details thành công');
            } catch (error) {
                console.error('❌ getTotalQuantitySold không có details thất bại', error);
                throw error;
            }
        });
    });

    describe('getInventoryDetails', () => {
        it('should return inventory details when found', async () => {
            try {
                const mockInventoryDetails = [
                    {
                        id: 1,
                        classification_attribute_relationship_id: 1,
                        quantity_stock: 50,
                        quantity_sold: 5,
                    } as InventoryDetailEntity,
                ];
                mockInventoryRepository.findById.mockResolvedValue(mockInventory);
                mockInventoryDetailRepository.findByInventoryId.mockResolvedValue(mockInventoryDetails);
                const result = await service.getInventoryDetails(1);
                expect(result).toBeDefined();
                expect(result.inventory).toEqual(mockInventory);
                expect(result.inventory_details).toHaveLength(1);
                expect(mockInventoryRepository.findById).toHaveBeenCalledWith(1);
                console.log('✅ getInventoryDetails thành công');
            } catch (error) {
                console.error('❌ getInventoryDetails thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException when inventory not found', async () => {
            try {
                mockInventoryRepository.findById.mockResolvedValue(null);
                await expect(service.getInventoryDetails(999)).rejects.toThrow(NotFoundException);
                console.log('✅ getInventoryDetails not found thành công');
            } catch (error) {
                console.error('❌ getInventoryDetails not found thất bại', error);
                throw error;
            }
        });
    });

    describe('delete', () => {
        it('should delete inventory successfully', async () => {
            try {
                const mockProduct = { id: 1, total_quantity_divided: 100 };
                mockInventoryRepository.findById.mockResolvedValue(mockInventory);
                mockInventoryRepository.softDelete.mockResolvedValue(undefined);
                mockProductRepository.findById.mockResolvedValue(mockProduct);
                mockProductRepository.update.mockResolvedValue(undefined);
                mockClassificationRepo.findByProductId.mockResolvedValue([]);
                mockInventoryDetailRepository.deleteByInventoryId.mockResolvedValue(
                    undefined,
                );
                const result = await service.delete(1);
                expect(result.deleted).toBe(true);
                expect(mockInventoryRepository.softDelete).toHaveBeenCalledWith(1);
                console.log('✅ delete inventory thành công');
            } catch (error) {
                console.error('❌ delete inventory thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException when inventory not found for deletion', async () => {
            try {
                mockInventoryRepository.findById.mockResolvedValue(null);
                await expect(service.delete(999)).rejects.toThrow(NotFoundException);
                console.log('✅ delete inventory not found thành công');
            } catch (error) {
                console.error('❌ delete inventory not found thất bại', error);
                throw error;
            }
        });
    });
});