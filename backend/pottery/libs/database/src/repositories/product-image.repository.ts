import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductImageEntity } from '../entities/product_image.entity';

@Injectable()
export class ProductImageRepository {
    constructor(
        @InjectRepository(ProductImageEntity)
        private readonly repository: Repository<ProductImageEntity>,
    ) { }

    async create(data: Partial<ProductImageEntity>): Promise<ProductImageEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async createMany(data: Partial<ProductImageEntity>[]): Promise<ProductImageEntity[]> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<ProductImageEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        });
    }

    async findByProductId(productId: number): Promise<ProductImageEntity[]> {
        return this.repository.find({
            where: { product_id: productId, deleted_at: IsNull() },
            order: { is_main_image: 'DESC', priority: 'ASC', created_at: 'ASC' },
        });
    }

    async findMainImageByProductId(productId: number): Promise<ProductImageEntity | null> {
        return this.repository.findOne({
            where: { product_id: productId, is_main_image: true, deleted_at: IsNull() },
        });
    }

    async update(id: number, data: Partial<ProductImageEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async deleteByProductId(productId: number): Promise<void> {
        await this.repository.update(
            { product_id: productId },
            { deleted_at: new Date() }
        );
    }

    async setMainImage(productId: number, imageId: number): Promise<void> {
        await this.repository.update(
            { product_id: productId },
            { is_main_image: false }
        );
        await this.repository.update(imageId, { is_main_image: true });
    }
}