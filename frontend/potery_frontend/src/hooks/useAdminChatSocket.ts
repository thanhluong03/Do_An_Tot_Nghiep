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
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const s = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(s);

    // ✅ PHẢI CHỜ KẾT NỐI XONG MỚI EMIT
    s.on('connect', () => {
      console.log(`🟢 (Admin) Socket connected. Joining conv: ${conversationId}`);

      // 1. Join room
      s.emit("join_conversation", { conversation_id: conversationId });

      // 2. Lấy lịch sử chat
      s.emit(
        "get_conversation_detail",
        { conversation_id: conversationId },
        (res: ConversationDetail) => {
          console.log('🟢 (Admin) Received history:', res?.messages?.length || 0);
          if (res?.messages) setMessages(res.messages);
        }
      );
    });

    // Lắng nghe tin nhắn mới (từ User)
    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };
    s.on("new_message", handleNewMessage);
    
    s.on('disconnect', () => console.log('🔴 (Admin) Socket disconnected'));

    return () => {
      console.log(`🔴 (Admin) Cleaning up socket for conv ${conversationId}`);
      s.emit("leave_conversation", { conversation_id: conversationId });
      s.off("new_message", handleNewMessage);
      s.off("connect");
      s.off("disconnect");
      s.disconnect();
      setSocket(null);
    };
  }, [conversationId]);

  // ✅ SỬA LỖI GỬI TIN NHẮN
  const sendMessage = (content: string) => {
    if (!socket || !conversationId || !content.trim()) return;

    const msg = {
      conversation_id: conversationId,
      sender_id: adminId,
      sender_type: "ADMIN" as "ADMIN",
      content: content.trim(),
    };
    
    // Chỉ emit. Server sẽ gửi 'new_message' về.
    socket.emit("send_message", msg);

    // ⛔ DÒNG NÀY ĐÃ BỊ XÓA (Đây là lý do bạn thấy tin của mình)
    // setMessages((prev) => [...prev, msg]);
  };

  return { messages, sendMessage };
}