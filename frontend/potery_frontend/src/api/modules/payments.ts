import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

export const paymentApi = {
  async createMomoPayment(order_id: number, amount: number) {
    console.log('🌐 Making MoMo payment request to:', `${API_BASE_URL}/paymenttransaction/momo`);
    console.log('📤 Request payload:', { order_id, amount, amountType: typeof amount });

    // Đảm bảo amount là number và không phải NaN
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // Đảm bảo order_id là number và hợp lệ
    if (!order_id || isNaN(Number(order_id))) {
      throw new Error(`Invalid order_id: ${order_id}`);
    }

    // Làm tròn amount thành số nguyên (MOMO API yêu cầu số nguyên)
    const roundedAmount = Math.round(Number(amount));
    console.log('🔢 Amount rounded:', { original: amount, rounded: roundedAmount });

    try {
      const res = await api.post('/paymenttransaction/momo', {
        order_id: Number(order_id),
        amount: roundedAmount,
      });

      console.log('📥 API Response status:', res.status);
      console.log('📥 API Response data:', res.data);

      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('🚨 Axios Error:', error.message);
        console.error('🚨 Request config:', {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        });

        if (error.response) {
          console.error('🚨 Error response:', error.response.data);
          console.error('🚨 Error status:', error.response.status);
          console.error('🚨 Error headers:', error.response.headers);
        }
      } else {
        console.error('🚨 Unknown error:', error);
      }

      throw error;
    }
  },
};
