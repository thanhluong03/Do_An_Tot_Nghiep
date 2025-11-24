import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ReviewEntity } from './review.entity'

@Entity('review_images')
export class ReviewImageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    review_id: number

    @Column({ type: 'bytea', nullable: true })
    image_review: Buffer

    @ManyToOne(() => ReviewEntity, (review) => review.review_images)
    @JoinColumn({ name: 'review_id' })
    review: ReviewEntity;
}
