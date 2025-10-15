import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

export enum OrderStatusHistory {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

@Entity('order_status_history')
export class OrderStatusHistoryEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'integer', nullable: true })
    user_id: number

    @Column({ type: 'integer', nullable: true })
    customer_id: number

    @Column({
        type: 'enum',
        enum: OrderStatusHistory,
    })
    status: OrderStatusHistory;
}