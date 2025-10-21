import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ConversationService } from '../../libs/conversation/src/conversation.service';
import { CreateConversationDto, MarkReadDto } from './conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create-conversation')
  async createConversation(
    @Body()
    body: {
      user_id: number;
      customer_id?: number;
      sender_id: number;
      sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN';
      content: string;
    },
  ) {
    return this.conversationService.createConversation(body);
  }

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

  // ✅ mark read vẫn giữ REST (hoặc có thể chuyển qua WS)
  @Post('mark-read')
  async markRead(@Body() dto: MarkReadDto) {
    await this.conversationService.markMessagesRead(dto.conversation_id, dto.user_id);
    return { success: true };
  }
}
