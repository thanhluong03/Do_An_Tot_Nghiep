import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { SupplierEntity } from './supplier.entity';
import { ImportProductDetailEntity } from './import_product_detail.entity';

@Entity('import_products')
export class ImportProductEntity extends BaseEntity {
  @Column({ type: 'integer', nullable: false })
  product_id: number;

  @Column({ type: 'integer', nullable: false })
  supplier_id: number;

  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => SupplierEntity, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @OneToMany(() => ImportProductDetailEntity, (detail) => detail.import_product)
  details: ImportProductDetailEntity[];
}
