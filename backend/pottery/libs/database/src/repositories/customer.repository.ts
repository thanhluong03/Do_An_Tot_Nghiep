import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { CustomerEntity } from '../entities/customer.entity'
@Injectable()
export class CustomerRepository {
    constructor(
        @InjectRepository(CustomerEntity)
        private readonly repository: Repository<CustomerEntity>,
    ) { }

    async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<CustomerEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<CustomerEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<CustomerEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}