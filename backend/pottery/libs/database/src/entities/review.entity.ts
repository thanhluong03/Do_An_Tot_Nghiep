import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('reviews')
export class ReviewEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    product_id: number

    @Column({ type: 'integer', nullable: true })
    rating: number

    @Column({ type: 'text', nullable: true })
    comment: string
}