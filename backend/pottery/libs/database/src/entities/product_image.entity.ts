import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('product_images')
export class ProductImageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'boolean', default: true })
    is_main_image: boolean;

    @Column({ type: 'integer', nullable: true })
    priority: number

    @Column({ type: 'varchar', length: 255, nullable: true })
    image_url: string
}