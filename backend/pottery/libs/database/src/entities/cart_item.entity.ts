import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { StoreEntity } from './store.entity';
import { CustomerEntity } from './customer.entity';
import { ClassificationAttributeRelationshipEntity } from './classification_attribute_relationship.entity';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    customer_id: number;

    @Column({ type: 'integer', nullable: false })
    product_id: number;

    @Column({ type: 'integer', nullable: false })
    store_id: number;

    @Column({ type: 'integer', nullable: true })
    quantity: number;

    @Column({ type: 'integer', nullable: true })
    classification_attribute_relationship_id: number;

    @ManyToOne(() => ProductEntity, (product) => product.cartItems)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => StoreEntity, (store) => store.cartItems)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.cartItems)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;

    @ManyToOne(() => ClassificationAttributeRelationshipEntity)
    @JoinColumn({ name: 'classification_attribute_relationship_id' })
    classificationRelationship: ClassificationAttributeRelationshipEntity;
}
