'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { conversationApi } from '@/api/modules/conversation';

interface Message {
  id?: number;
  sender_type: 'USER' | 'ADMIN';
  content: string;
  sent_at: string;
  conversation_id: number;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  storeId: number;
  conversationId?: number | null;
}

export function ChatModal({
  isOpen,
  onClose,
  userId,
  storeId,
  conversationId,
}: ChatModalProps) {
  const socketRef = useRef<Socket | null>(null); // ✅ useRef thay vì let socket
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<number | null>(conversationId || null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Kết nối WebSocket khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    console.log('🟢 Socket connected');

    return () => {
      console.log('🔴 Socket disconnected');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen]);

  // ✅ Tạo hoặc load conversation khi mở
  useEffect(() => {
    if (!isOpen) return;

    const initConversation = async () => {
      setLoading(true);
      try {
        let id = convId;

        // 🟢 Nếu chưa có conversation → tạo mới
        if (!id) {
          const res = await conversationApi.createConversation({
            sender_id: userId,
            sender_type: 'USER',
            user_id: userId,
            store_id: storeId,
            content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
          });

          id = res?.id;
          if (!id) throw new Error('Không nhận được conversation_id từ server');
          setConvId(id);
        }

        // 🟢 Join room WebSocket
        socketRef.current?.emit('join_conversation', { conversation_id: id });

        // 🟢 Lấy lịch sử tin nhắn qua API
        const history = await conversationApi.getConversationDetail(id);
        setMessages(history?.messages || []);
      } catch (err) {
        console.error('❌ Lỗi khởi tạo chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [isOpen, userId, storeId]);

  // ✅ Lắng nghe tin nhắn mới (1 lần duy nhất / mỗi conv)
  useEffect(() => {
    const socket = socketRef.current;
    if (!isOpen || !socket || !convId) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === convId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new_message', handleNewMessage);
    console.log('📩 Listener attached for conversation', convId);

    return () => {
      socket.off('new_message', handleNewMessage);
      console.log('🧹 Listener removed');
    };
  }, [isOpen, convId]);

  // ✅ Cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !convId || !socketRef.current) return;

    const msg = {
      conversation_id: convId,
      sender_id: userId,
      sender_type: 'USER',
      content: input.trim(),
      user_id: userId,
      store_id: storeId,
    };

    try {
      setSending(true);
      socketRef.current.emit('send_message', msg);

      // Hiển thị ngay trên client
      setMessages((prev) => [
        ...prev,
        { ...msg, sent_at: new Date().toISOString() } as Message,
      ]);
      setInput('');
    } catch (error) {
      console.error('❌ Gửi tin nhắn lỗi:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 h-[500px] bg-white rounded-xl shadow-lg flex flex-col border border-gray-200">
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

      {/* Nội dung chat */}
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
          messages.map((msg, i) => (
            <div
              key={i}
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
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.sent_at).toLocaleTimeString([], {
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

      {/* Ô nhập tin */}
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
