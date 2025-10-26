import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'
import { UserEntity } from './user.entity'

export enum DriverStatus {
    WAITING_ACCEPT = 'WAITING_ACCEPT',
    ACCEPTED = 'ACCEPTED',
}
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

    @Column({
        type: 'enum',
        enum: DriverStatus,
        nullable: true,
    })
    driver_status: DriverStatus;

    @ManyToOne(() => OrderEntity, (order) => order.driverLocations)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => UserEntity, (user) => user.driverLocations)
    @JoinColumn({ name: 'driver_id' })
    user: UserEntity;
}