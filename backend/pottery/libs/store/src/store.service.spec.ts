import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import {
    StoreRepository,
    StoreEntity,
    InventoryRepository,
    InventoryDetailRepository,
    ProductRepository,
    ClassificationAttributeRelationshipRepository
} from '@app/database';
import { NotFoundException } from '@nestjs/common';

describe('StoreService', () => {
    let service: StoreService;
    let mockStoreRepository: jest.Mocked<StoreRepository>;
    let mockInventoryRepository: jest.Mocked<InventoryRepository>;
    let mockInventoryDetailRepository: jest.Mocked<InventoryDetailRepository>;
    let mockProductRepository: jest.Mocked<ProductRepository>;
    let mockClassificationAttributeRelationshipRepository: jest.Mocked<ClassificationAttributeRelationshipRepository>;

    const createMockStore = (overrides: Partial<StoreEntity> = {}): StoreEntity => ({
        id: 1,
        store_name: 'Test Store',
        address: 'Test Address',
        phone: '0123456789',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: [],
        inventories: [],
        ...overrides,
    } as StoreEntity);

    beforeEach(async () => {
        mockStoreRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        mockInventoryRepository = {} as any;
        mockInventoryDetailRepository = {} as any;
        mockProductRepository = {} as any;
        mockClassificationAttributeRelationshipRepository = {} as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoreService,
                { provide: StoreRepository, useValue: mockStoreRepository },
                { provide: InventoryRepository, useValue: mockInventoryRepository },
                { provide: InventoryDetailRepository, useValue: mockInventoryDetailRepository },
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockClassificationAttributeRelationshipRepository },
            ],
        }).compile();

        service = module.get<StoreService>(StoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('StoreService khởi tạo thành công');
    });

    describe('create', () => {
        it('should create store successfully', async () => {
            const createData = {
                store_name: 'New Store',
                address: 'New Address',
                phone: '0123456789',
            };
            const mockStore = createMockStore(createData);
            mockStoreRepository.create.mockResolvedValue(mockStore);

            const result = await service.create(createData);

            expect(mockStoreRepository.create).toHaveBeenCalledWith({
                store_name: createData.store_name,
                address: createData.address,
                phone: createData.phone,
            });
            expect(result.message).toBe('Store created successfully');
            expect(result.store).toEqual(mockStore);
            console.log('Tạo cửa hàng thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                store_name: 'New Store',
                address: 'New Address',
                phone: '0123456789',
            };
            mockStoreRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create store');
            expect(result.store).toBeNull();
            console.log('Tạo cửa hàng thất bại');
        });
    });

    describe('findAll', () => {
        it('should return stores with success message', async () => {
            const mockStores = [
                createMockStore({ store_name: 'Store 1' }),
                createMockStore({ id: 2, store_name: 'Store 2' }),
            ];
            mockStoreRepository.findAll.mockResolvedValue(mockStores);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('Stores fetched successfully');
            expect(result.stores).toEqual(mockStores);
            console.log('Lấy danh sách cửa hàng thành công');
        });

        it('should return no stores found message when empty', async () => {
            mockStoreRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('No stores found');
            expect(result.stores).toEqual([]);
            console.log('Không tìm thấy cửa hàng nào');
        });
    });

    describe('findOne', () => {
        it('should return store when found', async () => {
            const storeId = 1;
            const mockStore = createMockStore({ id: storeId });
            mockStoreRepository.findById.mockResolvedValue(mockStore);

            const result = await service.findOne(storeId);

            expect(result.message).toBe('Store fetched successfully');
            expect(result.store).toEqual(mockStore);
            console.log('Tìm cửa hàng thành công');
        });

        it('should throw NotFoundException when store not found', async () => {
            const storeId = 999;
            mockStoreRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(storeId)).rejects.toThrow(
                new NotFoundException('Store not found')
            );
            console.log('Không tìm thấy cửa hàng');
        });
    });
});
