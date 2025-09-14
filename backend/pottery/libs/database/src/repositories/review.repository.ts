import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ReviewEntity } from '../entities/review.entity'
import { SupplierEntity } from '../entities'

@Injectable()
export class ReviewRepository {
    constructor(
        @InjectRepository(ReviewEntity)
        private readonly repository: Repository<ReviewEntity>,
    ) { }

    async create(data: Partial<ReviewEntity>): Promise<ReviewEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<ReviewEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<ReviewEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<ReviewEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}