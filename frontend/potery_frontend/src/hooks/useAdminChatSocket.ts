// hooks/useAdminChatSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Message {
  id?: number;
  conversation_id: number;
  sender_id: number;
  sender_type: "ADMIN" | "USER";
  content: string;
  sent_at?: string;
}

export interface ConversationDetail {
  conversation: { id: number; user_id: number; customer_id: number; started_at?: string } | null;
  messages: Message[];
}

export function useAdminChatSocket(conversationId: number | null, adminId: number) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    const s = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(s);

    // Join room conversation
    s.emit("join_conversation", { conversation_id: conversationId });

    // Listen new messages
    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === conversationId) setMessages((prev) => [...prev, msg]);
    };
    s.on("new_message", handleNewMessage);

    // Load conversation detail (history) với typed callback
    s.emit(
      "get_conversation_detail",
      { conversation_id: conversationId },
      (res: ConversationDetail) => {
        if (res?.messages) setMessages(res.messages);
      }
    );

    return () => {
      s.emit("leave_conversation", { conversation_id: conversationId });
      s.off("new_message", handleNewMessage);
      s.disconnect();
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    if (!socket || !conversationId) return;

    const msg: Message = {
      conversation_id: conversationId,
      sender_id: adminId,
      sender_type: "ADMIN",
      content,
      sent_at: new Date().toISOString(),
    };
    socket.emit("send_message", msg);

    // Hiển thị ngay tin nhắn admin
    setMessages((prev) => [...prev, msg]);
  };

  return { messages, sendMessage };
}
