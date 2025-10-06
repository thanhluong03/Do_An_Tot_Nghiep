import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

export enum OrderStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
    CARD = 'CARD',
    ONSITE = 'ONSITE',
}
@Entity('orders')
export class OrderEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    order_date: Date

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total_amount: number

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.CREATED,
    })
    status: OrderStatus;

    @Column({ type: 'text', nullable: true })
    shipping_address: string

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    payment_method: PaymentMethod

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        nullable: true,
    })
    payment_status: PaymentStatus

    @Column({ type: 'json', nullable: true })
    current_order: object
}