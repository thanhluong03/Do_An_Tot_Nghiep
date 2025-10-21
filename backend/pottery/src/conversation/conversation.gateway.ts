import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ConversationService } from '../../libs/conversation/src/conversation.service';
import { SendMessageDto } from './conversation.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_ALLOW_ORIGINS?.split(',') || '*',
    credentials: true,
  },
})
export class ConversationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly conversationService: ConversationService) {}

  /** 💬 Gửi message qua WS */
  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() dto: SendMessageDto, @ConnectedSocket() client: Socket) {
    const saved = await this.conversationService.saveMessage(dto);

    const room = `conversation_${saved.conversation_id}`;
    if (!client.rooms.has(room)) client.join(room);

    this.server.to(room).emit('new_message', saved);
    return { event: 'new_message', data: saved };
  }

  /** 🏠 Join room theo conversation */
  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() data: { conversation_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversation_id}`;
    client.join(room);
  }

  /** 🚪 Leave room */
  @SubscribeMessage('leave_conversation')
  handleLeave(
    @MessageBody() data: { conversation_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversation_id}`;
    client.leave(room);
  }

  /** 🔹 Lấy conversation detail qua WS */
  @SubscribeMessage('get_conversation_detail')
  async handleGetConversation(@MessageBody() data: { conversation_id: number }) {
    return this.conversationService.getConversationDetail(data.conversation_id);
  }
}
