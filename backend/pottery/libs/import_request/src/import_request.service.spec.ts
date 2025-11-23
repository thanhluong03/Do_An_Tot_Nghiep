
import { Test, TestingModule } from '@nestjs/testing';
import { ImportRequestService } from './import_request.service';
import { ImportRequestRepository, ImportRequestDetailRepository, ProductRepository, ClassificationAttributeRelationshipRepository, InventoryRepository, InventoryDetailRepository } from '@app/database';

describe('ImportRequestService', () => {
    let service: ImportRequestService;
    let mockImportRequestRepository: any;
    let mockImportRequestDetailRepository: any;
    let mockProductRepository: any;
    let mockClassificationRepository: any;
    let mockInventoryRepository: any;
    let mockInventoryDetailRepository: any;

    beforeEach(async () => {
        mockImportRequestRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
        };
        mockImportRequestDetailRepository = {
            create: jest.fn(),
        };
        mockProductRepository = {
            findById: jest.fn(),
        };
        mockClassificationRepository = {
            findById: jest.fn(),
        };
        mockInventoryRepository = {
            findById: jest.fn(),
        };
        mockInventoryDetailRepository = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImportRequestService,
                { provide: ImportRequestRepository, useValue: mockImportRequestRepository },
                { provide: ImportRequestDetailRepository, useValue: mockImportRequestDetailRepository },
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockClassificationRepository },
                { provide: InventoryRepository, useValue: mockInventoryRepository },
                { provide: InventoryDetailRepository, useValue: mockInventoryDetailRepository },
            ],
        }).compile();

        service = module.get<ImportRequestService>(ImportRequestService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('createImportRequest', () => {
        it('should create import request successfully', async () => {
            try {
                mockImportRequestRepository.create.mockResolvedValue({ id: 1 });
                mockImportRequestDetailRepository.create.mockResolvedValue(undefined);
                mockImportRequestRepository.findById.mockResolvedValue({ id: 1 });
                const result = await service.createImportRequest({ store_id: 1, note: 'Test', importRequestDetails: [{ product_id: 1, classification_attribute_relationship_id: 2, requested_quantity: 5 }] });
                expect(result.id).toBe(1);
                console.log('✅ Create import request thành công');
            } catch (error) {
                console.error('❌ Create import request thất bại', error);
                throw error;
            }
        });
    });

    describe('getAllImportRequests', () => {
        it('should get all import requests successfully', async () => {
            try {
                mockImportRequestRepository.findAll.mockResolvedValue([{ id: 1 }]);
                const result = await service.getAllImportRequests({ page: 1, size: 10 });
                expect(result.length).toBeGreaterThanOrEqual(1);
                console.log('✅ Get all import requests thành công');
            } catch (error) {
                console.error('❌ Get all import requests thất bại', error);
                throw error;
            }
        });
    });

    describe('getImportRequestById', () => {
        it('should get import request by id successfully', async () => {
            try {
                mockImportRequestRepository.findById.mockResolvedValue({ id: 1 });
                const result = await service.getImportRequestById(1);
                expect(result.id).toBe(1);
                console.log('✅ Get import request by id thành công');
            } catch (error) {
                console.error('❌ Get import request by id thất bại', error);
                throw error;
            }
        });
    });
});
