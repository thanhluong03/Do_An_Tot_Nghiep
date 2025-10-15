import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderItemEntity } from './order_item.entity'

@Entity('reviews')
export class ReviewEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'integer', nullable: false })
    orderitem_id: number

    @Column({ type: 'integer', nullable: true })
    rating: number

    @Column({ type: 'text', nullable: true })
    comment: string

    @ManyToOne(() => OrderItemEntity, orderItem => orderItem.reviews, { nullable: false })
    @JoinColumn({ name: 'orderitem_id' })
    order_item: OrderItemEntity
}