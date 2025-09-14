import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { StoreEntity } from '../entities/store.entity'

@Injectable()
export class StoreRepository {
    constructor(
        @InjectRepository(StoreEntity)
        private readonly repository: Repository<StoreEntity>,
    ) { }

    async create(data: Partial<StoreEntity>): Promise<StoreEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<StoreEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<StoreEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<StoreEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}