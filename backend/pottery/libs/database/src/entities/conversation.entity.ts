import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('conversations')
export class ConversationEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    started_at: Date
}