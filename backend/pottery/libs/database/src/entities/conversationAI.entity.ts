import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('conversationAIs')
export class ConversationAIEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    started_at: Date
}