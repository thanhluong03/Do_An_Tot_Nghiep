import { PromotionEntity, PromotionRepository, ProductPromotionRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreatePromotion, IListPromotion, IUpdatePromotion } from './promotion.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class PromotionService {
    async softDeleteExpiredPromotions(): Promise<{ message: string, count: number }> {
        const now = new Date();
        const promotions = await this.promotionRepository.findAll({ size: 1000, page: 1 });
        let count = 0;
        for (const promo of promotions) {
            if (promo.end_date && new Date(promo.end_date) < now) {
                await this.promotionRepository.softDelete(promo.id);
                count++;
            }
        }
        return { message: `Đã xóa mềm ${count} promotion hết hạn!`, count };
    }
    constructor(
        private readonly promotionRepository: PromotionRepository,
        private readonly productPromotionRepository: ProductPromotionRepository,
    ) { }

    async create(data: ICreatePromotion): Promise<{ message: string, promotion: PromotionEntity | null }> {
        try {
            const promotion = await this.promotionRepository.create({
                name: data.name,
                description: data.description,
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                start_date: data.start_date,
                end_date: data.end_date,
                is_active: data.is_active,
            });
            return {
                message: 'Promotion created successfully',
                promotion,
            };
        } catch (error) {
            return {
                message: 'Failed to create promotion',
                promotion: null,
            };
        }
    }

    async findAll(params: IListPromotion): Promise<{ message: string, promotions: PromotionEntity[] }> {
        const promotions = await this.promotionRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: promotions.length > 0 ? 'Promotions fetched successfully' : 'No promotions found',
            promotions,
        };
    }

    async findOne(id: number): Promise<{ message: string, promotion: PromotionEntity }> {
        const promotion = await this.promotionRepository.findById(id);
        if (!promotion) throw new NotFoundException('Promotion not found');
        return {
            message: 'Promotion fetched successfully',
            promotion,
        };
    }

    async update(id: number, data: IUpdatePromotion): Promise<{ message: string, promotion: PromotionEntity }> {
        await this.promotionRepository.update(id, data);
        const promotion = await this.promotionRepository.findById(id);
        if (!promotion) throw new NotFoundException('Promotion not found');
        return {
            message: 'Promotion updated successfully',
            promotion,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const promotion = await this.promotionRepository.findById(id);
        if (!promotion) throw new NotFoundException('Promotion not found');
        await this.promotionRepository.softDelete(id);
        return { message: 'Promotion deleted successfully' };
    }


    async getAllProductPromotions() {
        const productPromotions = await this.productPromotionRepository.findAll();
        return productPromotions.map(pp => ({
            productId: pp.product_id,
            promotionId: pp.promotion_id,
            product: pp.product,
            promotion: pp.promotion,
        }));
    }

    async setProductPromotion(assignments: { productId: number, promotionId: number }[]): Promise<{ message: string }> {
        const currentAssignments = await this.productPromotionRepository.findAll();
        const currentProductIds = currentAssignments.map(a => a.product_id);
        const newProductIds = assignments.map(a => a.productId);

        const productsToRemove = currentProductIds.filter(id => !newProductIds.includes(id));
        for (const productId of productsToRemove) {
            await this.productPromotionRepository.softDeleteByProductId(productId);
        }

        for (const newAssignment of assignments) {
            const existingAssignment = currentAssignments.find(
                ca => ca.product_id === newAssignment.productId
            );

            if (newAssignment.promotionId == null) {
                await this.productPromotionRepository.softDeleteByProductId(newAssignment.productId);
                continue;
            }

            if (existingAssignment) {
                if (existingAssignment.promotion_id !== newAssignment.promotionId) {
                    console.log(`Updating promotion for product ${newAssignment.productId}: ${existingAssignment.promotion_id} -> ${newAssignment.promotionId}`);
                    await this.productPromotionRepository.updatePromotionForProduct(
                        newAssignment.productId,
                        newAssignment.promotionId
                    );
                } else {
                    console.log(`Skipping product ${newAssignment.productId} - no change needed`);
                }
            } else {
                await this.productPromotionRepository.createMany([{
                    product_id: newAssignment.productId,
                    promotion_id: newAssignment.promotionId
                }]);
            }
        }

        return { message: `Synced ${assignments.length} product assignments successfully!` };
    }

}
