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

    @OneToMany(
        () => InventoryDetailEntity,
        (inventoryDetail) => inventoryDetail.inventory,
    )
    inventory_details: InventoryDetailEntity[];
    get quantity_stock(): number {
        if (!this.inventory_details || this.inventory_details.length === 0) {
            return 0;
        }
        return this.inventory_details.reduce(
            (sum, detail) => sum + (detail.quantity_stock || 0),
            0,
        );
    }

    get quantity_sold(): number {
        if (!this.inventory_details || this.inventory_details.length === 0) {
            return 0;
        }
        return this.inventory_details.reduce(
            (sum, detail) => sum + (detail.quantity_sold || 0),
            0,
        );
    }
}