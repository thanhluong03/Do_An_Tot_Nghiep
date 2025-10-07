import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('driver_locations')
export class DriverLocationEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    driver_id: number

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
    latitude: number

    @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
    longitude: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date
}