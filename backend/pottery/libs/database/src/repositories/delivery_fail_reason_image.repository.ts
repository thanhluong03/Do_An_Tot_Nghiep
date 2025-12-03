import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { DeliveryFailImageEntity } from '../entities/delivery_fail_image.entity'

@Injectable()
export class DeliveryFailReasonImageRepository {
    constructor(
        @InjectRepository(DeliveryFailImageEntity)
        private readonly repository: Repository<DeliveryFailImageEntity>,
    ) { }

    async create(data: Partial<DeliveryFailImageEntity>): Promise<DeliveryFailImageEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<DeliveryFailImageEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findByOrderId(order_id: number): Promise<DeliveryFailImageEntity[]> {
        return this.repository.find({
            where: { order_id, deleted_at: IsNull() },
        })
    }

    async deleteByOrderId(order_id: number): Promise<void> {
        await this.repository.softDelete({ order_id })
    }

    async update(id: number, data: Partial<DeliveryFailImageEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}