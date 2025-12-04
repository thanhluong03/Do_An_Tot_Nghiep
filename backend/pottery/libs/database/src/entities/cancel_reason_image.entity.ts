import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'

@Entity('cancel_reason_images')
export class CancelReasonImageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'bytea', nullable: true })
    cancel_reason_image: Buffer

    @Column({ type: 'boolean', nullable: true })
    is_cancel_return: boolean
    
    @ManyToOne(() => OrderEntity, (order) => order.cancelReasonImages)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
