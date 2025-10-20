'use client';

import React, { useEffect, useRef, useState } from 'react';
import { conversationApi } from '@/api/modules/conversation';

interface Message {
  id: number | string;
  sender_type: 'USER' | 'ADMIN';
  content: string;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  storeId: number;
  conversationId?: number | null;
}

export function ChatModal({ isOpen, onClose, userId, storeId, conversationId }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (!isOpen) return;

  const fetchConversation = async () => {
  setLoading(true);
  try {
    let convId: number | null | undefined = conversationId;

    // 🔹 Nếu chưa có conversation → tạo mới
    if (!convId) {
      const newConv = await conversationApi.createConversation({
        sender_id: userId,
        sender_type: 'USER',
        user_id: userId,
        store_id: storeId,
        content: 'Bắt đầu trò chuyện',
      });
      convId = newConv.id;
    }

    // 🔹 Đảm bảo có convId mới call API
    if (!convId) throw new Error("Không tìm thấy conversationId hợp lệ");

    // 🔹 Lấy chi tiết hội thoại
    const conv = await conversationApi.getConversationDetail(convId);
    setMessages(conv?.messages || []);
  } catch (err) {
    console.error('❌ Lỗi load messages:', err);
  } finally {
    setLoading(false);
  }
};
  fetchConversation();
}, [isOpen, userId, storeId, conversationId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      await conversationApi.sendMessage({
        sender_id: userId,
        sender_type: 'USER',
        content,
        user_id: userId,
        store_id: storeId,
        conversation_id: conversationId,
      });

      // Giữ tin nhắn mới trong state
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender_type: 'USER', content, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 h-[500px] bg-white rounded-xl shadow-lg flex flex-col border border-gray-200">
      <div className="flex justify-between items-center p-3 bg-green-600 text-white font-semibold">
        <span>💬 Chat với Admin</span>
        <button onClick={onClose} className="text-white text-xl hover:text-gray-200">×</button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">⏳ Đang tải cuộc trò chuyện...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">💬 Bắt đầu trò chuyện với admin...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-3 py-2 rounded-lg max-w-[70%] ${
                  msg.sender_type === 'USER'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-3 border-t bg-white">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending || loading}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          disabled={sending || loading}
        >
          {sending ? '⏳' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
