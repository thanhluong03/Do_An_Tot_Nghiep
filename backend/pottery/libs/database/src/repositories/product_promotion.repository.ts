import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductPromotionEntity } from '../entities/product_promotion.entity';

@Injectable()
export class ProductPromotionRepository {
    constructor(
        @InjectRepository(ProductPromotionEntity)
        private readonly repository: Repository<ProductPromotionEntity>,
    ) { }

    async createMany(data: Partial<ProductPromotionEntity>[]): Promise<ProductPromotionEntity[]> {
        return this.repository.save(data.map(d => this.repository.create(d)));
    }

    async findOne(options: any): Promise<ProductPromotionEntity | null> {
        return this.repository.findOne(options);
    }

    async findAll(): Promise<ProductPromotionEntity[]> {
        return this.repository.find({
            relations: ['product', 'promotion'],
            where: { deleted_at: IsNull() },
        });
    }

    async findByProductId(productId: number): Promise<ProductPromotionEntity[]> {
        return this.repository.find({
            where: {
                product_id: productId,
                deleted_at: IsNull()
            },
            relations: ['promotion'],
        });
    }

    async findByPromotionId(promotionId: number): Promise<ProductPromotionEntity[]> {
        return this.repository.find({
            where: {
                promotion_id: promotionId,
                deleted_at: IsNull()
            },
            relations: ['product'],
        });
    } async deleteByProductAndPromotion(productId: number, promotionId: number): Promise<void> {
        await this.repository.softDelete({
            product_id: productId,
            promotion_id: promotionId
        });
    }

    async softDeleteByProductId(productId: number): Promise<void> {
        await this.repository.softDelete({ product_id: productId });
    }

    async softDeleteAll(): Promise<void> {
        const activeRecords = await this.repository.find({
            where: { deleted_at: IsNull() }
        });

        if (activeRecords.length > 0) {
            const ids = activeRecords.map(record => record.id);
            await this.repository.softDelete(ids);
        }
    }

    async findActiveByProductId(productId: number): Promise<ProductPromotionEntity | null> {
        return this.repository.findOne({
            where: {
                product_id: productId,
                deleted_at: IsNull()
            },
            relations: ['promotion'],
        });
    }

    async updatePromotionForProduct(productId: number, newPromotionId: number): Promise<void> {
        await this.repository.update(
            {
                product_id: productId,
                deleted_at: IsNull()
            },
            {
                promotion_id: newPromotionId,
                updated_at: new Date()
            }
        );
    } async save(entity: ProductPromotionEntity): Promise<ProductPromotionEntity> {
        return this.repository.save(entity);
    }
}
