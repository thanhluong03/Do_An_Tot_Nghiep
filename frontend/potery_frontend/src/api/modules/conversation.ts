import axios from "axios";

const API_URL = "http://localhost:3000/conversations";

export interface CreateConversationPayload {
  sender_id: number;
  sender_type: "USER" | "ADMIN";
  content: string;
  user_id: number;
  store_id: number;
}

export interface SendMessagePayload {
  sender_id: number;
  sender_type: "USER" | "ADMIN";
  content: string;
  user_id: number;
  store_id: number;
}

export const conversationApi = {
  createConversation: async (payload: CreateConversationPayload) => {
    const res = await axios.post(`${API_URL}/create-conversation`, payload);
    return res.data;
  },

  sendMessage: async (payload: SendMessagePayload) => {
    const res = await axios.post(`${API_URL}/send-message`, payload);
    return res.data;
  },

  getAll: async (user_id?: number, store_id?: number) => {
    const res = await axios.get(`${API_URL}/get-all`, {
      params: { user_id, store_id },
    });
    return res.data;
  },

  markRead: async (conversationId: number) => {
    const res = await axios.post(`${API_URL}/mark-read`, { conversationId });
    return res.data;
  },
};
