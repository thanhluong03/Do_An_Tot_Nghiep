import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface AddCartItemPayload {
  customer_id: string | number;
  product_id: string | number;
  quantity: number;
}

export async function addToCart(payload: AddCartItemPayload) {
  const res = await api.post('/cartitems/createcartitem', payload);
  return res.data;
}

export async function getCartByCustomer(customerId: string | number) {
  const res = await api.get(`/cartitems/cartitemcustomer/${customerId}`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function updateCartItem(id: string | number, quantity: number) {
  const res = await api.put(`/cartitems/updatecartitem/${id}`, { quantity });
  return res.data;
}

export async function removeCartItem(id: string | number) {
  const res = await api.delete(`/cartitems/deletecartitem/${id}`);
  return res.data;
}


