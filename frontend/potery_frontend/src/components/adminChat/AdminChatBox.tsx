"use client";
import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { MessageBubble } from "./MessageBubble";
import { conversationApi } from "@/api/services/conversationApi";
import { Customer } from "@/api/services/customerService";

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
  customer?: Customer | null;
}

export const AdminChatBox: React.FC<ChatBoxProps> = ({
  conversationId,
  currentAdminId,
  customer,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await conversationApi.getConversationDetail(conversationId);
      setMessages(data.messages || []);
    };
    fetchData();
  }, [conversationId]);

  useEffect(() => {
  const handleNewMessage = (msg: Message) => {
    if (msg.sender_id === currentAdminId && msg.sender_type === "ADMIN") return;
    if (msg.conversation_id === conversationId) {
      setMessages((prev) => [...prev, msg]);
    }
  };

  socket.on("new_message", handleNewMessage);

  // ✅ Cleanup đúng chuẩn React
  return () => {
    socket.off("new_message", handleNewMessage);
  };
}, [conversationId, currentAdminId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      conversation_id: conversationId,
      sender_id: currentAdminId,
      sender_type: "ADMIN",
      content: input,
      sent_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl border border-white shadow-lg overflow-hidden">
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white font-semibold shadow-md">
        <img
          src={
            customer?.avatar_image
              ? `data:image/png;base64,${customer.avatar_image}`
              : "/default-avatar.png"
          }
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <div>
          <div className="text-base">
            {customer?.full_name || customer?.username || "Khách hàng"}
          </div>
          <div className="text-xs opacity-80">Đang trò chuyện</div>
        </div>
      </div>

      {/* 🔹 Nội dung chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            content={m.content}
            senderType={m.sender_type}
            sentAt={m.sent_at}
          />
        ))}
      </div>

      {/* 🔹 Nhập tin nhắn */}
      <div className="p-3 border-t border-orange-200 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border border-orange-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={sendMessage}
          className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
