import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { DeliveryProofEntity } from '../entities/delivery_proof.entity'
@Injectable()
export class DeliveryProofRepository {
    constructor(
        @InjectRepository(DeliveryProofEntity)
        private readonly repository: Repository<DeliveryProofEntity>,
    ) { }

    async create(data: Partial<DeliveryProofEntity>): Promise<DeliveryProofEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<DeliveryProofEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findByOrderId(order_id: number): Promise<DeliveryProofEntity | null> {
        return this.repository.findOne({
            where: { order_id, deleted_at: IsNull() },
        })
    }

    async findByDriverId(driver_id: number): Promise<DeliveryProofEntity | null> {
        return this.repository.findOne({
            where: { driver_id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<DeliveryProofEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<DeliveryProofEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}