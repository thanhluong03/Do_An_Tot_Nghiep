import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('delivery_proofs')
export class DeliveryProofEntity extends BaseEntity {

    @Column({ type: 'int', nullable: false })
    order_id: number

    @Column({ type: 'varchar', length: 255, nullable: true })
    image_url: string

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    captured_at: Date
}