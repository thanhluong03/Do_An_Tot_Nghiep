import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { UserEntity } from './user.entity';
import { CustomerEntity } from './customer.entity';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'integer', nullable: false })
    customer_id: number

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    started_at: Date

    @ManyToOne(() => UserEntity, (user) => user.conversations)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.conversations)
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;

    @OneToMany(() => MessageEntity, (message) => message.conversation)
    messages: MessageEntity[];
}