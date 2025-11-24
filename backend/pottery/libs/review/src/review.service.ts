import { ReviewEntity, ReviewRepository } from '@app/database';
import { ReviewImageRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateReview, IListReview, IUpdateReview } from './review.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class ReviewService {
    constructor(
        private readonly reviewRepository: ReviewRepository,
        private readonly reviewImageRepository: ReviewImageRepository,
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
            if (data.images && data.images.length > 0) {
                await this.reviewImageRepository.createMany(
                    data.images.map(img => ({ review_id: review.id, image_review: img }))
                );
            }
            const images = await this.reviewImageRepository.findByReviewId(review.id);
            (review as any).image_review = images.map(img => ({ id: img.id, image_review: img.image_review }));
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
        for (const group of reviews) {
            // Chuyển đổi avatar_image sang base64 nếu là Buffer
            if (group.customer && group.customer.avatar_image) {
                group.customer.avatar_image = Buffer.isBuffer(group.customer.avatar_image)
                    ? group.customer.avatar_image.toString('base64')
                    : group.customer.avatar_image;
            }
            for (const review of group.review) {
                const images = await this.reviewImageRepository.findByReviewId(review.id);
                review.image_review = images.map(img => ({
                    id: img.id,
                    image: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
                }));
            }
        }
        return {
            message: reviews.length > 0 ? 'Reviews fetched successfully' : 'No reviews found',
            reviews,
        };
    }

    async findByProductId(productId: number): Promise<{ message: string, reviews: any[] }> {
        const reviews = await this.reviewRepository.findByProductId(productId);
        for (const review of reviews) {
            // Chuyển đổi avatar_image sang base64 nếu là Buffer
            if (review.customer && review.customer.avatar_image) {
                review.customer.avatar_image = Buffer.isBuffer(review.customer.avatar_image)
                    ? review.customer.avatar_image.toString('base64')
                    : review.customer.avatar_image;
            }
            const images = await this.reviewImageRepository.findByReviewId(review.review.id);
            review.review.image_review = images.map(img => ({
                id: img.id,
                image: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
            }));
        }
        return {
            message: reviews.length > 0 ? 'Reviews fetched successfully' : 'No reviews found',
            reviews,
        };
    }

    async findOne(id: number): Promise<{ message: string, review: ReviewEntity }> {
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        const images = await this.reviewImageRepository.findByReviewId(id);
        (review as any).image_review = images.map(img => ({
            id: img.id,
            image: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
        }));
        // Chuyển đổi avatar_image sang base64 nếu là Buffer
        if ((review as any).customer && (review as any).customer.avatar_image) {
            (review as any).customer.avatar_image = Buffer.isBuffer((review as any).customer.avatar_image)
                ? (review as any).customer.avatar_image.toString('base64')
                : (review as any).customer.avatar_image;
        }
        return {
            message: 'Review fetched successfully',
            review,
        };
    }

    async update(id: number, data: IUpdateReview): Promise<{ message: string, review: ReviewEntity }> {
        await this.reviewRepository.update(id, data);
        if (data.images) {
            await this.reviewImageRepository.deleteByReviewId(id);
            await this.reviewImageRepository.createMany(
                data.images.map(img => ({ review_id: id, image_review: img }))
            );
        }
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        const images = await this.reviewImageRepository.findByReviewId(id);
        (review as any).image_review = images.map(img => ({ id: img.id, image_review: img.image_review }));
        return {
            message: 'Review updated successfully',
            review,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const review = await this.reviewRepository.findById(id);
        if (!review) throw new NotFoundException('Review not found');
        await this.reviewRepository.softDelete(id);
        await this.reviewImageRepository.deleteByReviewId(id);
        return { message: 'Review deleted successfully' };
    }
}
