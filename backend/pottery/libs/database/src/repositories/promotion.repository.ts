import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { PromotionEntity } from '../entities/promotion.entity'

@Injectable()
export class PromotionRepository {
    constructor(
        @InjectRepository(PromotionEntity)
        private readonly repository: Repository<PromotionEntity>,
    ) { }

    async create(data: Partial<PromotionEntity>): Promise<PromotionEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<PromotionEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<PromotionEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<PromotionEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}