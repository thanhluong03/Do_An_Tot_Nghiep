export interface Conversation {
    id?: number;
    user_id: number;
    customer_id: number;
    started_at?: Date;
}

export interface Message {
    id?: number;
    conversation_id?: number;
    sender_id: number;
    sender_type?: string;
    content: string;
    sent_at?: string;
    is_read?: boolean;
}

export interface ConversationQuery {
    user_id?: number;
    customer_id?: number;
    search?: string;
}
export interface ConversationWithLastMessage extends Conversation {
  last_message?: string;
  last_message_time?: string;
}