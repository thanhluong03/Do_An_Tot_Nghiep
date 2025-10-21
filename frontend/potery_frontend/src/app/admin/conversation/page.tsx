"use client";
import React, { useEffect, useState } from "react";
// ✅ Import đúng hàm API
import { conversationApi } from "@/api/services/conversationApi"; 
import { getCustomers, Customer } from "@/api/services/customerService";
import { AdminChatBox } from "@/components/adminChat/AdminChatBox";

// Giả định entity Conversation trả về từ API 'getAll'
interface Conversation {
  id: number;
  user_id: number; // ID của Admin
  customer_id: number; // ID của Customer
  last_message_time?: string; // (Giữ lại logic sort của bạn)
  // Thêm các thuộc tính khác nếu có
}

export default function AdminChatPage() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]); // Gõ kiểu Conversation
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Lấy ID admin đang đăng nhập (ví dụ)
  const adminId = 1; // (Bạn có thể lấy từ context/session)

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ LỖI 1: SỬA LẠI HÀM API
        // Gọi 'getAll' để lấy logic "Hộp thư chung"
        const data: Conversation[] = await conversationApi.getAll();
        
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.last_message_time || 0).getTime() -
            new Date(a.last_message_time || 0).getTime()
        );
        
        setConversations(sorted);
        // Tự động chọn hội thoại đầu tiên
        if (sorted.length > 0) {
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
  }, []); // Chỉ cần chạy 1 lần

  // Hàm helper tìm khách hàng
  const getCustomer = (customerID: number) =>
    customers.find((c) => c.id === customerID);

  // Lấy thông tin customer cho hội thoại đang chọn
  const currentConv = conversations.find((c) => c.id === selectedConv);
  
  // ✅ LỖI 2: SỬA LẠI user_id -> customer_id
  const selectedCustomer = currentConv
    ? getCustomer(currentConv.customer_id) // Dùng customer_id
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
              // ✅ LỖI 2: SỬA LẠI user_id -> customer_id
              const customer = getCustomer(conv.customer_id); // Dùng customer_id
              const isActive = conv.id === selectedConv;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border 
                    ${
                      isActive
                        ? "bg-orange-100 border-orange-200 shadow-sm"
                        : "hover:bg-orange-50 border-transparent"
                    }`}
                >
                  <img
                    src={
                      customer?.avatar_image
                        ? `data:image/png;base64,${customer.avatar_image}`
                        : "/default-avatar.png"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-orange-300"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {customer?.full_name || customer?.username || "Khách hàng"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Chat #{conv.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Khung chat */}
      <div className="flex-1 bg-white p-4">
        {selectedConv ? (
          <AdminChatBox
            conversationId={selectedConv}
            currentAdminId={adminId}
            customer={selectedCustomer}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Chọn một hội thoại để bắt đầu trò chuyện
          </div>
        )}
      </div>
    </div>
  );
}