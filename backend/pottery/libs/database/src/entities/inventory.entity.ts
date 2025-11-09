import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { StoreEntity } from './store.entity';
import { InventoryDetailEntity } from './inventory_detail.entity';

@Entity('inventories')
export class InventoryEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    product_id: number;

    @Column({ type: 'integer', nullable: false })
    store_id: number;

    @ManyToOne(() => ProductEntity, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => StoreEntity, { eager: true })
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;

    @Column({ type: 'integer', nullable: true })
    quantity_stock: number;

    @Column({ type: 'integer', nullable: true })
    quantity_sold: number;

    @OneToMany(
        () => InventoryDetailEntity,
        (inventoryDetail) => inventoryDetail.inventory,
    )
    inventory_details: InventoryDetailEntity[];
}