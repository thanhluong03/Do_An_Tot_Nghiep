import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { CancelReasonImageEntity } from '../entities/cancel_reason_image.entity'

@Injectable()
export class CancelReasonImageRepository {
    constructor(
        @InjectRepository(CancelReasonImageEntity)
        private readonly repository: Repository<CancelReasonImageEntity>,
    ) { }

    async create(data: Partial<CancelReasonImageEntity>): Promise<CancelReasonImageEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<CancelReasonImageEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findByOrderId(order_id: number): Promise<CancelReasonImageEntity[]> {
        return this.repository.find({
            where: { order_id, deleted_at: IsNull() },
        })
    }

    async deleteByOrderId(order_id: number): Promise<void> {
        await this.repository.softDelete({ order_id })
    }

    async update(id: number, data: Partial<CancelReasonImageEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}