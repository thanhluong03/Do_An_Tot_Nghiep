import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ImportProductEntity } from './import_product.entity';
import { ClassificationAttributeRelationshipEntity } from './classification_attribute_relationship.entity';

@Entity('import_product_details')
export class ImportProductDetailEntity extends BaseEntity {
  @Column({ type: 'integer', nullable: false })
  import_product_id: number;

  @Column({ type: 'integer', nullable: false })
  classification_attribute_relationship_id: number;

  @Column({ type: 'integer', nullable: false })
  import_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  import_price: number;

  @ManyToOne(() => ImportProductEntity)
  @JoinColumn({ name: 'import_product_id' })
  import_product: ImportProductEntity;

  @ManyToOne(() => ClassificationAttributeRelationshipEntity)
  @JoinColumn({ name: 'classification_attribute_relationship_id' })
  classification_attribute_relationship: ClassificationAttributeRelationshipEntity;
}
