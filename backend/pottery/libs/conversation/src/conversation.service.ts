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
  ) {}

  /** 📋 Lấy danh sách conversation theo user_id / customer_id */
  async getConversations(query: ConversationQuery): Promise<Conversation[]> {
    const qb = this.conversationRepo.createQueryBuilder('c');
    if (query.user_id)
      qb.andWhere('c.user_id = :user_id', { user_id: query.user_id });
    if (query.customer_id)
      qb.andWhere('c.customer_id = :customer_id', {
        customer_id: query.customer_id,
      });
    if (query.search)
      qb.andWhere('CAST(c.id AS TEXT) LIKE :search', {
        search: `%${query.search}%`,
      });
    return qb.orderBy('c.started_at', 'DESC').getMany();
  }

  /** 🔍 Lấy chi tiết conversation + messages */
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

  /** 🟢 Tạo conversation (và message đầu tiên nếu có content) */
  async createConversation(data: any): Promise<Conversation> {
    // map store_id -> customer_id nếu frontend gửi store_id
    const customer_id = data.customer_id || data.store_id;
    const user_id = Number(data.user_id);
    const sender_id = Number(data.sender_id) || user_id;
    const sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN' =
      data.sender_type || 'USER';
    const content: string | undefined = data.content;

    if (!user_id || !customer_id) {
      throw new Error('Thiếu user_id hoặc customer_id/store_id!');
    }

    // 🔹 Tìm conversation hiện có
    let conversation = await this.conversationRepo.findOne({
      where: { user_id, customer_id },
    });

    // 🔹 Nếu chưa có thì tạo mới
    if (!conversation) {
      const newConv = this.conversationRepo.create({
        user_id,
        customer_id,
        started_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
      conversation = await this.conversationRepo.save(newConv);
    }

    // 🔹 Nếu có nội dung => tạo message đầu tiên
    if (content && content.trim() !== '') {
      const msg = this.messageRepo.create({
        conversation_id: conversation.id,
        sender_id,
        sender_type,
        content,
        sent_at: new Date(),
        is_read: false,
      });
      await this.messageRepo.save(msg);
    }

    // 🔹 Trả về conversation để frontend lấy id
    return conversation;
  }

  /** 💬 Lưu message mới, tự tạo conversation nếu chưa có */
  async saveMessage(data: Message): Promise<Message> {
    let conversationId = data.conversation_id;
    let sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN' =
      data.sender_type === 'ADMIN' || data.sender_type === 'SUPERADMIN'
      ? data.sender_type
      : 'USER';

    // 🟡 Nếu chưa có conversation_id thì tạo mới
    if (!conversationId) {
      let user_id: number | undefined = (data as any).user_id;
      let customer_id: number | undefined =
        (data as any).customer_id || (data as any).store_id;

      if (data.sender_type === 'CUSTOMER') {
        customer_id = data.sender_id;
        sender_type = 'USER';
      } else if (data.sender_type === 'USER') {
        user_id = data.sender_id;
      }

      if (user_id && customer_id) {
        let conv = await this.conversationRepo.findOne({
          where: { user_id, customer_id },
        });
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
        conversationId = conv.id;
      } else {
        throw new Error(
          'Thiếu thông tin user_id hoặc customer_id để tạo cuộc trò chuyện!',
        );
      }
    }

    // 📨 Lưu message mới
    const msg = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: data.sender_id,
      sender_type,
      content: data.content,
      sent_at: new Date(),
      is_read: sender_type !== 'USER',
    });

    return this.messageRepo.save(msg);
  }

  /** ✅ Đánh dấu tin nhắn đã đọc */
  async markMessagesRead(
    conversation_id: number,
    user_id: number,
  ): Promise<void> {
    await this.messageRepo.update(
      { conversation_id, sender_id: user_id },
      { is_read: true },
    );
  }
}
