import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { NewsEntity } from '../entities/new.entity'

@Injectable()
export class NewsRepository {
    constructor(
        @InjectRepository(NewsEntity)
        private readonly repository: Repository<NewsEntity>,
    ) { }

    async create(data: Partial<NewsEntity>): Promise<NewsEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<NewsEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<NewsEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<NewsEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}