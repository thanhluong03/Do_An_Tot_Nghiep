"use client";
import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { MessageBubble } from "./MessageBubble";
import { conversationApi } from "@/api/services/conversationApi";

interface Message {
  id?: number;
  conversation_id: number;
  sender_id: number;
  sender_type: "ADMIN" | "USER";
  content: string;
  sent_at?: string;
}

interface ChatBoxProps {
  conversationId: number;
  currentAdminId: number;
}

export const AdminChatBox: React.FC<ChatBoxProps> = ({
  conversationId,
  currentAdminId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // 🔹 Load tin nhắn cũ khi đổi hội thoại
  useEffect(() => {
    const fetchData = async () => {
      const data = await conversationApi.getConversationDetail(conversationId);
      setMessages(data.messages || []);
    };
    fetchData();
  }, [conversationId]);

  // 🔹 Lắng nghe tin nhắn realtime
useEffect(() => {
  const handleNewMessage = (msg: Message) => {
    // 🔹 Bỏ qua tin nhắn do chính admin này gửi ra
    if (
      msg.sender_id === currentAdminId &&
      msg.sender_type === "ADMIN"
    )
      return;

    if (msg.conversation_id === conversationId) {
      setMessages((prev) => [...prev, msg]);
    }
  };

  socket.on("new_message", handleNewMessage);

  // ✅ cleanup hợp lệ
  return () => {
    socket.off("new_message", handleNewMessage);
  };
}, [conversationId, currentAdminId]);



  // 🔹 Gửi tin nhắn
  const sendMessage = () => {
  if (!input.trim()) return;

  const newMsg: Message = {
    conversation_id: conversationId,
    sender_id: currentAdminId,
    sender_type: "ADMIN",
    content: input,
    sent_at: new Date().toISOString(),
  };

  // 🔹 Hiển thị ngay trên giao diện
  setMessages((prev) => [...prev, newMsg]);

  // 🔹 Gửi cho server để broadcast
  socket.emit("send_message", newMsg);

  setInput("");
};


  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl border shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            content={m.content}
            senderType={m.sender_type}
            
          />
        ))}
      </div>

      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
