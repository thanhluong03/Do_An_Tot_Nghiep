import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewImageEntity } from '../entities/review_image.entity';

@Injectable()
export class ReviewImageRepository {
    constructor(
        @InjectRepository(ReviewImageEntity)
        private readonly repository: Repository<ReviewImageEntity>,
    ) { }

    async createMany(images: Partial<ReviewImageEntity>[]): Promise<ReviewImageEntity[]> {
        return this.repository.save(images.map(img => this.repository.create(img)));
    }

    async findByReviewId(reviewId: number): Promise<ReviewImageEntity[]> {
        return this.repository.find({ where: { review_id: reviewId } });
    }

    async deleteByReviewId(reviewId: number): Promise<void> {
        await this.repository.delete({ review_id: reviewId });
    }
}
