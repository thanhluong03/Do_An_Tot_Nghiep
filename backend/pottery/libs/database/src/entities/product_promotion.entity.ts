import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('product_promotions')
export class ProductPromotionEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'integer', nullable: false })
    promotion_id: number
}