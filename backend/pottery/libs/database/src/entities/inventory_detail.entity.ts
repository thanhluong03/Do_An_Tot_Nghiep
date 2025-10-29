import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InventoryEntity } from './inventory.entity';
import { ClassificationAttributeRelationshipEntity } from './classification_attribute_relationship.entity';

@Entity('inventory_details')
export class InventoryDetailEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    inventory_id: number;

    @Column({ type: 'integer', nullable: false })
    classification_attribute_relationship_id: number;

    @Column({ type: 'integer', nullable: true })
    quantity_stock: number;

    @Column({ type: 'integer', nullable: true })
    quantity_sold: number;

    @ManyToOne(
        () => InventoryEntity,
        (inventory) => inventory.inventory_details,
        { eager: true },
    )
    @JoinColumn({ name: 'inventory_id' })
    inventory: InventoryEntity;

    @ManyToOne(
        () => ClassificationAttributeRelationshipEntity,
        (classification) => classification.inventory_details,
        { eager: true },
    )
    @JoinColumn({ name: 'classification_attribute_relationship_id' })
    classification_attribute_relationship: ClassificationAttributeRelationshipEntity;
}