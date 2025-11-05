import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface CreateConversationPayload {
  sender_id: number;
  sender_type: 'USER' | 'ADMIN' | 'SUPERADMIN';
  user_id: number;
  store_id: number;
  content: string;
}
export interface SendMessagePayload {
  sender_id: number;
  sender_type: "USER" | "ADMIN" | "SUPERADMIN";
  content: string;
  user_id: number;
  store_id: number;
  conversation_id?: number | null;
}

export const conversationApi = {
  createConversation: async (payload: CreateConversationPayload) => {
    console.log('%c📡 API → createConversation', 'color:violet', payload);
    const res = await axios.post(`${API_URL}/conversations/create-conversation`, payload);
    console.log('%c✅ API response (create):', 'color:lime', res.data);
    return res.data;
  },

  sendMessage: async (payload: SendMessagePayload) => {
    console.log('%c📡 API → sendMessage', 'color:violet', payload);
    const res = await axios.post(`${API_URL}/conversations/send-message`, payload);
    console.log('%c✅ API response (send):', 'color:lime', res.data);
    return res.data;
  },

  getAll: async (store_id?: number) => {
    console.log('%c📡 API → getAll', 'color:violet', store_id);
    const res = await axios.get(`${API_URL}/conversations/get-all`, { params: { store_id } });
    return res.data;
  },

   getByCustomer: async (customer_id: number) => {
    const res = await axios.get(`${API_URL}/conversations/get-by-customer/${customer_id}`);
    return res.data;
  },
  markRead: async (conversation_id: number, user_id: number) => {
    const res = await axios.post(`${API_URL}/conversations/mark-read`, { conversation_id, user_id });
    return res.data;
  },

  getById: async (conversationId: number) => {
    const res = await axios.get(`${API_URL}/conversations/${conversationId}`);
    return res.data;
  },
  getConversationDetail: async (conversationId: number) => {
  const res = await axios.get(`${API_URL}/conversations/get-conversation-detail/${conversationId}`);
  return res.data;
},
};
