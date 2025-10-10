import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('actor_change_status_order')
export class ActorChangeStatusOrderEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: true })
    user_id: number

    @Column({ type: 'integer', nullable: true })
    customer_id: number

    @Column({ type: 'varchar', nullable: true })
    actor_type: string
}