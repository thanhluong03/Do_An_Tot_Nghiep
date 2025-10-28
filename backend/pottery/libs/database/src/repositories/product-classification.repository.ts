import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductClassificationEntity } from '../entities/product_classification.entity';

@Injectable()
export class ProductClassificationRepository {
    constructor(
        @InjectRepository(ProductClassificationEntity)
        private readonly repository: Repository<ProductClassificationEntity>,
    ) { }

    async create(
        data: Partial<ProductClassificationEntity>,
    ): Promise<ProductClassificationEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findByProductId(
        productId: number,
    ): Promise<ProductClassificationEntity[]> {
        return await this.repository.find({
            where: { product_id: productId, deleted_at: IsNull() },
            relations: ['attributes'],
        });
    }

    async findById(id: number): Promise<ProductClassificationEntity | null> {
        return await this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: ['attributes'],
        });
    }

    async createMany(
        data: Partial<ProductClassificationEntity>[],
    ): Promise<ProductClassificationEntity[]> {
        const classifications = this.repository.create(data);
        return await this.repository.save(classifications);
    }

    async deleteByProductId(productId: number): Promise<void> {
        await this.repository.update(
            { product_id: productId },
            { deleted_at: new Date() },
        );
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.update(
            { id },
            { deleted_at: new Date() },
        );
    }

    async update(id: number, data: Partial<ProductClassificationEntity>): Promise<void> {
        await this.repository.update({ id }, data);
    }
}