import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export const paymentApi = {
  async createVnPayPayment(orderId: number, amount: number, returnUrl?: string) {
    const res = await api.post('/paymenttransaction/vnpay', {
      order_id: orderId,
      amount,
      return_url: returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/store/orders` : ''),
    });
    // Return raw response data; caller will pick the correct URL field
    return res.data;
  },
};


