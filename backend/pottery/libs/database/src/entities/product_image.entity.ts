import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';

@Entity('product_images')
export class ProductImageEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'boolean', default: false })
    is_main_image: boolean;

    @Column({ type: 'integer', nullable: true })
    priority: number

    @Column({ type: 'bytea', nullable: true })
    image_data: Buffer

    @ManyToOne(() => ProductEntity, (product) => product.images, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;
}