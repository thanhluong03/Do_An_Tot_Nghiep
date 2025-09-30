import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('messageAIs')
export class MessageAIEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    conversationAI_id: number

    @Column({ type: 'integer', nullable: false })
    sender_id: number

    @Column({ type: 'text', nullable: true })
    content: string

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    sent_at: Date

    @Column({ type: 'boolean', default: true })
    is_read: boolean
}