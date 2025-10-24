'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BaseLayout } from '@/layouts';

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

// Interface for chat messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export const AIChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  // Use a fixed conversation ID for simplicity, or you can manage this per user
  const [conversationId] = useState<string>('user-chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      console.error('Lỗi chat:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    // You might want to generate a new ID here if you track conversations per user session
    // setConversationId(uuidv4()); 
  };

  return (
      <div className="flex h-[calc(100vh-80px)] bg-gray-50 justify-center">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col max-w-4xl">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">🤖 Chat với AI</h1>
            <p className="text-gray-600">Hỏi bất cứ điều gì về sản phẩm và dịch vụ của chúng tôi.</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 border-t border-gray-300/50 pt-2">
                      <h4 className="text-xs font-semibold mb-1">📚 Nguồn tham khảo:</h4>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {msg.sources.map((source, i) => (
                          <li key={i}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
             {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="max-w-xl p-4 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex items-center space-x-2">
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
          <div className="p-6 border-t bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Gửi
              </button>
              <button
                type="button"
                onClick={handleNewConversation}
                className="p-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                title="Cuộc trò chuyện mới"
              >
                🆕
              </button>
            </form>
          </div>
        </main>
      </div>
  );
};

export default AIChatPage;
