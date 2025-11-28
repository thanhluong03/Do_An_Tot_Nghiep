'use client';

import { BotIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:8000/user";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  avatar?: string;
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
  const [userAvatar, setUserAvatar] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ADMIN_AVATAR = "/about.png";
  const WELCOME_MESSAGE = `Xin chào! Mình là AI trợ giúp của bạn. Hỏi mình bất cứ điều gì liên quan đến sản phẩm gốm nhé.`;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: Message = { role: 'assistant', content: WELCOME_MESSAGE, avatar: ADMIN_AVATAR };
      setMessages([welcome]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch user avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const res = await fetch(`${USER_API_URL}/${userId}`);
        const data = await res.json();
        setUserAvatar(data.avatar || '/images/default-user.png');
      } catch (err) {
        console.error('Lỗi fetch avatar user:', err);
        setUserAvatar('/images/default-user.png');
      }
    };
    if (userId) fetchUserAvatar();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input, avatar: userAvatar };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversation_id: conversationId, user_id: userId }),
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
      const errorMessage: Message = {
        role: 'assistant',
        content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}`,
        avatar: ADMIN_AVATAR
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-20 z-[110] w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg flex font-bold text-gray-800"><BotIcon className='mr-2'/> Chat với AI</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <img src={msg.avatar} className="w-7 h-7 rounded-full object-cover" />}
            <div className={`max-w-xs p-3 rounded-xl ${msg.role === 'user' ? 'bg-[#8B7D6B] text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && <img src={msg.avatar} className="w-7 h-7 rounded-full object-cover" />}
          </div>
        ))}
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
