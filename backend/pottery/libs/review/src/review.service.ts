import { ReviewEntity, ReviewRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateReview, IListReview, IUpdateReview } from './review.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class ReviewService {
    constructor(
        private readonly reviewRepository: ReviewRepository,
    ) { }

    async create(data: ICreateReview): Promise<{ message: string, review: ReviewEntity | null }> {
        const existing = await this.reviewRepository.findByOrderItemId(data.orderitem_id);
        if (existing) {
            return {
                message: 'Review for this order item already exists',
                review: null,
            };
        }
        try {
            const review = await this.reviewRepository.create({
                rating: data.rating,
                comment: data.comment,
                customer_id: data.customer_id,
                orderitem_id: data.orderitem_id,
            });
            return {
                message: 'Review created successfully',
                review,
            };
        } catch (error) {
            return {
                message: 'Failed to create review',
                review: null,
            };
        }
    }

    async findAll(params: IListReview): Promise<{ message: string, reviews: any[] }> {
        const reviews = await this.reviewRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: reviews.length > 0 ? 'Reviews fetched successfully' : 'No reviews found',
            reviews,
        };
    }

    async findByProductId(productId: number): Promise<{ message: string, reviews: any[] }> {
        const reviews = await this.reviewRepository.findByProductId(productId);
        return {
            message: reviews.length > 0 ? 'Reviews fetched successfully' : 'No reviews found',
            reviews,
        };
    }

    async findOne(id: number): Promise<{ message: string, review: ReviewEntity }> {
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        return {
            message: 'Review fetched successfully',
            review,
        };
    }

    async update(id: number, data: IUpdateReview): Promise<{ message: string, review: ReviewEntity }> {
        await this.reviewRepository.update(id, data);
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        return {
            message: 'Review updated successfully',
            review,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        await this.reviewRepository.softDelete(id);
        return { message: 'Review deleted successfully' };
    }
}
