import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReviewEntity } from './review.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {

    @Column({ type: 'int', nullable: false })
    order_id: number

    @Column({ type: 'int', nullable: false })
    product_id: number

    @Column({ type: 'int', nullable: true })
    quantity: number

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_at_order: number

    @OneToMany(() => ReviewEntity, review => review.order_item)
    reviews: ReviewEntity[];
}