import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity'

@Entity('delivery_fail_images')
export class DeliveryFailImageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    order_id: number

    @Column({ type: 'bytea', nullable: true })
    delivery_fail_image: Buffer

    @ManyToOne(() => OrderEntity, (order) => order.deliveryFailImages)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;
}
