import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { FlashSaleEntity } from '../entities/flash_sale.entity'

@Injectable()
export class FlashSaleRepository {
    constructor(
        @InjectRepository(FlashSaleEntity)
        private readonly repository: Repository<FlashSaleEntity>,
    ) { }

    async create(data: Partial<FlashSaleEntity>): Promise<FlashSaleEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<FlashSaleEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<FlashSaleEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<FlashSaleEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}