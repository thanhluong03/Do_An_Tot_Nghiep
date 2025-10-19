import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ReviewEntity } from './review.entity'
import { CartItemEntity } from './cart_item.entity';
import { OrderEntity } from './order.entity';
import { VoucherCustomerEntity } from './voucher_customer.entity';
import { ConversationEntity } from './conversation.entity';
import { OrderStatusHistoryEntity } from './order_status_history.entity';

@Entity('customers')
export class CustomerEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 100, nullable: false })
    username: string

    @Column({ type: 'varchar', length: 100, nullable: false })
    password_hash: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    full_name: string

    @Column({ type: 'varchar', length: 12, nullable: true })
    phone_number: string

    @Column({ type: 'text', nullable: false })
    address: string

    @Column({ type: 'bytea', nullable: true })
    avatar_image: Buffer

    @Column({ type: 'boolean', nullable: true })
    is_active: boolean

    @OneToMany(() => ReviewEntity, (review) => review.customer)
    reviews: ReviewEntity[];

    @OneToMany(() => CartItemEntity, (cartItem) => cartItem.customer)
    cartItems: CartItemEntity[];

    @OneToMany(() => OrderEntity, (order) => order.customer)
    orders: OrderEntity[];

    @OneToMany(() => VoucherCustomerEntity, (voucherCustomer) => voucherCustomer.customer)
    voucherCustomers: VoucherCustomerEntity[];

    @OneToMany(() => ConversationEntity, (conversation) => conversation.customer)
    conversations: ConversationEntity[];

    @OneToMany(() => OrderStatusHistoryEntity, (orderStatusHistory) => orderStatusHistory.customer)
    orderStatusHistories: OrderStatusHistoryEntity[];
}