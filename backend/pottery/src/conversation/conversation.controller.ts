// File: conversation.controller.ts

import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ConversationService } from '../../libs/conversation/src/conversation.service';
// 🔥 SỬA LẠI: DÙNG DTO ĐỂ VALIDATE VÀ NHẬN ĐÚNG PAYLOAD
import { CreateConversationDto, MarkReadDto } from './conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create-conversation')
  async createConversation(
    // 🔥 SỬA LẠI: Dùng DTO để NestJS biết cần nhận những trường nào, bao gồm cả 'store_id'
    @Body() createConversationDto: CreateConversationDto,
  ) {
    // 🔥 SỬA LẠI: Truyền DTO đã được validate vào service
    return this.conversationService.createConversation(createConversationDto);
  }

  // ... (Các hàm khác giữ nguyên)

  @Get('get-all')
  async getAllConversations() {
    return this.conversationService.getConversations({});
  }

  @Get('get-by-user/:user_id')
  async getConversationsByUser(@Param('user_id') user_id: number) {
    return this.conversationService.getConversations({ user_id });
  }

  @Get('get-by-customer/:customer_id')
  async getConversationsByCustomer(@Param('customer_id') customer_id: number) {
    return this.conversationService.getConversations({ customer_id });
  }

  @Get('get-conversation-detail/:id')
  async getConversationDetail(@Param('id') id: number) {
    return this.conversationService.getConversationDetail(id);
  }

  @Post('mark-read')
  async markRead(@Body() dto: MarkReadDto) {
    await this.conversationService.markMessagesRead(dto.conversation_id, dto.user_id);
    return { success: true };
  }
}