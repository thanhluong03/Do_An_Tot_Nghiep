"use client";

import { Customer } from "@/api/services/customerService";
import React, { useEffect, useState, useRef } from "react";
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
  conversationId: number | null; // Cho phép null khi chưa chọn conversation
  currentAdminId: number;
  customer?: Customer | null;
}

export const AdminChatBox: React.FC<ChatBoxProps> = ({ conversationId, currentAdminId, customer }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null); // Dùng useRef để tránh re-render không cần thiết

  useEffect(() => {
    // Nếu không có conversationId (admin chưa chọn chat), thì không làm gì cả
    if (!conversationId) {
      setMessages([]); // Xóa tin nhắn cũ đi
      return;
    }

    // 1. Khởi tạo kết nối
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      transports: ["websocket"],
      // Tự động kết nối lại nếu mất mạng
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // 2. Lắng nghe sự kiện 'connect'
    const onConnect = () => {
      console.log(`🟢 (Admin) Socket connected. Joining conv: ${conversationId}`);
      // Join room
      socket.emit("join_conversation", { conversation_id: conversationId });
      // Lấy lịch sử chat
      socket.emit(
        "get_conversation_detail",
        { conversation_id: conversationId },
        (res: ConversationDetail) => {
          if (res?.messages) {
            setMessages(res.messages);
          }
        }
      );
    };
    socket.on('connect', onConnect);

    // 3. Lắng nghe tin nhắn mới
    const onNewMessage = (msg: Message) => {
      if (msg.conversation_id === conversationId) {
        // Chống lỗi duplicate key
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };
    socket.on("new_message", onNewMessage);

    // 4. Dọn dẹp
    return () => {
      console.log(`🔴 (Admin) Cleaning up socket for conv ${conversationId}`);
      if (socket) {
        socket.emit("leave_conversation", { conversation_id: conversationId });
        socket.off("connect", onConnect);
        socket.off("new_message", onNewMessage);
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [conversationId]); // Hook này sẽ chạy lại mỗi khi admin click vào conversation khác

  // 5. Gửi tin nhắn
  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket || !conversationId || !input.trim()) return;

    const newMsg = {
      conversation_id: conversationId,
      sender_id: currentAdminId,
      sender_type: "ADMIN" as "ADMIN",
      content: input.trim(),
    };

    // Chỉ emit. Server sẽ gửi 'new_message' về cho cả 2 bên.
    socket.emit("send_message", newMsg);
    setInput(""); // Xóa input sau khi gửi
  };

  // Nếu chưa chọn conversation nào, hiển thị một thông báo
  if (!conversationId) {
    return (
        <div className="flex items-center justify-center h-[80vh] bg-gray-50 rounded-xl">
            <p className="text-gray-500">Vui lòng chọn một cuộc hội thoại để bắt đầu.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#B95D26] text-white font-semibold shadow-md">
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
            key={m.id || `msg-${i}`} // Key ổn định hơn
            className={`flex flex-col ${m.sender_type === "ADMIN" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
                m.sender_type === "ADMIN" ? "bg-[#B95D26] text-white" : "bg-gray-200 text-gray-800"
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
      <div className="p-3 border-t border-gray-200 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={sendMessage}
          className="bg-[#B95D26] hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};