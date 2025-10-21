import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity, MessageEntity } from '@app/database';
import { Conversation, Message, ConversationQuery } from './conversation.interface';

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
    if (query.user_id) qb.andWhere('c.user_id = :user_id', { user_id: query.user_id });
    if (query.customer_id) qb.andWhere('c.customer_id = :customer_id', { customer_id: query.customer_id });
    if (query.search) qb.andWhere('CAST(c.id AS TEXT) LIKE :search', { search: `%${query.search}%` });
    return qb.orderBy('c.started_at', 'DESC').getMany();
  }

  /** 🔍 Lấy chi tiết conversation + messages */
  async getConversationDetail(id: number): Promise<{ conversation: Conversation | null; messages: Message[] }> {
  const conversation = await this.conversationRepo.findOne({ where: { id } });
  if (!conversation) return { conversation: null, messages: [] };

  const messages = await this.messageRepo.find({
    where: { conversation_id: id },
    order: { sent_at: 'ASC' },
  });

  // 🔹 convert sent_at Date -> string
  const messagesStr = messages.map(msg => ({
    ...msg,
    sent_at: msg.sent_at?.toISOString(),
  }));

  return { conversation, messages: messagesStr };
}


  /** 🟢 Tạo conversation (và message đầu tiên nếu có content) */
   async createConversation(data: any) {
  const user_id = Number(data.user_id);
  const store_id = Number(data.store_id) || Number(data.customer_id);
  const sender_id = Number(data.sender_id);
  const sender_type = data.sender_type || 'USER';
  const content = data.content?.trim();

  if (!user_id || !store_id) {
    throw new Error('Thiếu user_id hoặc store_id khi tạo conversation');
  }

  // ✅ Kiểm tra user tồn tại
  const userExists = await this.conversationRepo.query(
    `SELECT id FROM users WHERE id = $1 LIMIT 1`, [user_id]
  );
  if (!userExists.length) {
    throw new Error(`User với id=${user_id} không tồn tại`);
  }

  // ✅ Kiểm tra customer tồn tại, nếu không thì tạo guest tạm
  let customerId = store_id;
  const customerExists = await this.conversationRepo.query(
    `SELECT id FROM customers WHERE id = $1 LIMIT 1`, [store_id]
  );
  if (!customerExists.length) {
    const inserted = await this.conversationRepo.query(
      `INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id`,
      [`Guest_${Date.now()}`, `guest_${Date.now()}@temp.local`],
    );
    customerId = inserted[0].id;
  }

  // 🔍 Tìm xem đã có conversation giữa user và customer chưa
  let conversation = await this.conversationRepo.findOne({
    where: { user_id, customer_id: customerId },
  });

  // 🔹 Nếu chưa có thì tạo mới
  if (!conversation) {
    const newConv = this.conversationRepo.create({
      user_id,
      customer_id: customerId,
      started_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    conversation = await this.conversationRepo.save(newConv);
  }

  // 🔹 Nếu có nội dung khởi tạo thì thêm tin nhắn đầu tiên
  if (content) {
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

  return conversation;
}

  /** 💬 Lưu message mới, tự tạo conversation nếu chưa có */
  async saveMessage(data: Message): Promise<Message> {
    let conversationId = data.conversation_id;
    let sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN' =
      data.sender_type === 'ADMIN' || data.sender_type === 'SUPERADMIN' ? data.sender_type : 'USER';

    // Nếu chưa có conversation_id thì tạo mới
    if (!conversationId) {
      let user_id: number | undefined = (data as any).user_id;
      let customer_id: number | undefined = (data as any).customer_id || (data as any).store_id;

      if (data.sender_type === 'CUSTOMER') {
        customer_id = data.sender_id;
        sender_type = 'USER';
      } else if (data.sender_type === 'USER') {
        user_id = data.sender_id;
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
        conversationId = conv.id;
      } else {
        throw new Error('Thiếu thông tin user_id hoặc customer_id để tạo cuộc trò chuyện!');
      }
    }

    const msg = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: data.sender_id,
      sender_type,
      content: data.content,
      sent_at: new Date(),
      is_read: sender_type !== 'USER',
    });

    const saved = await this.messageRepo.save(msg);

// 🔹 convert để gửi WebSocket
return { ...saved, sent_at: saved.sent_at.toISOString() };
  }

  /** ✅ Đánh dấu tin nhắn đã đọc */
  async markMessagesRead(conversation_id: number, user_id: number): Promise<void> {
    await this.messageRepo.update(
      { conversation_id, sender_id: user_id },
      { is_read: true },
    );
  }
}
