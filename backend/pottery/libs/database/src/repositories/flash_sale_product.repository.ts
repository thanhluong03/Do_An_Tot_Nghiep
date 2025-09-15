import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSaleProductEntity } from '../entities/flash_sale_product.entity';

@Injectable()
export class FlashSaleProductRepository {
    constructor(
        @InjectRepository(FlashSaleProductEntity)
        private readonly repository: Repository<FlashSaleProductEntity>,
    ) { }

    async create(data: Partial<FlashSaleProductEntity>): Promise<FlashSaleProductEntity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findByUserAndFlashSale(userId: number, flashSaleId: number): Promise<FlashSaleProductEntity | null> {
        return await this.repository.findOne({
            where: {
                user_id: userId,
                flash_sale_id: flashSaleId,
            },
        });
    }

    async findById(id: number): Promise<FlashSaleProductEntity | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['flash_sale', 'user'],
        });
    }

    async findAll(params: {
        page?: number;
        size?: number;
        userId?: number;
        flashSaleId?: number;
    }): Promise<FlashSaleProductEntity[]> {
        const query = this.repository.createQueryBuilder('fsp')
            .leftJoinAndSelect('fsp.flash_sale', 'fs')
            .leftJoinAndSelect('fsp.user', 'u');

        if (params.userId) {
            query.andWhere('fsp.user_id = :userId', { userId: params.userId });
        }

        if (params.flashSaleId) {
            query.andWhere('fsp.flash_sale_id = :flashSaleId', { flashSaleId: params.flashSaleId });
        }

        if (params.page && params.size) {
            query.skip((params.page - 1) * params.size).take(params.size);
        }

        return await query.getMany();
    }

    async update(id: number, data: Partial<FlashSaleProductEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}