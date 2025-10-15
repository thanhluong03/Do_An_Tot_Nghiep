import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export interface AddCartItemPayload {
  customer_id: string | number;
  product_id: string | number;
  quantity: number;
  store_id:string | number;
}

export const cartApi = {
  async add(payload: AddCartItemPayload) {
    // Backend expects an array of items
    const coerced = {
      customer_id: Number(payload.customer_id),
      product_id: Number(payload.product_id),
      store_id: Number(payload.store_id),
      quantity: Number(payload.quantity || 1),
    };
    const res = await api.post('/cartitems/createcartitem', [coerced]);
    // Returns an array of { message, cartItem }
    const data = res.data;
    return Array.isArray(data) ? data[0] : data;
  },
  async getByCustomer(customerId: string | number) {
    const res = await api.get(`/cartitems/cartitemcustomer/${customerId}`);
    const data = res.data;
    return Array.isArray(data?.cartItems) ? data.cartItems : [];
  },
  async update(id: string | number, data: { quantity: number }) {
    const res = await api.put(`/cartitems/updatecartitem/${id}`, data);
    return res.data;
  },
  async remove(id: string | number) {
    const res = await api.delete(`/cartitems/deletecartitem/${id}`);
    return res.data;
  },
};


