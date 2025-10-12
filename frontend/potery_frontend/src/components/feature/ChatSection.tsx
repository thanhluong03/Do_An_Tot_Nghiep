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
}

export function ChatModal({ isOpen, onClose, userId, storeId }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khi mở chat -> load hoặc tạo conversation
  useEffect(() => {
    if (!isOpen || !userId || !storeId) return;

    (async () => {
      setLoading(true);
      try {
        // Lấy danh sách conversation của user
        const allConvs = await conversationApi.getAll(userId, storeId);
        let conv = allConvs?.find(
          (c: any) => c.user_id === userId && c.store_id === storeId
        );

        // Nếu chưa có thì tạo conversation mới
        if (!conv) {
          conv = await conversationApi.createConversation({
            sender_id: userId,
            sender_type: 'USER',
            content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
            user_id: userId,
            store_id: storeId,
          });
        }

        // Lưu id & tin nhắn
        setConversationId(conv.id);
        setMessages(conv.messages || []);
      } catch (err) {
        console.error('❌ Lỗi khi tải/tạo cuộc trò chuyện:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, userId, storeId]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !conversationId || !userId) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      // Gửi tin nhắn lên server
      await conversationApi.sendMessage({
        sender_id: userId,
        sender_type: 'USER',
        content,
        user_id: userId,
        store_id: storeId,
      });

      // Hiển thị tin nhắn mới ngay lập tức
      const newMessage: Message = {
        id: Date.now(),
        sender_type: 'USER',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // (Tùy chọn) đồng bộ lại từ DB sau 1s
      setTimeout(async () => {
        try {
          const allConvs = await conversationApi.getAll(userId, storeId);
          const conv = allConvs?.find(
            (c: any) => c.user_id === userId && c.store_id === storeId
          );
          if (conv) setMessages(conv.messages || []);
        } catch (err) {
          console.error('Lỗi đồng bộ tin nhắn:', err);
        }
      }, 1000);
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[95] w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-green-600 text-white font-semibold">
        <span>💬 Chat với Admin</span>
        <button
          onClick={onClose}
          className="text-white text-xl hover:text-gray-200"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">
            ⏳ Đang tải cuộc trò chuyện...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            💬 Bắt đầu trò chuyện với admin...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[70%] ${
                  msg.sender_type === 'USER'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
