import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoucherCustomerEntity } from '../entities/voucher_customer.entity';

@Injectable()
export class VoucherCustomerRepository {
    constructor(
        @InjectRepository(VoucherCustomerEntity)
        private readonly repository: Repository<VoucherCustomerEntity>,
    ) { }

    async create(data: Partial<VoucherCustomerEntity>): Promise<VoucherCustomerEntity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findByUserAndVoucher(customerId: number, voucherId: number): Promise<VoucherCustomerEntity | null> {
        return await this.repository.findOne({
            where: {
                customer_id: customerId,
                voucher_id: voucherId,
            },
        });
    }

    async findById(id: number): Promise<VoucherCustomerEntity | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['voucher', 'customer'],
        });
    }

    async findAll(params: {
        page?: number;
        size?: number;
        customerId?: number;
        voucherId?: number;
    }): Promise<VoucherCustomerEntity[]> {
        const query = this.repository.createQueryBuilder('fsp')
            .leftJoinAndSelect('fsp.voucher', 'fs')
            .leftJoinAndSelect('fsp.customer', 'c');

        if (params.customerId) {
            query.andWhere('fsp.customer_id = :customerId', { customerId: params.customerId });
        }

        if (params.voucherId) {
            query.andWhere('fsp.voucher_id = :voucherId', { voucherId: params.voucherId });
        }

        if (params.page && params.size) {
            query.skip((params.page - 1) * params.size).take(params.size);
        }

        return await query.getMany();
    }

    async update(id: number, data: Partial<VoucherCustomerEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}