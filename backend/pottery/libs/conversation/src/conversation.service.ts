
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    ConversationEntity,
    MessageEntity,
} from '@app/database';
import {
    Conversation,
    Message,
    ConversationQuery,
} from './conversation.interface';

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(ConversationEntity)
        private readonly conversationRepo: Repository<ConversationEntity>,
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>,
    ) { }

    async getConversations(query: ConversationQuery): Promise<Conversation[]> {
        const qb = this.conversationRepo.createQueryBuilder('c');
        if (query.user_id)
            qb.andWhere('c.user_id = :user_id', { user_id: query.user_id });
        if (query.customer_id)
            qb.andWhere('c.customer_id = :customer_id', { customer_id: query.customer_id });
        if (query.search)
            qb.andWhere('CAST(c.id AS TEXT) LIKE :search', {
                search: `%${query.search}%`,
            });
        return qb.orderBy('c.started_at', 'DESC').getMany();
    }

    async getConversationDetail(
        id: number,
    ): Promise<{ conversation: Conversation | null; messages: Message[] }> {
        const conversation = await this.conversationRepo.findOne({ where: { id } });
        if (!conversation) return { conversation: null, messages: [] };
        const messages = await this.messageRepo.find({
            where: { conversation_id: id },
            order: { sent_at: 'ASC' },
        });
        return { conversation, messages };
    }

    async createConversation(data: Conversation): Promise<Conversation> {
        const conv = this.conversationRepo.create(data);
        return this.conversationRepo.save(conv);
    }

    async saveMessage(data: Message): Promise<Message> {
        let conversationId = data.conversation_id;
        let sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN' = 'USER';
        if (!conversationId) {
            let user_id: number | undefined = undefined;
            let customer_id: number | undefined = undefined;
            if ((data as any).customer_id) {
                customer_id = (data as any).customer_id;
                sender_type = 'USER';
            }
            if ((data as any).user_id) {
                user_id = (data as any).user_id;
                sender_type = (data as any).role || 'USER';
            }
            if (data.sender_type === 'CUSTOMER') {
                customer_id = data.sender_id;
                sender_type = 'USER';
            } else if (data.sender_type === 'USER') {
                user_id = data.sender_id;
                sender_type = (data as any).role || 'USER';
            }
            if (user_id && customer_id) {
                let conv = await this.conversationRepo.findOne({ where: { user_id, customer_id } });
                if (!conv) {
                    conv = await this.conversationRepo.save({
                        user_id,
                        customer_id,
                        started_at: new Date(),
                        created_at: new Date(),
                        updated_at: new Date(),
                        deleted_at: null,
                    });
                }
                conversationId = conv?.id;
            } else {
                throw new Error('Thiếu thông tin user_id hoặc customer_id để tạo cuộc trò chuyện!');
            }
        }
        const msg = this.messageRepo.create({
            ...data,
            conversation_id: conversationId,
            sender_type,
            is_read: sender_type !== 'USER',
        });
        return this.messageRepo.save(msg);
    }

    async markMessagesRead(
        conversation_id: number,
        user_id: number,
    ): Promise<void> {
        await this.messageRepo.update({ conversation_id, sender_id: user_id }, { is_read: true });
    }
}
