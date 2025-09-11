import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('promotions')
export class PromotionEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'varchar', nullable: true })
    discount_type: string

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discount_value: number

    @Column({ type: 'timestamptz', nullable: true })
    start_date: Date

    @Column({ type: 'timestamptz', nullable: true })
    end_date: Date

    @Column({ type: 'boolean', default: true })
    is_active: boolean
}