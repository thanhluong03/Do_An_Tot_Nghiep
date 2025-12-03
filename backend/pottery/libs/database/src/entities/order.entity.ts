import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { PaymentTransactionEntity } from './paymenttransaction.entity'
import { OrderItemEntity } from './order_item.entity'
import { CustomerEntity } from './customer.entity'
import { OrderStatusHistoryEntity } from './order_status_history.entity';
import { DriverLocationEntity } from './driver_location.entity'
import { DeliveryProofEntity } from './delivery_proof.entity';
import { ReasonChangeImageEntity } from './reason_change_image.entity';
import { CancelReasonImageEntity } from './cancel_reason_image.entity';
import { DeliveryFailImageEntity } from './delivery_fail_image.entity';

export enum OrderStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    EXCHANGED = 'EXCHANGED',
    PENDING_RETURN = 'PENDING_RETURN',
    CONFIRMED_RETURN = 'CONFIRMED_RETURN',
    PENDING_DELIVERY = 'PENDING_DELIVERY',
    DELIVERY_FAILED = 'DELIVERY_FAILED',
    PACKING = 'PACKING',
    SHIPPING_RETURN = 'SHIPPING_RETURN',
    PENDING_DELIVERY_RETURN = 'PENDING_DELIVERY_RETURN',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
    PENDING_REFUND = 'PENDING_REFUND',
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

    @Column({ type: 'boolean', nullable: true })
    is_login_customer: boolean

    @Column({ type: 'text', nullable: true })
    note: string

    @Column({ type: 'text', nullable: true })
    reason_change: string

    @Column({ type: 'text', nullable: true })
    cancel_reason: string

    @Column({ type: 'timestamptz', nullable: true })
    cancel_date: Date

    @Column({ type: 'timestamptz', nullable: true })
    reason_change_date: Date

    @Column({ type: 'text', nullable: true })
    person_cancel: string

    @Column({ type: 'text', nullable: true })
    delivery_fail_reason: string

    @OneToMany(() => PaymentTransactionEntity, (paymentTransaction) => paymentTransaction.order)
    paymentTransactions: PaymentTransactionEntity[];

    @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
    orderItems: OrderItemEntity[];

    @ManyToOne(() => CustomerEntity, (customer) => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;

    @OneToMany(() => OrderStatusHistoryEntity, (orderStatusHistory) => orderStatusHistory.order)
    orderStatusHistories: OrderStatusHistoryEntity[];

    @OneToMany(() => DriverLocationEntity, (driverLocation) => driverLocation.order)
    driverLocations: DriverLocationEntity[];

    @OneToMany(() => DeliveryProofEntity, (deliveryProof) => deliveryProof.order)
    deliveryProofs: DeliveryProofEntity[];

    @OneToMany(() => ReasonChangeImageEntity, (reasonChangeImage) => reasonChangeImage.order)
    reasonChangeImages: ReasonChangeImageEntity[];

    @OneToMany(() => CancelReasonImageEntity, (cancelReasonImage) => cancelReasonImage.order)
    cancelReasonImages: CancelReasonImageEntity[];

    @OneToMany(() => DeliveryFailImageEntity, (deliveryFailImage) => deliveryFailImage.order)
    deliveryFailImages: DeliveryFailImageEntity[];
}