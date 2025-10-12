import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationController } from './conversation.controller';
import { ConversationService } from '@app/conversation';
import { ConversationGateway } from './conversation.gateway';
import { ConversationEntity, MessageEntity } from '@app/database';

@Module({
    imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity])],
    controllers: [ConversationController],
    providers: [ConversationService, ConversationGateway],
    exports: [ConversationService],
})
export class ConversationModule { }
