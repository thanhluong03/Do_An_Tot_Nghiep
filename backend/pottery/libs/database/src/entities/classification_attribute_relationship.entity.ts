import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductAttributeEntity } from './product_attributes.entity'
import { ImportProductDetailEntity } from './import_product_detail.entity'
import { InventoryDetailEntity } from './inventory_detail.entity'

@Entity('classification_attribute_relationships')
export class ClassificationAttributeRelationshipEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_attribute_id_1: number

    @Column({ type: 'integer', nullable: false })
    product_attribute_id_2: number

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'integer', nullable: true })
    quantity: number;

    @ManyToOne(() => ProductAttributeEntity, attribute => attribute.classification_1)
    @JoinColumn({ name: 'product_attribute_id_1' })
    attribute1: ProductAttributeEntity;

    @ManyToOne(() => ProductAttributeEntity, attribute => attribute.classification_2)
    @JoinColumn({ name: 'product_attribute_id_2' })
    attribute2: ProductAttributeEntity;

    @OneToMany(() => ImportProductDetailEntity, importDetail => importDetail.classification_attribute_relationship)
    import_product_details: ImportProductDetailEntity[];

    @OneToMany(() => InventoryDetailEntity, inventoryDetail => inventoryDetail.classification_attribute_relationship)
    inventory_details: InventoryDetailEntity[];
}
