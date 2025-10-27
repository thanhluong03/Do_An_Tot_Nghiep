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

  constructor(private readonly conversationService: ConversationService) { }

  /** 💬 Gửi message qua WS */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`--- [send_message] Client ${client.id} sending:`, dto);

    const saved = await this.conversationService.saveMessage(dto);
    const room = `conversation_${saved.conversation_id}`;

    // Kiểm tra xem client có trong phòng không (quan trọng)
    if (!client.rooms.has(room)) {
      console.warn(`[send_message] Client ${client.id} NOT in room ${room}. Forcing join.`);
      client.join(room);
    }

    const clientsInRoom = this.server.sockets.adapter.rooms.get(room);
    console.log(`[send_message] Emitting 'new_message' to room ${room}. Clients in room: ${clientsInRoom ? Array.from(clientsInRoom) : 'NONE'}`);

    this.server.to(room).emit('new_message', saved);
    this.server.emit('conversation_updated', {
      conversation_id: saved.conversation_id,
      sender_id: saved.sender_id,
      sender_type: saved.sender_type,
      content: saved.content,
      sent_at: saved.sent_at,
    });
    return { event: 'new_message', data: saved };
  }

  /** 🏠 Join room theo conversation */
  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() data: { conversation_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.conversation_id) {
      console.error(`[join_conversation] FAILED: Client ${client.id} sent invalid payload.`);
      return;
    }

    const room = `conversation_${data.conversation_id}`;
    console.log(`--- [join_conversation] Client ${client.id} joining room: ${room} ---`);
    client.join(room);
  }

  /** 🚪 Leave room */
  @SubscribeMessage('leave_conversation')
  handleLeave(
    @MessageBody() data: { conversation_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversation_id}`;
    console.log(`--- [leave_conversation] Client ${client.id} leaving room: ${room} ---`);
    client.leave(room);
  }

  /** 🔹 Lấy conversation detail qua WS */
  @SubscribeMessage('get_conversation_detail')
  async handleGetConversation(@MessageBody() data: { conversation_id: number }) {
    console.log(`--- [get_conversation_detail] Received for conv_id: ${data.conversation_id} ---`);
    return this.conversationService.getConversationDetail(data.conversation_id);
  }
}