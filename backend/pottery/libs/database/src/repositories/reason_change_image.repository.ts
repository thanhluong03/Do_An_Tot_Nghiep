import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ReasonChangeImageEntity } from '../entities/reason_change_image.entity'

@Injectable()
export class ReasonChangeImageRepository {
    constructor(
        @InjectRepository(ReasonChangeImageEntity)
        private readonly repository: Repository<ReasonChangeImageEntity>,
    ) { }

    async create(data: Partial<ReasonChangeImageEntity>): Promise<ReasonChangeImageEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<ReasonChangeImageEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findByOrderId(order_id: number): Promise<ReasonChangeImageEntity[]> {
        return this.repository.find({
            where: { order_id, deleted_at: IsNull() },
        })
    }

    async deleteByOrderId(order_id: number): Promise<void> {
        await this.repository.softDelete({ order_id })
    }

    async update(id: number, data: Partial<ReasonChangeImageEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}