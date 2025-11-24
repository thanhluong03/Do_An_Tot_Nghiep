
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProofService } from './delivery_proof.service';
import { DeliveryProofRepository } from '../../database/src/repositories/delivery_proof.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeliveryProofService', () => {
    let service: DeliveryProofService;
    let mockDeliveryProofRepository: jest.Mocked<DeliveryProofRepository>;

    const createMockDeliveryProof = (overrides: any = {}) => ({
        id: 1,
        image: Buffer.from('test'),
        captured_at: new Date(),
        order_id: 1,
        ...overrides,
    });

    beforeEach(async () => {
        mockDeliveryProofRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeliveryProofService,
                { provide: DeliveryProofRepository, useValue: mockDeliveryProofRepository },
            ],
        }).compile();

        service = module.get<DeliveryProofService>(DeliveryProofService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('getDeliveryProofs', () => {
        it('should return formatted delivery proofs with success message', async () => {
            try {
                const mockProofs = [createMockDeliveryProof(), createMockDeliveryProof({ id: 2 })];
                mockDeliveryProofRepository.findAll.mockResolvedValue(mockProofs);
                const result = await service.getDeliveryProofs({ page: 1, size: 10 });
                expect(result.message).toBe('Delivery proofs fetched successfully');
                expect(result.deliveryProofs.length).toBe(2);
                console.log('✅ Get delivery proofs thành công');
            } catch (error) {
                console.error('❌ Get delivery proofs thất bại', error);
                throw error;
            }
        });

        it('should return no delivery proofs found message when empty', async () => {
            try {
                mockDeliveryProofRepository.findAll.mockResolvedValue([]);
                const result = await service.getDeliveryProofs({ page: 1, size: 10 });
                expect(result.message).toBe('No delivery proofs found');
                expect(result.deliveryProofs).toEqual([]);
                console.log('✅ No delivery proofs found thành công');
            } catch (error) {
                console.error('❌ No delivery proofs found thất bại', error);
                throw error;
            }
        });
    });

    describe('createDeliveryProof', () => {
        it('should create delivery proof successfully', async () => {
            try {
                const data = { image: Buffer.from('test'), order_id: 1 };
                const mockProof = createMockDeliveryProof(data);
                mockDeliveryProofRepository.create.mockResolvedValue(mockProof);
                const result = await service.createDeliveryProof(data);
                expect(result.message).toBe('Delivery proof created successfully');
                expect(result.deliveryProof).toEqual(mockProof);
                console.log('✅ Create delivery proof thành công');
            } catch (error) {
                console.error('❌ Create delivery proof thất bại', error);
                throw error;
            }
        });

        it('should return error message when creation fails', async () => {
            try {
                const data = { image: Buffer.from('test'), order_id: 1 };
                mockDeliveryProofRepository.create.mockRejectedValue(new Error('DB error'));
                const result = await service.createDeliveryProof(data);
                expect(result.message).toBe('Failed to create delivery proof');
                expect(result.deliveryProof).toBeNull();
                console.log('✅ Create delivery proof error handling thành công');
            } catch (error) {
                console.error('❌ Create delivery proof error handling thất bại', error);
                throw error;
            }
        });
    });

    describe('updateDeliveryProof', () => {
        it('should update delivery proof successfully', async () => {
            try {
                const id = 1;
                const updateData = { order_id: 2 };
                const mockProof = createMockDeliveryProof();
                const updatedProof = createMockDeliveryProof({ ...updateData });
                mockDeliveryProofRepository.findById.mockResolvedValueOnce(mockProof).mockResolvedValueOnce(updatedProof);
                mockDeliveryProofRepository.update.mockResolvedValue(undefined);
                const result = await service.updateDeliveryProof(id, updateData);
                expect(mockDeliveryProofRepository.update).toHaveBeenCalledWith(id, updateData);
                expect(result).toEqual(updatedProof);
                console.log('✅ Update delivery proof thành công');
            } catch (error) {
                console.error('❌ Update delivery proof thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException when delivery proof not found', async () => {
            try {
                const id = 999;
                const updateData = { order_id: 2 };
                mockDeliveryProofRepository.findById.mockResolvedValue(null);
                await expect(service.updateDeliveryProof(id, updateData)).rejects.toThrow(
                    new NotFoundException(`Delivery proof with id ${id} not found`)
                );
                console.log('✅ Update delivery proof not found error thành công');
            } catch (error) {
                console.error('❌ Update delivery proof not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('deleteDeliveryProof', () => {
        it('should delete delivery proof successfully', async () => {
            try {
                const id = 1;
                const mockProof = createMockDeliveryProof();
                mockDeliveryProofRepository.findById.mockResolvedValue(mockProof);
                mockDeliveryProofRepository.softDelete.mockResolvedValue(undefined);
                const result = await service.deleteDeliveryProof(id);
                expect(mockDeliveryProofRepository.softDelete).toHaveBeenCalledWith(id);
                expect(result.success).toBe(true);
                expect(result.message).toBe('Delivery proof deleted successfully');
                console.log('✅ Delete delivery proof thành công');
            } catch (error) {
                console.error('❌ Delete delivery proof thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException when delivery proof not found for deletion', async () => {
            try {
                const id = 999;
                mockDeliveryProofRepository.findById.mockResolvedValue(null);
                await expect(service.deleteDeliveryProof(id)).rejects.toThrow(
                    new NotFoundException(`Delivery proof with id ${id} not found`)
                );
                console.log('✅ Delete delivery proof not found error thành công');
            } catch (error) {
                console.error('❌ Delete delivery proof not found error thất bại', error);
                throw error;
            }
        });
    });

    describe('getDeliveryProofById', () => {
        it('should return delivery proof when found', async () => {
            try {
                const id = 1;
                const mockProof = createMockDeliveryProof();
                mockDeliveryProofRepository.findById.mockResolvedValue(mockProof);
                const result = await service.getDeliveryProofById(id);
                expect(result).toEqual(mockProof);
                console.log('✅ Get delivery proof by ID thành công');
            } catch (error) {
                console.error('❌ Get delivery proof by ID thất bại', error);
                throw error;
            }
        });

        it('should throw NotFoundException when delivery proof not found', async () => {
            try {
                const id = 999;
                mockDeliveryProofRepository.findById.mockResolvedValue(null);
                await expect(service.getDeliveryProofById(id)).rejects.toThrow(
                    new NotFoundException(`Delivery proof with id ${id} not found`)
                );
                console.log('✅ Get delivery proof by ID not found error thành công');
            } catch (error) {
                console.error('❌ Get delivery proof by ID not found error thất bại', error);
                throw error;
            }
        });
    });
});
