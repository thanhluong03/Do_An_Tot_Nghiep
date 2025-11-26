import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000 // 30s timeout
});

export const paymentApi = {
  async createMomoPayment(order_id: number, amount: number) {
    console.log('🌐 Making MoMo payment request to:', `${API_BASE_URL}/paymenttransaction/momo`);
    console.log('📤 Request payload:', { order_id, amount });

    try {
      const res = await api.post('/paymenttransaction/momo', {
        order_id: order_id,
        amount,
      });

      console.log('📥 API Response status:', res.status);
      console.log('📥 API Response data:', res.data);

      return res.data;
    } catch (error) {
      console.error('🚨 API Error:', error);
      if (error.response) {
        console.error('🚨 Error response:', error.response.data);
        console.error('🚨 Error status:', error.response.status);
      }
      throw error;
    }
  },
};


