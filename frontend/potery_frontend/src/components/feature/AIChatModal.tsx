'use client';

import { BotIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
const USER_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  avatar?: string; // avatar cho cả user & admin
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId] = useState<string>('user-ai-chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>('/images/default-avatar.jpg');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ADMIN_AVATAR = "/about.png";

  const WELCOME_MESSAGE =
    `Xin chào! Mình là AI trợ giúp của bạn. Hỏi mình bất cứ điều gì liên quan đến sản phẩm gốm nhé.`;

  // =============================
  // FETCH USER AVATAR (giống 100% ChatModal)
  // =============================

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`${USER_API_BASE_URL}/customers/customerdetail/${userId}`);
        const data = await res.json();

        const avatarData = data.avatar || data.avatar_image;

        if (avatarData) {
          if (avatarData.startsWith("http") || avatarData.startsWith("data:image")) {
            setUserAvatar(avatarData);
          } else {
            setUserAvatar(`data:image/jpeg;base64,${avatarData}`);
          }
        } else {
          setUserAvatar('/images/default-avatar.jpg');
        }
      } catch (err) {
        console.error("Lỗi fetch avatar user:", err);
        setUserAvatar('/images/default-avatar.jpg');
      }
    };

    if (isOpen) fetchUserAvatar();
  }, [isOpen, userId]);


  // =============================
  // WELCOME MESSAGE
  // =============================

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: WELCOME_MESSAGE, avatar: ADMIN_AVATAR }
      ]);
    }
  }, [isOpen]);


  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  if (!isOpen) return null;


  // =============================
  // HANDLE SEND
  // =============================

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Tin nhắn user luôn gắn avatar user
    const userMessage: Message = {
      role: 'user',
      content: input,
      avatar: userAvatar || '/images/default-avatar.jpg'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId,
          user_id: userId
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Lỗi khi chat với bot');

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        sources: result.sources,
        avatar: ADMIN_AVATAR
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}`,
          avatar: ADMIN_AVATAR
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  // =============================
  // RENDER UI
  // =============================

  return (
    <div className="fixed bottom-10 right-20 z-[110] w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">

      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg flex font-bold text-gray-800">
          <BotIcon className='mr-2' /> Chat với AI
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {/* Avatar admin */}
            {msg.role === 'assistant' && (
              <img
                src={msg.avatar || ADMIN_AVATAR}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}

            {/* MESSAGE BUBBLE */}
            <div className={`max-w-xs p-3 rounded-xl ${
              msg.role === 'user'
                ? 'bg-[#8B7D6B] text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>

            {/* Avatar user */}
            {msg.role === 'user' && (
              <img
                src={msg.avatar || '/images/default-avatar.jpg'}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}

          </div>
        ))}

        {/* Typing animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-xl bg-gray-100">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>


      {/* INPUT */}
      <div className="p-4 border-t border-gray-500">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B7D6B]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-[#8B7D6B] text-white font-semibold rounded-lg text-sm hover:bg-[#8B7D6B]/80"
          >
            Gửi
          </button>
        </form>
      </div>

    </div>
  );
};
