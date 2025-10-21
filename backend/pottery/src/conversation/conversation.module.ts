// File: conversation.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from '../../libs/conversation/src/conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './conversation.gateway';

// 🔥 IMPORT CÁC ENTITY CÒN THIẾU
import {
  ConversationEntity,
  MessageEntity,
  CustomerEntity, // <--- Thêm vào
  UserEntity,       // <--- Thêm vào
} from '@app/database'; // (Hoặc đường dẫn đúng của bạn)

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      MessageEntity,
      CustomerEntity, // ✅ Thêm CustomerEntity
      UserEntity,       // ✅ Thêm UserEntity
    ]),
    // ... các module khác
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationGateway],
})
export class ConversationModule {}