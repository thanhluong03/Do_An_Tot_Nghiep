import axios from "axios";

const API_URL = "http://localhost:3000/conversations";

export interface CreateConversationPayload {
  sender_id: number;
  sender_type: 'USER' | 'ADMIN';
  user_id: number;
  store_id: number;
  content: string;
}


export interface SendMessagePayload {
  sender_id: number;
  sender_type: "USER" | "ADMIN";
  content: string;
  user_id: number;
  store_id: number;
  conversation_id?: number | null;
}

export const conversationApi = {
  createConversation: async (payload: CreateConversationPayload) => {
    console.log('%c📡 API → createConversation', 'color:violet', payload);
    const res = await axios.post(`${API_URL}/create-conversation`, payload);
    console.log('%c✅ API response (create):', 'color:lime', res.data);
    return res.data;
  },

  sendMessage: async (payload: SendMessagePayload) => {
    console.log('%c📡 API → sendMessage', 'color:violet', payload);
    const res = await axios.post(`${API_URL}/send-message`, payload);
    console.log('%c✅ API response (send):', 'color:lime', res.data);
    return res.data;
  },

  getAll: async (store_id?: number) => {
    console.log('%c📡 API → getAll', 'color:violet', store_id);
    const res = await axios.get(`${API_URL}/get-all`, { params: { store_id } });
    return res.data;
  },

  getByUser: async (user_id: number) => {
    console.log('%c📡 API → getByUser', 'color:violet', user_id);
    const res = await axios.get(`${API_URL}/get-by-user/${user_id}`);
    return res.data;
  },

  markRead: async (conversationId: number) => {
    const res = await axios.post(`${API_URL}/mark-read`, { conversationId });
    return res.data;
  },

  getById: async (conversationId: number) => {
    const res = await axios.get(`${API_URL}/${conversationId}`);
    return res.data;
  },
};
