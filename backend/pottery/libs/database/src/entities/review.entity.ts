import { Entity, Column, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderItemEntity } from './order_item.entity'
import { CustomerEntity } from './customer.entity'

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

    @OneToOne(() => OrderItemEntity, (orderItem) => orderItem.review)
    @JoinColumn({ name: 'orderitem_id' })
    order_item: OrderItemEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.reviews)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;
}
