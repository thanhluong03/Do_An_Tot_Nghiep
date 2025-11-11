import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
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
        // Loại bỏ các bản ghi có product hoặc promotion bị xóa mềm
        return this.repository.createQueryBuilder('product_promotion')
            .leftJoinAndSelect('product_promotion.product', 'product')
            .leftJoinAndSelect('product_promotion.promotion', 'promotion')
            .where('product_promotion.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('promotion.deleted_at IS NULL')
            .andWhere('product.id IS NOT NULL')
            .andWhere('promotion.id IS NOT NULL')
            .getMany();
    }

    async findByProductId(productId: number): Promise<ProductPromotionEntity[]> {
        // Loại bỏ các bản ghi có product hoặc promotion bị xóa mềm
        return this.repository.createQueryBuilder('product_promotion')
            .leftJoinAndSelect('product_promotion.product', 'product')
            .leftJoinAndSelect('product_promotion.promotion', 'promotion')
            .where('product_promotion.product_id = :productId', { productId })
            .andWhere('product_promotion.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('promotion.deleted_at IS NULL')
            .andWhere('product.id IS NOT NULL')
            .andWhere('promotion.id IS NOT NULL')
            .getMany();
    }
    // ✅ THÊM HÀM findByProductIds VÀO ĐÂY
    async findByProductIds(productIds: number[]): Promise<ProductPromotionEntity[]> {
        // Loại bỏ các bản ghi có product hoặc promotion bị xóa mềm
        return this.repository.createQueryBuilder('product_promotion')
            .leftJoinAndSelect('product_promotion.product', 'product')
            .leftJoinAndSelect('product_promotion.promotion', 'promotion')
            .where('product_promotion.product_id IN (:...productIds)', { productIds })
            .andWhere('product_promotion.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('promotion.deleted_at IS NULL')
            .andWhere('product.id IS NOT NULL')
            .andWhere('promotion.id IS NOT NULL')
            .getMany();
    }

    async findByPromotionId(promotionId: number): Promise<ProductPromotionEntity[]> {
        // Loại bỏ các bản ghi có product hoặc promotion bị xóa mềm
        return this.repository.createQueryBuilder('product_promotion')
            .leftJoinAndSelect('product_promotion.product', 'product')
            .leftJoinAndSelect('product_promotion.promotion', 'promotion')
            .where('product_promotion.promotion_id = :promotionId', { promotionId })
            .andWhere('product_promotion.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('promotion.deleted_at IS NULL')
            .andWhere('product.id IS NOT NULL')
            .andWhere('promotion.id IS NOT NULL')
            .getMany();
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
