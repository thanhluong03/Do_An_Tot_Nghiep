import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('flash_sales')
export class FlashSaleEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    name: string

    @Column({ type: 'timestamptz', nullable: true })
    start_time: Date

    @Column({ type: 'timestamptz', nullable: true })
    end_time: Date

    @Column({ type: 'boolean', default: true })
    is_active: boolean

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_begins: Date

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_ends: Date

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    flash_sale_price: number
}