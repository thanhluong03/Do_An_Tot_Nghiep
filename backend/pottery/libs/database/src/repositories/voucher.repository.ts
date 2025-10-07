import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { VoucherEntity } from '../entities/voucher.entity'

@Injectable()
export class VoucherRepository {
    constructor(
        @InjectRepository(VoucherEntity)
        private readonly repository: Repository<VoucherEntity>,
    ) { }

    async create(data: Partial<VoucherEntity>): Promise<VoucherEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<VoucherEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<VoucherEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<VoucherEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}