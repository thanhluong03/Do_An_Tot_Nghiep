import axios from "axios";
import { get } from "http";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const conversationApi = {
  getConversationsByCustomer: async (customerId: number) => {
    const res = await axios.get(`${API_URL}/conversations/get-by-customer/${customerId}`);
    return res.data;
  },
  getConversationDetail: async (id: number) => {
    const res = await axios.get(`${API_URL}/conversations/get-conversation-detail/${id}`);
    return res.data;
  },
  getAll: async () => {
    const res = await axios.get(`${API_URL}/conversations/get-all`);
    return res.data;
  }
};
