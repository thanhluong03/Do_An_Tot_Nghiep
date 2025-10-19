import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'

@Entity('payment_transactions')
export class PaymentTransactionEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'varchar', length: 50, nullable: false })
    payment_gateway: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    gateway_txn_ref: string

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false, default: 0 })
    amount: number

    @Column({ type: 'varchar', length: 20, nullable: true })
    txn_status: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    txn_message: string

    @Column({ type: 'timestamp', nullable: true })
    txn_time: Date

    @Column({ type: 'json', nullable: true })
    raw_response_data: Record<string, any>;

    @ManyToOne(() => OrderEntity, (order) => order.paymentTransactions)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
