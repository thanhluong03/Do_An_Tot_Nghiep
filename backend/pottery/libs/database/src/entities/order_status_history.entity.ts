import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'
import { UserEntity } from './user.entity';
import { CustomerEntity } from './customer.entity';

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

    @ManyToOne(() => OrderEntity, (order) => order.orderStatusHistories)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => UserEntity, (user) => user.orderStatusHistories)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.orderStatusHistories)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;
}
