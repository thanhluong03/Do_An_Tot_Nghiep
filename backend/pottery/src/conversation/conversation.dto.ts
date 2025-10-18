import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';

export class GetConversationsDto {
  @IsInt()
  @IsOptional()
  user_id?: number;

  @IsInt()
  @IsOptional()
  customer_id?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateConversationDto {
  @IsInt()
  user_id: number;

  @IsInt()
  @IsOptional()
  customer_id?: number;

  @IsInt()
  @IsOptional()
  store_id?: number;

  @IsInt()
  @IsOptional()
  sender_id?: number;

  @IsEnum(['USER', 'ADMIN', 'SUPERADMIN'])
  @IsOptional()
  sender_type?: 'USER' | 'ADMIN' | 'SUPERADMIN';

  @IsString()
  @IsOptional()
  content?: string;
}

export class SendMessageDto {
  @IsOptional()
  @IsInt()
  conversation_id?: number;

  @IsInt()
  sender_id: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'SUPERADMIN'])
  sender_type?: 'USER' | 'ADMIN' | 'SUPERADMIN';

  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsInt()
  customer_id?: number;
}

/** ✅ Thêm phần này để fix lỗi */
export class MarkReadDto {
  @IsInt()
  conversation_id: number;

  @IsInt()
  user_id: number;
}
