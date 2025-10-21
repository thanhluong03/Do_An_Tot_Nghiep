"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id?: number;
  conversation_id: number;
  sender_id: number;
  sender_type: "ADMIN" | "USER";
  content: string;
  sent_at?: string;
}

interface ConversationDetail {
  conversation: { id: number; user_id: number; customer_id: number; started_at?: string } | null;
  messages: Message[];
}

interface ChatBoxProps {
  conversationId: number;
  currentAdminId: number;
  customer?: Customer | null;
}

export const AdminChatBox: React.FC<ChatBoxProps> = ({ conversationId, currentAdminId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  // 🔹 Khởi tạo WebSocket
  useEffect(() => {
    const s = io("http://localhost:3000"); // hoặc process.env.NEXT_PUBLIC_WS_URL
    setSocket(s);

    // Join room
    s.emit("join_conversation", { conversation_id: conversationId });

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === conversationId) setMessages((prev) => [...prev, msg]);
    };
    s.on("new_message", handleNewMessage);

    // Lấy chi tiết conversation + messages qua socket callback
    s.emit("get_conversation_detail", { conversation_id: conversationId }, (res: ConversationDetail) => {
      if (res?.messages) setMessages(res.messages);
    });

    return () => {
      s.emit("leave_conversation", { conversation_id: conversationId });
      s.off("new_message", handleNewMessage);
      s.disconnect();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const newMsg: Message = {
      conversation_id: conversationId,
      sender_id: currentAdminId,
      sender_type: "ADMIN",
      content: input,
      sent_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit("send_message", newMsg);
    setMessages((prev) => [...prev, newMsg]); // update local ngay lập tức
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
          <div
            key={i}
            className={`flex flex-col ${m.sender_type === "ADMIN" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
                m.sender_type === "ADMIN" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.content}
            </div>
            {m.sent_at && (
              <span className="text-xs text-gray-400 mt-1">
                {new Date(m.sent_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
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
