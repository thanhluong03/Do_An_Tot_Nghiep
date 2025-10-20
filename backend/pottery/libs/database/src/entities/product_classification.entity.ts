import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductEntity } from './product.entity'
import { ProductAttributeEntity } from './product_attributes.entity';

@Entity('product_classifications')
export class ProductClassificationEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string


    @ManyToOne(() => ProductEntity, product => product.classifications)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @OneToMany(() => ProductAttributeEntity, (productAttribute) => productAttribute.classification)
    attributes: ProductAttributeEntity[];
}