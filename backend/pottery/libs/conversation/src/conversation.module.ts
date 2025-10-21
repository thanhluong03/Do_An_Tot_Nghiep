import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { ConversationGateway } from '../../../src/conversation/conversation.gateway';
import { ConversationEntity, MessageEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity])],
  providers: [ConversationService, ConversationGateway],
})
export class ConversationModule {}
