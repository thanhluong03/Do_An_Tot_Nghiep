import axios from "axios";
import { get } from "http";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
interface Conversation {
  id: number;
  user_id: number;
  customer_id: number;
  last_message?: string;
  last_message_time?: string;
}
export const conversationApi = {
  getConversationsByCustomer: async (customerId: number) => {
    const res = await axios.get(`${API_URL}/conversations/get-by-customer/${customerId}`);
    return res.data;
  },
  getConversationDetail: async (id: number) => {
    const res = await axios.get(`${API_URL}/conversations/get-conversation-detail/${id}`);
    return res.data;
  },
  async getAll(): Promise<Conversation[]> {
    const res = await axios.get(`${API_URL}/conversations/get-all`);
    // ✅ Backend trả { success, message, data: [...] }
    return res.data.data || [];
  },
}
