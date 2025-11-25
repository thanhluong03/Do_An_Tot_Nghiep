import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'

@Entity('reason_change_images')
export class ReasonChangeImageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'bytea', nullable: true })
    reason_change_image: Buffer

    @ManyToOne(() => OrderEntity, (order) => order.reasonChangeImages)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
