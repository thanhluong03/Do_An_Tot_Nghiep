import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('orders')
export class OrderEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    driver_id: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    order_date: Date

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total_amount: number

    @Column({ type: 'varchar', default: 'PENDING' })
    status: string

    @Column({ type: 'text', nullable: true })
    shipping_address: string

    @Column({ type: 'varchar', nullable: true })
    payment_method: string

    @Column({ type: 'varchar', default: 'UNPAID' })
    payment_status: string

    @Column({ type: 'json', nullable: true })
    current_order: object
}