"use client";
import React, { useEffect, useState } from "react";
import { conversationApi } from "@/api/services/conversationApi";
import { getCustomers, Customer } from "@/api/services/customerService";
import { AdminChatBox } from "@/components/adminChat/AdminChatBox";

export default function AdminChatPage() {
    const [selectedConv, setSelectedConv] = useState<number | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const adminId = 1; // 👈 ID admin đang đăng nhập

    useEffect(() => {
        const load = async () => {
            const data = await conversationApi.getAll();
            // Nếu API có trả last_message_time
            const sorted = [...data].sort((a, b) =>
                new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime()
            );
            setConversations(sorted);
            if (sorted.length > 0) setSelectedConv(sorted[0].id);
        };
        const loadCustomers = async () => {
            const list = await getCustomers();
            setCustomers(list);
        };
        load();
        loadCustomers();
    }, []);

    const getCustomer = (customerId: number) =>
        customers.find((c) => c.id === customerId);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-50 rounded-xl shadow-inner overflow-hidden">
            {/* Sidebar danh sách hội thoại */}
            <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    💬 Danh sách hội thoại
                </h2>

                {conversations.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                        Không có hội thoại nào.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((conv) => {
                            const customer = getCustomer(conv.customerId);
                            const isActive = conv.id === selectedConv;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isActive
                                            ? "bg-blue-50 border-blue-500 shadow-sm"
                                            : "hover:bg-gray-50 border-transparent"
                                        }`}
                                >
                                    <img
                                        src={
                                            customer?.avatar_image
                                                ? `data:image/png;base64,${customer.avatar_image}`
                                                : "/default-avatar.png"
                                        }
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full object-cover border"
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
            <div className="flex-1 bg-gray-100 p-4">
                {selectedConv ? (
                    <AdminChatBox
                        conversationId={selectedConv}
                        currentAdminId={adminId}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                        Chọn một hội thoại để bắt đầu trò chuyện 💬
                    </div>
                )}
            </div>
        </div>
    );
}
