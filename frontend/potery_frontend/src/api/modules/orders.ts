import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  price_at_order: number;
  store_id?: number;
  classification_attribute_relationship_id?: number | null;
  // Optional fields for display purposes
  attribute1_name?: string;
  attribute2_name?: string;
}

export interface CreateOrderPayload {
  customer_id: number;
  shipping_address?: string;
  payment_method?: string; // backend enum, e.g. 'VNPAY'
  items: OrderItemPayload[];
  note?: string;
}

export const orderApi = {
  async createOrder(payload: CreateOrderPayload) {
    const res = await api.post('/orders/createorder', payload);
    console.log("Orders API result:", res);
    return res.data; // { success, message, data }
  },
  async getOrderDetail(id: number | string) {
    const res = await api.get(`/orders/orderdetail/${id}`);
    return res.data;
  },
  async getOrdersByCustomer(customerId: number | string, page = 1, size = 10) {
    const res = await api.get(`/orders/customer/${customerId}`, { params: { page, size } });
    return res.data; // { success, data }
  },
  async updateOrder(id: number | string, data: any, files?: File[]) {
    const formData = new FormData();

    // Add JSON data
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('reason_change_images', file);
      });
    }

    const res = await api.put(`/orders/updateorder/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};


