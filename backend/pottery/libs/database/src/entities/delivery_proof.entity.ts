import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Entity('delivery_proofs')
export class DeliveryProofEntity extends BaseEntity {

    @Column({ type: 'int', nullable: false })
    order_id: number

    @Column({ type: 'int', nullable: false })
    driver_id: number

    @Column({ type: 'bytea', nullable: true })
    image_proof: Buffer

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    captured_at: Date

    @ManyToOne(() => OrderEntity, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => UserEntity, (user) => user.deliveryProofs)
    @JoinColumn({ name: 'driver_id' })
    driver: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.deliveryProofs)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}