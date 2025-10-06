import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { CategoryEntity } from '../entities/category.entity'

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly repository: Repository<CategoryEntity>,
    ) { }

    async create(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<CategoryEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<CategoryEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<CategoryEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}