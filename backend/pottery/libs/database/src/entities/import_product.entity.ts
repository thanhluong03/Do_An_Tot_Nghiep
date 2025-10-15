import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { SupplierEntity } from './supplier.entity';

@Entity('import_products')
export class ImportProductEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'integer', nullable: false })
    supplier_id: number

    @Column({ type: 'integer', nullable: true })
    import_quantity: number

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    import_price: number

    @ManyToOne(() => ProductEntity, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => SupplierEntity, { eager: true })
    @JoinColumn({ name: 'supplier_id' })
    supplier: SupplierEntity;
}