import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductClassificationEntity } from './product_classification.entity'
import { ClassificationAttributeRelationshipEntity } from './classification_attribute_relationship.entity'

@Entity('product_attributes')
export class ProductAttributeEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_classification_id: number

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string

    @ManyToOne(() => ProductClassificationEntity, classification => classification.attributes)
    @JoinColumn({ name: 'product_classification_id' })
    classification: ProductClassificationEntity;

    @OneToMany(() => ClassificationAttributeRelationshipEntity, (relationship) => relationship.attribute1)
    classification_1: ClassificationAttributeRelationshipEntity[];

    @OneToMany(() => ClassificationAttributeRelationshipEntity, (relationship) => relationship.attribute2)
    classification_2: ClassificationAttributeRelationshipEntity[];
}