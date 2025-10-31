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

    async findAll(params: { size: number; page: number; key?: string; start_date?: string; end_date?: string }): Promise<CustomerEntity[]> {
        const query = this.repository.createQueryBuilder('customer');
        query.where('customer.deleted_at IS NULL');

        if (params.start_date) {
            query.andWhere('customer.created_at >= :start_date', { start_date: params.start_date });
        }

        if (params.end_date) {
            const endDatePlusOne = new Date(params.end_date);
            endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
            query.andWhere('customer.created_at < :end_date', {
                end_date: endDatePlusOne.toISOString().split('T')[0]
            });
        }

        if (params.key) {
            query.andWhere(
                '(customer.username LIKE :key OR customer.full_name LIKE :key OR customer.email LIKE :key)',
                { key: `%${params.key}%` }
            );
        }

        query.orderBy('customer.created_at', 'DESC');
        return query.getMany();
    }

    async update(id: number, data: Partial<CustomerEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}