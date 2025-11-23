import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import {
    SupplierRepository,
    SupplierEntity,
    ProductRepository,
    ClassificationAttributeRelationshipRepository
} from '@app/database';
import { NotFoundException } from '@nestjs/common';

describe('SupplierService', () => {
    let service: SupplierService;
    let mockSupplierRepository: jest.Mocked<SupplierRepository>;
    let mockProductRepository: jest.Mocked<ProductRepository>;
    let mockClassificationAttributeRelationshipRepository: jest.Mocked<ClassificationAttributeRelationshipRepository>;

    const createMockSupplier = (overrides: Partial<SupplierEntity> = {}): SupplierEntity => ({
        id: 1,
        name: 'Test Supplier',
        contact_person: 'Test Contact',
        email: 'test@supplier.com',
        phone: '0123456789',
        address: 'Test Address',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        products: [],
        importProducts: [],
        ...overrides,
    } as SupplierEntity);

    beforeEach(async () => {
        mockSupplierRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        mockProductRepository = {
            findBySupplier: jest.fn(),
            save: jest.fn(),
        } as any;

        mockClassificationAttributeRelationshipRepository = {
            findBy: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SupplierService,
                { provide: SupplierRepository, useValue: mockSupplierRepository },
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockClassificationAttributeRelationshipRepository },
            ],
        }).compile();

        service = module.get<SupplierService>(SupplierService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('create', () => {
        it('should create supplier successfully', async () => {
            const createData = {
                name: 'New Supplier',
                email: 'new@supplier.com',
                phone: '0123456789',
                address: 'New Address',
            };
            const mockSupplier = createMockSupplier(createData);
            mockSupplierRepository.create.mockResolvedValue(mockSupplier);

            const result = await service.create(createData);

            expect(result.message).toBe('Supplier created successfully');
            expect(result.supplier).toEqual(mockSupplier);
            console.log('✅ Create supplier thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                name: 'New Supplier',
                email: 'new@supplier.com',
                phone: '0123456789',
                address: 'New Address',
            };
            mockSupplierRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create supplier');
            expect(result.supplier).toBeNull();
            console.log('✅ Create supplier error handling thành công');
        });
    });

    describe('findAll', () => {
        it('should return suppliers with success message', async () => {
            const mockSuppliers = [
                createMockSupplier({ name: 'Supplier 1' }),
                createMockSupplier({ id: 2, name: 'Supplier 2' }),
            ];
            mockSupplierRepository.findAll.mockResolvedValue(mockSuppliers);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('Suppliers fetched successfully');
            expect(result.suppliers).toEqual(mockSuppliers);
            console.log('✅ Get suppliers thành công');
        });

        it('should return no suppliers found message when empty', async () => {
            mockSupplierRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('No suppliers found');
            expect(result.suppliers).toEqual([]);
            console.log('✅ No suppliers found thành công');
        });
    });

    describe('findOne', () => {
        it('should return supplier when found', async () => {
            const supplierId = 1;
            const mockSupplier = createMockSupplier({ id: supplierId });
            mockSupplierRepository.findById.mockResolvedValue(mockSupplier);

            const result = await service.findOne(supplierId);

            expect(result.message).toBe('Supplier fetched successfully');
            expect(result.supplier).toEqual(mockSupplier);
            console.log('✅ Get supplier by ID thành công');
        });

        it('should throw NotFoundException when supplier not found', async () => {
            const supplierId = 999;
            mockSupplierRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(supplierId)).rejects.toThrow(
                new NotFoundException('Supplier not found')
            );
            console.log('✅ Supplier not found error thành công');
        });
    });

    describe('update', () => {
        it('should update supplier successfully', async () => {
            const supplierId = 1;
            const updateData = { name: 'Updated Supplier' };
            const updatedSupplier = createMockSupplier({ id: supplierId, ...updateData });

            mockSupplierRepository.update.mockResolvedValue(undefined);
            mockSupplierRepository.findById.mockResolvedValue(updatedSupplier);

            const result = await service.update(supplierId, updateData);

            expect(result.message).toBe('Supplier updated successfully');
            expect(result.supplier).toEqual(updatedSupplier);
            console.log('✅ Update supplier thành công');
        });
    });

    describe('softDelete', () => {
        it('should delete supplier successfully', async () => {
            const supplierId = 1;
            const mockSupplier = createMockSupplier({ id: supplierId });

            mockSupplierRepository.findById.mockResolvedValue(mockSupplier);
            mockProductRepository.findBySupplier.mockResolvedValue([]);
            mockClassificationAttributeRelationshipRepository.findBy.mockResolvedValue([]);
            mockSupplierRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.softDelete(supplierId);

            expect(result.message).toBe('Supplier deleted successfully');
            console.log('✅ Delete supplier thành công');
        });
    });
});
