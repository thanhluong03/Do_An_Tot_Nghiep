"use client";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { conversationApi } from "@/api/services/conversationApi";
import { getCustomers, Customer } from "@/api/services/customerService";
import { AdminChatBox } from "@/components/adminChat/AdminChatBox";
import { useSearchParams } from "next/navigation";

interface Conversation {
  id: number;
  user_id: number;
  customer_id: number;
  last_message?: string;
  last_message_time?: string;
  unread?: boolean;

}

export default function AdminChatPage() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "ADMIN").toUpperCase();
  const senderType = roleParam === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN";

  const adminId = 1;

  // 🔹 Load danh sách hội thoại & khách hàng
  useEffect(() => {
    const load = async () => {
      try {
        const data = await conversationApi.getAll();
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.last_message_time || 0).getTime() -
            new Date(a.last_message_time || 0).getTime()
        );
        setConversations(sorted);
        if (sorted.length > 0 && !selectedConv) {
          setSelectedConv(sorted[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách hội thoại:", error);
      }
    };

    const loadCustomers = async () => {
      try {
        const list = await getCustomers();
        setCustomers(list);
      } catch (error) {
        console.error("Lỗi tải danh sách khách hàng:", error);
      }
    };

    load();
    loadCustomers();
  }, []);

  // 🔹 Kết nối socket để realtime cập nhật danh sách
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected (Admin list)");
    });

    // Khi có tin nhắn mới -> cập nhật danh sách hội thoại
    socket.on("conversation_updated", (msg: any) => {
      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c.id === msg.conversation_id);

        // 🚨 Lấy ID và loại người gửi tin nhắn cuối cùng
        const lastSenderId = msg.sender_id;
        const isFromStaff = msg.sender_type === "ADMIN" || msg.sender_type === "SUPERADMIN";

        if (idx !== -1) {
          // Cập nhật hội thoại hiện có
          updated[idx] = {
            ...updated[idx],
            last_message: msg.content,
            last_message_time: msg.sent_at,
            // Cập nhật người gửi tin nhắn cuối cùng
            user_id: lastSenderId,
            unread: !isFromStaff,
          };
        } else {
          // Nếu hội thoại mới (chưa có), thêm vào đầu danh sách
          updated.unshift({
            id: msg.conversation_id,
            user_id: lastSenderId,
            customer_id: lastSenderId, // Giả định customer_id = sender_id nếu là hội thoại mới
            last_message: msg.content,
            last_message_time: msg.sent_at,
            unread: !isFromStaff,
          });
        }

        updated.sort(
          (a, b) =>
            new Date(b.last_message_time || 0).getTime() -
            new Date(a.last_message_time || 0).getTime()
        );
        return updated;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const getCustomer = (customerID: number) =>
    customers.find((c) => c.id === customerID);

  const currentConv = conversations.find((c) => c.id === selectedConv);
  const selectedCustomer = currentConv
    ? getCustomer(currentConv.customer_id)
    : null;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-orange-50 rounded-xl shadow-inner overflow-hidden border border-orange-100">
      {/* Sidebar danh sách hội thoại */}
      <div className="w-1/4 border-r border-orange-200 bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-[#B95D26] flex items-center gap-2">
          Danh sách hội thoại khách hàng
        </h2>

        {conversations.length === 0 ? (
          <p className="text-gray-500 text-sm italic">
            Không có hội thoại nào.
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const customer = getCustomer(conv.customer_id);
              const isActive = conv.id === selectedConv;

              const isLastMessageFromAdmin = conv.user_id === adminId;
              const lastMessageContent = conv.last_message || "Chưa có tin nhắn";
              const displayMessage = isLastMessageFromAdmin
                ? `Bạn: ${lastMessageContent}`
                : lastMessageContent;

              const displayTime = conv.last_message_time
                ? new Date(conv.last_message_time).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConv(conv.id);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
                    );
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border 
                    ${isActive
                      ? "bg-orange-50 border-orange-200 shadow-sm"
                      : "hover:bg-orange-50 border-transparent"
                    }`}
                >
                  <img
                    src={
                      customer?.avatar_image
                        ? `data:image/png;base64,${customer.avatar_image}`
                        : "/noAva.png"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-orange-300"
                  />
                  <div className="flex flex-col flex-grow min-w-0 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {customer?.full_name || customer?.username || "Khách hàng"}
                      </span>

                      {/* 🔹 Dấu chấm nhỏ báo chưa đọc */}
                      {conv.unread && (
                        <span className="w-3 h-3 bg-[#B95D26] rounded-full flex-shrink-0"></span>
                      )}
                    </div>

                    <div className="flex items-end justify-between min-w-0">
                      <span
                        className={`text-xs truncate max-w-[calc(100%-40px)] ${conv.unread ? "font-semibold text-gray-900" : "text-gray-400"
                          }`}
                      >
                        {displayMessage}
                      </span>

                      <div className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {displayTime}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Khung chat */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConv ? (
          <AdminChatBox
            conversationId={selectedConv}
            currentAdminId={adminId}
            customer={selectedCustomer}
            senderType={senderType}
          />
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Chọn một hội thoại để bắt đầu trò chuyện
          </div>
        )}
      </div>

    </div>
  );
}