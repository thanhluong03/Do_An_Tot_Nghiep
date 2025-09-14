import { PromotionEntity, PromotionRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreatePromotion, IListPromotion, IUpdatePromotion } from './promotion.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class PromotionService {
    constructor(
        private readonly promotionRepository: PromotionRepository,
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
}
