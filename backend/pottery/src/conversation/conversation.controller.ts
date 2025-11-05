// File: conversation.controller.ts

import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ConversationService } from '../../libs/conversation/src/conversation.service';
// 🔥 SỬA LẠI: DÙNG DTO ĐỂ VALIDATE VÀ NHẬN ĐÚNG PAYLOAD
import { CreateConversationDto, MarkReadDto } from './conversation.dto';
import { SuccessResponseDto } from 'src/order/order.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Post('create-conversation')
  async createConversation(@Body() createConversationDto: CreateConversationDto,) {
    console.log('🔵 [POST /conversations/create-conversation] Received:', createConversationDto);
    try {
      const conversation = await this.conversationService.createConversation(
        createConversationDto,
      );
      console.log('✅ Conversation created:', conversation);
      return new SuccessResponseDto(
        'Conversation created successfully',
        conversation,
      );
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
  }

  // Route test đơn giản để debug
  @Post('test-create')
  async testCreate(@Body() body: any) {
    console.log('🧪 [POST /conversations/test-create] Test route hit!', body);
    return { success: true, message: 'Test route works!', received: body };
  }

  // ... (Các hàm khác giữ nguyên)

  // @Get('get-all')
  // async getAllConversations() {
  //   return this.conversationService.getConversations({});
  // }

  // @Get('get-by-user/:user_id')
  // async getConversationsByUser(@Param('user_id') user_id: number) {
  //   return this.conversationService.getConversations({ user_id });
  // }

  // @Get('get-by-customer/:customer_id')
  // async getConversationsByCustomer(@Param('customer_id') customer_id: number) {
  //   return this.conversationService.getConversations({ customer_id });
  // }
  @Get('get-all')
  async getAllConversations() {
    const data = await this.conversationService.getConversations({});
    return new SuccessResponseDto('Success', data);
  }

  @Get('get-by-user/:user_id')
  async getConversationsByUser(@Param('user_id') user_id: number) {
    const data = await this.conversationService.getConversations({ user_id });
    return new SuccessResponseDto('Success', data);
  }

  @Get('get-by-customer/:customer_id')
  async getConversationsByCustomer(@Param('customer_id') customer_id: number) {
    const data = await this.conversationService.getConversations({ customer_id });
    return new SuccessResponseDto('Success', data);
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