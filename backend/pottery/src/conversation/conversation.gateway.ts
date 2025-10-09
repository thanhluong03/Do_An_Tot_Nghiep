import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { ConversationService } from '@app/conversation';
import { SendMessageDto } from './conversation.dto';
import { Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.WS_ALLOW_ORIGINS?.split(','),
        credentials: true,
    },
})
export class ConversationGateway {
    constructor(private readonly conversationService: ConversationService) { }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const saved = await this.conversationService.saveMessage(dto);
        client.broadcast.emit('new_message', saved);
        client.emit('new_message', saved);
        return { event: 'new_message', data: saved };
    }
}
