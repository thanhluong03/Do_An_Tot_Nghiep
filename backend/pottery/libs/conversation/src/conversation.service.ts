import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  MessageEntity,
  CustomerEntity,
  UserEntity,
} from '@app/database';
import {
  Conversation,
  Message,
  ConversationQuery,
} from './conversation.interface';
// 🔹 Import DTOs
import {
  CreateConversationDto,
  SendMessageDto,
} from 'src/conversation/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /** 📋 Lấy danh sách conversation (Hộp thư chung) */
  async getConversations(query: ConversationQuery): Promise<Conversation[]> {
    const qb = this.conversationRepo
      .createQueryBuilder('c')
      // Join để lấy thông tin customer (user) và admin (user)
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.user', 'admin');

    // Lọc theo admin (nếu cần, nhưng get-all sẽ bỏ qua cái này)
    if (query.user_id)
      qb.andWhere('c.user_id = :user_id', { user_id: query.user_id });

    // Lọc theo customer (nếu cần)
    if (query.customer_id)
      qb.andWhere('c.customer_id = :customer_id', {
        customer_id: query.customer_id,
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

    const messagesStr = messages.map((msg) => ({
      ...msg,
      sent_at: msg.sent_at?.toISOString(),
    }));

    return { conversation, messages: messagesStr as Message[] };
  }

  /**
   * 🟢 🔥 TẠO CONVERSATION (LOGIC MỚI)
   * Sửa lỗi Type và logic Hộp thư chung
   */
  async createConversation(
    data: CreateConversationDto,
  ): Promise<Conversation & { messages: Message[] }> {
    const {
      user_id: customerId,
      sender_id,
      sender_type = 'USER',
      content,
    } = data;

    if (!customerId) {
      throw new Error('Thiếu customerId (từ user_id) khi tạo conversation');
    }
 
    const customerExists = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customerExists) {
      throw new NotFoundException(`Customer với id=${customerId} không tồn tại`);
    }

    // 3. 🔥 SỬA LOGIC: Tìm xem customer này đã có conversation nào chưa
    let conversation = await this.conversationRepo.findOne({
      where: {
        customer_id: customerId,
      },
      relations: ['customer', 'user'], // Eager load relations
    });

    // 4. 🔥 SỬA LOGIC: Nếu chưa có, tạo mới và gán cho admin ĐẦU TIÊN
    if (!conversation) {
      const firstAdmin = await this.userRepo.createQueryBuilder('user')
        .leftJoin('user.role', 'role')
        .where('role.name IN (:...roles)', {
          roles: ['ADMIN', 'SUPERADMIN'],
        })
        .orderBy('user.id', 'ASC')
        .getOne();

      if (!firstAdmin) {
        throw new NotFoundException(
          'Không tìm thấy admin nào trong hệ thống để gán conversation',
        );
      }

      const newConv = this.conversationRepo.create({
        customer_id: customerId,
        user_id: firstAdmin.id,
        started_at: new Date(),
      });
      const savedConv = await this.conversationRepo.save(newConv);
      // Refetch to get relations
      conversation = await this.conversationRepo.findOne({ where: { id: savedConv.id }, relations: ['customer', 'user']});
      if (!conversation) throw new Error('Không thể tạo conversation mới.');
    }

    let initialMessage: Message | null = null;

    // 5. Nếu có nội dung, tạo tin nhắn đầu tiên
    if (content?.trim()) {
      const msg = this.messageRepo.create({
        conversation_id: conversation.id,
        sender_id: sender_id || customerId,
        sender_type,
        content: content.trim(),
        sent_at: new Date(),
        is_read: false,
      });
      const savedMsg = await this.messageRepo.save(msg);
      initialMessage = {
        ...savedMsg,
        sent_at: savedMsg.sent_at.toISOString(),
      };
    }

    // 6. ✅ Sửa lỗi Type: Trả về object phẳng thay vì Entity
    return {
      id: conversation.id,
      user_id: conversation.user_id,
      customer_id: conversation.customer_id,
      started_at: conversation.started_at,
      messages: initialMessage ? [initialMessage] : [],
    };
  }

  /**
   * 💬 🔥 LƯU MESSAGE (LOGIC MỚI)
   * Chỉ lưu tin nhắn, không tự tạo conversation.
   */
  async saveMessage(data: SendMessageDto): Promise<Message> {
    if (!data.conversation_id) {
      throw new Error('Không thể lưu tin nhắn vì thiếu conversation_id');
    }

    const conversationExists = await this.conversationRepo.findOne({
      where: { id: data.conversation_id },
    });
    if (!conversationExists) {
      throw new NotFoundException(
        `Conversation với id=${data.conversation_id} không tồn tại`,
      );
    }

    const msg = this.messageRepo.create({
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      sender_type: data.sender_type,
      content: data.content,
      sent_at: new Date(),
      is_read: data.sender_type !== 'USER',
    });

    const saved = await this.messageRepo.save(msg);

    return { ...saved, sent_at: saved.sent_at.toISOString() };
  }

  /** ✅ Đánh dấu tin nhắn đã đọc */
  async markMessagesRead(
    conversation_id: number,
    user_id: number, // Đây là sender_id của người đọc
  ): Promise<void> {
    await this.messageRepo
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ is_read: true })
      .where('conversation_id = :conversation_id', { conversation_id })
      .andWhere('sender_id != :user_id', { user_id }) // Đánh dấu tin nhắn của người kia
      .andWhere('is_read = false')
      .execute();
  }
}