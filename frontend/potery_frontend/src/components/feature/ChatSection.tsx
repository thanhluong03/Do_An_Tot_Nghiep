// ChatModal with avatar support
// USER avatar: from API (msg.user_avatar)
// ADMIN avatar: fixed image URL

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { conversationApi } from '@/api/modules/conversation';

interface Message {
  id?: number | string;
  sender_type: 'USER' | 'ADMIN';
  content: string;
  sent_at: string;
  conversation_id: number;
  user_avatar?: string; // <-- thêm avatar user từ API
}

interface ConversationDetail {
  conversation: { id: number; user_id: number; customer_id: number; started_at?: string } | null;
  messages: Message[];
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
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<number | null>(conversationId || null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userAvatar, setUserAvatar] = useState<string>('');

  const ADMIN_AVATAR = "/about.png"; // <-- ảnh cố định cho chủ cửa hàng
  const USER_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${USER_API_BASE_URL}/customers/customerdetail/${userId}`);
        const data = await res.json();
        const avatarData = data.avatar || data.avatar_image;
        if (avatarData) {
            if (avatarData.startsWith('http') || avatarData.startsWith('data:image')) {
                setUserAvatar(avatarData);
            } else {
                setUserAvatar(`data:image/jpeg;base64,${avatarData}`);
            }
        } else {
            setUserAvatar('/images/default-avatar.jpg');
        }
      } catch (err) {
        console.error('Lỗi fetch avatar user:', err);
        setUserAvatar('/star.png');
      }
    };

    if (isOpen) {
      fetchUserAvatar();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;

    let currentConvId = convId || conversationId;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    const fetchHistory = (id: number) => {
      setLoading(true);
      socket.emit("get_conversation_detail", { conversation_id: id }, (res: ConversationDetail) => {
        const list = res?.messages || [];
        const withAvatar = list.map(m => ({ ...m, user_avatar: userAvatar }));
        setMessages(withAvatar);
        setLoading(false);
      });
    };

    const initConversation = async (socketInstance: Socket) => {
      setLoading(true);
      try {
        const res = await conversationApi.createConversation({
          sender_id: userId,
          sender_type: 'USER',
          user_id: userId,
          store_id: storeId,
          content: '',
        });

        const id = res?.id;
        if (!id) throw new Error('Không nhận được conversation_id từ server');

        setConvId(id);
        currentConvId = id;

        socketInstance.emit('join_conversation', { conversation_id: id });

        const withAvatar = (res?.messages || []).map((m: Message) => ({
        ...m,
        user_avatar: userAvatar,
      }));
      
        setMessages(withAvatar);
      } catch (err) {
        console.error('❌ Lỗi khởi tạo chat:', err);
      } finally {
        setLoading(false);
      }
    };

    socket.on('connect', () => {
      if (!currentConvId) {
        initConversation(socket);
      } else {
        if (!convId) setConvId(currentConvId);
        socket.emit('join_conversation', { conversation_id: currentConvId });
        fetchHistory(currentConvId);
      }
    });

    const handleNewMessage = (msg: Message) => {
      if (msg.conversation_id === currentConvId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id);
          if (exists) return prev;
          return [...prev, { ...msg, user_avatar: userAvatar }];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, userId, storeId, conversationId, userAvatar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !convId || !socketRef.current) return;

    const msg = {
      conversation_id: convId,
      sender_id: userId,
      sender_type: 'USER' as 'USER',
      content: input.trim(),
      user_id: userId,
      store_id: storeId,
    };

    try {
      setSending(true);
      socketRef.current.emit('send_message', msg);
      setInput('');
    } catch (error) {
      console.error('❌ Gửi lỗi:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-17 z-50 w-80 h-[500px] bg-[#8B7D6B] shadow-lg rounded-2xl flex flex-col ">
      <div className="flex justify-between items-center p-4 bg-[#8B7D6B] rounded-t-lg text-white font-semibold">
        <span>Chat Cùng Tiệm Gốm</span>
        <button onClick={onClose} className="text-white text-xl hover:text-gray-200">×</button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400 mt-10">⏳ Đang tải...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Bắt đầu trò chuyện...</div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex items-end gap-2 ${msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender_type === 'ADMIN' && (
                <img src={ADMIN_AVATAR} className="w-7 h-7 rounded-full object-cover" />
              )}

              <div className={`px-3 py-2 rounded-lg max-w-[70%] ${msg.sender_type === 'USER' ? 'bg-[#8B7D6B] text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs mt-1 text-right opacity-80">
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {msg.sender_type === 'USER' && (
                <img
                  src={msg.user_avatar || '/images/default-avatar.jpg'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-3 border-t border-gray-300 bg-white">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending || loading}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-[#8B7D6B] text-white rounded-lg font-semibold disabled:opacity-50"
          disabled={sending || loading}
        >
          {sending ? '⏳' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
