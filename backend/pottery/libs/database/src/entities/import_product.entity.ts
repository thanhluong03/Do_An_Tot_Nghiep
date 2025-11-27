import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SupplierEntity } from './supplier.entity';
import { ImportProductDetailEntity } from './import_product_detail.entity';
import { UserEntity } from './user.entity';

@Entity('import_products')
export class ImportProductEntity extends BaseEntity {

  @Column({ type: 'integer', nullable: false })
  supplier_id: number;

  @Column({ type: 'integer', nullable: false })
  user_id: number;

  @ManyToOne(() => SupplierEntity, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @ManyToOne(() => UserEntity, (user) => user.importProducts)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => ImportProductDetailEntity, (detail) => detail.import_product)
  details: ImportProductDetailEntity[];
}
