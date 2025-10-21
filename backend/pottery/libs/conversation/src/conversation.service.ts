import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// 🔥 Thêm CustomerEntity và UserEntity vào import
import {
  ConversationEntity,
  MessageEntity,
  CustomerEntity,
  UserEntity,
} from '@app/database';
import { Conversation, Message, ConversationQuery } from './conversation.interface';
import { CreateConversationDto } from 'src/conversation/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    // 🔥 Import repo của Customer và User để kiểm tra
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /** 📋 Lấy danh sách conversation (Giữ nguyên) */
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

  /** 🔍 Lấy chi tiết conversation + messages (Giữ nguyên) */
  async getConversationDetail(
    id: number,
  ): Promise<{ conversation: Conversation | null; messages: Message[] }> {
    const conversation = await this.conversationRepo.findOne({ where: { id } });
    if (!conversation) return { conversation: null, messages: [] };

    const messages = await this.messageRepo.find({
      where: { conversation_id: id },
      order: { sent_at: 'ASC' },
    });

    const messagesStr = messages.map((msg) => ({
      ...msg,
      sent_at: msg.sent_at?.toISOString(),
    }));

    return { conversation, messages: messagesStr };
  }

  /** 🟢 Tạo conversation (và message đầu tiên nếu có content) */
  async createConversation(
    data: CreateConversationDto,
  ): Promise<ConversationEntity> {
    // 1. Lấy customer_id (là user_id từ client) và content
    // store_id bị bỏ qua vì entity không có
    const {
      user_id: customerId,
      sender_id,
      sender_type = 'USER',
      content,
    } = data;

    // 2. 🔥 GÁN ADMIN MẶC ĐỊNH
    // Entity của bạn yêu cầu 1 admin user_id.
    // Bạn phải thay SỐ 1 này bằng logic nghiệp vụ của bạn (ví dụ: admin đầu tiên)
    const adminUserId = 1;

    if (!customerId) {
      throw new Error('Thiếu customer_id (từ user_id) khi tạo conversation');
    }

    // 3. ✅ Kiểm tra customer (user) tồn tại
    const customerExists = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customerExists) {
      throw new NotFoundException(`Customer với id=${customerId} không tồn tại`);
    }

    // (Tùy chọn) Kiểm tra admin tồn tại
    const adminExists = await this.userRepo.findOne({
      where: { id: adminUserId },
    });
    if (!adminExists) {
      throw new NotFoundException(`Admin mặc định với id=${adminUserId} không tồn tại`);
    }

    // 4. 🔍 Tìm xem đã có conversation giữa customer và admin NÀY chưa
    let conversation = await this.conversationRepo.findOne({
      where: {
        customer_id: customerId,
        user_id: adminUserId, // Tìm theo admin_id mặc định
      },
    });

    // 5. 🔹 Nếu chưa có thì tạo mới (KHÔNG DÙNG store_id)
    if (!conversation) {
      const newConv = this.conversationRepo.create({
        customer_id: customerId,
        user_id: adminUserId, // Gán admin_id mặc định
        started_at: new Date(),
      });
      conversation = await this.conversationRepo.save(newConv);
    }

    // 6. 🔹 Nếu có nội dung khởi tạo thì thêm tin nhắn đầu tiên
    if (content?.trim()) {
      const msg = this.messageRepo.create({
        conversation_id: conversation.id,
        sender_id: sender_id || customerId, // Mặc định là customer
        sender_type,
        content: content.trim(),
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
      data.sender_type === 'ADMIN' || data.sender_type === 'SUPERADMIN'
        ? data.sender_type
        : 'USER';

    // Nếu chưa có conversation_id (frontend gửi tin nhắn mà ko có ID)
    if (!conversationId) {
      // (data as any).user_id là CUSTOMER ID (từ client gửi lên)
      const customer_id: number | undefined =
        (data as any).user_id || (data as any).customer_id;
      
      // Lấy admin_id mặc định (giống hệt createConversation)
      const admin_user_id = 1;

      if (customer_id) {
        let conv = await this.conversationRepo.findOne({
          where: { user_id: admin_user_id, customer_id },
        });
        if (!conv) {
          conv = await this.conversationRepo.save({
            user_id: admin_user_id,
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
          'Thiếu thông tin customer_id để tạo cuộc trò chuyện!',
        );
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
  async markMessagesRead(
    conversation_id: number,
    user_id: number,
  ): Promise<void> {
    await this.messageRepo.update(
      { conversation_id, sender_id: user_id }, // Chỉ đánh dấu tin nhắn của user đó
      { is_read: true },
    );
  }
}