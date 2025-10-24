import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import {
  ConversationEntity,
  MessageEntity,
  CustomerEntity,
  UserEntity,
} from '@app/database';
import { ConversationController } from 'src/conversation/conversation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      MessageEntity,
      CustomerEntity,
      UserEntity,
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
