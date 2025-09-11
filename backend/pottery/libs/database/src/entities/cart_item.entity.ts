import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'integer', nullable: true })
    quantity: number
}