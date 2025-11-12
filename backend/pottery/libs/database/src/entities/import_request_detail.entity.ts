import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ImportRequestEntity } from './import_request.entity';
import { ProductEntity } from './product.entity';
import { ClassificationAttributeRelationshipEntity } from './classification_attribute_relationship.entity';

@Entity('import_request_details')
export class ImportRequestDetailEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    import_request_id: number;

    @Column({ type: 'integer', nullable: false })
    product_id: number;

    @Column({ type: 'integer', nullable: true })
    classification_attribute_relationship_id: number;

    @Column({ type: 'integer', nullable: true })
    requested_quantity: number;

    @Column({ type: 'integer', nullable: true })
    accept_quantity: number;

    @ManyToOne(() => ImportRequestEntity, (importRequest) => importRequest.importRequestDetails)
    @JoinColumn({ name: 'import_request_id' })
    importRequest: ImportRequestEntity;

    @ManyToOne(() => ProductEntity, (product) => product.importRequestDetails)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => ClassificationAttributeRelationshipEntity, (classification) => classification.importRequestDetails)
    @JoinColumn({ name: 'classification_attribute_relationship_id' })
    classificationAttributeRelationship: ClassificationAttributeRelationshipEntity;
}
