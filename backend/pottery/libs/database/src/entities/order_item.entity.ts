import { Entity, Column, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReviewEntity } from './review.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';
import { StoreEntity } from './store.entity';

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

    @OneToOne(() => ReviewEntity, (review) => review.order_item)
    review: ReviewEntity;

    @ManyToOne(() => ProductEntity, (product) => product.orderItems)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => OrderEntity, (order) => order.orderItems)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => StoreEntity, (store) => store.orderItems)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;
}
