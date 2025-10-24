'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId] = useState<string>('user-ai-chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversation_id: conversationId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Lỗi khi chat với bot');

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        sources: result.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-[110] w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">🤖 Chat với AI</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-xl ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
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

      {/* Input Form */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};