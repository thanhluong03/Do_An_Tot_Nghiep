import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ConversationEntity } from './conversation.entity';

@Entity('messages')
export class MessageEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    conversation_id: number

    @Column({ type: 'integer', nullable: false })
    sender_id: number

    @Column({
        type: 'enum',
        enum: ['USER', 'ADMIN', 'SUPERADMIN'],
        nullable: false,
    })
    sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN'

    @Column({ type: 'text', nullable: true })
    content: string

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    sent_at: Date

    @Column({ type: 'boolean', default: true })
    is_read: boolean

    @ManyToOne(() => ConversationEntity, { eager: true })
    @JoinColumn({ name: 'conversation_id' })
    conversation: ConversationEntity;
}