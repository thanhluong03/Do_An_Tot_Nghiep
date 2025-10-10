
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryProofRepository } from '../../database/src/repositories/delivery_proof.repository';
import { ICreateDeliveryProof, IUpdateDeliveryProof, IListDeliveryProof } from './delivery_proof.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DeliveryProofService {
    constructor(private readonly deliveryProofRepository: DeliveryProofRepository) { }

    async getDeliveryProofs(params: IListDeliveryProof): Promise<{ message: string, deliveryProofs: any[] }> {
        const deliveryProofs = await this.deliveryProofRepository.findAll({
            page: params.page || 1,
            size: params.size || 10,
            key: params.key,
        });
        return {
            message: deliveryProofs.length > 0 ? 'Delivery proofs fetched successfully' : 'No delivery proofs found',
            deliveryProofs,
        };
    }

    async createDeliveryProof(data: ICreateDeliveryProof): Promise<{ message: string, deliveryProof: any | null }> {
        try {
            if (!data.captured_at) {
                data.captured_at = new Date();
            }
            const deliveryProof = await this.deliveryProofRepository.create(data);
            return {
                message: 'Delivery proof created successfully',
                deliveryProof,
            };
        } catch (error) {
            return {
                message: 'Failed to create delivery proof',
                deliveryProof: null,
            };
        }
    }

    async updateDeliveryProof(id: number, data: IUpdateDeliveryProof) {
        const deliveryProof = await this.deliveryProofRepository.findById(id);
        if (!deliveryProof) {
            throw new NotFoundException(`Delivery proof with id ${id} not found`);
        }
        await this.deliveryProofRepository.update(id, data);
        return this.deliveryProofRepository.findById(id);
    }

    async deleteDeliveryProof(id: number) {
        const deliveryProof = await this.deliveryProofRepository.findById(id);
        if (!deliveryProof) {
            throw new NotFoundException(`Delivery proof with id ${id} not found`);
        }
        await this.deliveryProofRepository.softDelete(id);
        return {
            success: true,
            message: 'Delivery proof deleted successfully'
        };
    }

    async getDeliveryProofById(id: number) {
        const deliveryProof = await this.deliveryProofRepository.findById(id);
        if (!deliveryProof) {
            throw new NotFoundException(`Delivery proof with id ${id} not found`);
        }
        return deliveryProof;
    }
}
