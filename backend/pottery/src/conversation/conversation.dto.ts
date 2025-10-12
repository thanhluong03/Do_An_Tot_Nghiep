import { IsInt, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

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
    customer_id: number;
}

export class SendMessageDto {
    @IsInt()
    conversation_id: number;

    @IsInt()
    sender_id: number;

    @IsString()
    content: string;
}

export class MarkReadDto {
    @IsInt()
    conversation_id: number;

    @IsInt()
    user_id: number;
}
