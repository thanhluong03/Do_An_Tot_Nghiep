import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSaleCustomerEntity } from '../entities/flash_sale_customer.entity';

@Injectable()
export class FlashSaleCustomerRepository {
    constructor(
        @InjectRepository(FlashSaleCustomerEntity)
        private readonly repository: Repository<FlashSaleCustomerEntity>,
    ) { }

    async create(data: Partial<FlashSaleCustomerEntity>): Promise<FlashSaleCustomerEntity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findByUserAndFlashSale(customerId: number, flashSaleId: number): Promise<FlashSaleCustomerEntity | null> {
        return await this.repository.findOne({
            where: {
                customer_id: customerId,
                flash_sale_id: flashSaleId,
            },
        });
    }

    async findById(id: number): Promise<FlashSaleCustomerEntity | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['flash_sale', 'user'],
        });
    }

    async findAll(params: {
        page?: number;
        size?: number;
        customerId?: number;
        flashSaleId?: number;
    }): Promise<FlashSaleCustomerEntity[]> {
        const query = this.repository.createQueryBuilder('fsp')
            .leftJoinAndSelect('fsp.flash_sale', 'fs')
            .leftJoinAndSelect('fsp.customer', 'c');

        if (params.customerId) {
            query.andWhere('fsp.customer_id = :customerId', { customerId: params.customerId });
        }

        if (params.flashSaleId) {
            query.andWhere('fsp.flash_sale_id = :flashSaleId', { flashSaleId: params.flashSaleId });
        }

        if (params.page && params.size) {
            query.skip((params.page - 1) * params.size).take(params.size);
        }

        return await query.getMany();
    }

    async update(id: number, data: Partial<FlashSaleCustomerEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}