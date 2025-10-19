import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductEntity } from './product.entity'
import { StoreEntity } from './store.entity';
import { CustomerEntity } from './customer.entity';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'integer', nullable: false })
    store_id: number

    @Column({ type: 'integer', nullable: true })
    quantity: number

    @ManyToOne(() => ProductEntity, (product) => product.cartItems)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => StoreEntity, (store) => store.cartItems)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.cartItems)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;
}
