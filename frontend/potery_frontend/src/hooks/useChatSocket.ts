import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN';
  sender_id: number;
  content: string;
  sent_at: string;
  is_read: boolean;
}

export function useChatSocket(conversationId: number | null, userId: number) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Join room & setup listeners
  useEffect(() => {
    if (!conversationId) return;

    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socketRef.current = socket;

    // Join room
    socket.emit('join_conversation', { conversation_id: conversationId });

    // Listen new messages
    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('new_message', handleNewMessage);

    // Get initial conversation messages
    socket.emit('get_conversation_detail', { conversation_id: conversationId }, (res: any) => {
      if (res?.messages) setMessages(res.messages);
    });

    // Cleanup on unmount or conversation change
    return () => {
      socket.emit('leave_conversation', { conversation_id: conversationId });
      socket.off('new_message', handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  // Send message
  const sendMessage = (content: string) => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit('send_message', {
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: 'USER',
      content,
    });
  };

  return { messages, sendMessage };
}
