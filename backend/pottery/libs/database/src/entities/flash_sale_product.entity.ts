import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('flash_sale_products')
export class FlashSaleProductEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    flash_sale_id: number

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    product_id: number
}