// src/api/services/orderService.ts
import axios from 'axios';
const API_URL_STORES = "http://localhost:3000/stores"; 
const API_URL = 'http://localhost:3000/orders'; 
export interface OrderItem {
    product_id: number;
    store_id?: number;
    quantity: number;
    price_at_order: number;
    product_name?: string;
    description?: string;
    price?: string; 
    category_id?: number;
    category_name?: string;
    store_name?: string;
    store_address?: string;

}

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELED' | 'REJECTED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'ONSITE' | 'BANK_TRANSFER' | 'CARD';

export interface CurrentOrderDetails {
    customer_id: number;
    shipping_address: string;
    voucher_id: number | null;
    total_amount: number;
    discount_amount: number;
    original_amount: number;
    items: OrderItem[]; 
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    order_date: string;
}

export interface Order {
    id: number;
    created_at?: string; 
    updated_at?: string; 
    deleted_at?: string | null;
    customer_id: number;
    customer_full_name?: string;  
    order_date: string;
    total_amount: string | number; 
    customer_name?: string;
    status: OrderStatus;
    shipping_address?: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    current_order?: CurrentOrderDetails; 
    items?: OrderItem[]; 
}

export interface ListOrderParams {
    page?: number;
    size?: number;
    key?: string;
    customer_id?: number;
    store_id?: number | "";
    status?: OrderStatus | "";
    payment_status?: PaymentStatus | ""; 
}

export interface UpdateOrderPayload {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_address?: string;
    payment_method?: PaymentMethod;
}
export interface Store {
  id: number;
  name: string;
}

export const listDropdownStores = async (): Promise<Store[]> => {
  const res = await axios.get(`${API_URL_STORES}/liststore`);
  const storesData = res.data.stores || res.data;
  const stores: Store[] = Array.isArray(storesData) ? storesData : [];
  return stores.map(s => ({
    id: s.id as number,
    name: s.name || s.store_name || s.storeName || "Không rõ tên"
  }));
};


export async function listOrders(params: ListOrderParams): Promise<Order[]> {
    const res = await axios.get(`${API_URL}/listorders`, { params });
    return res.data.data || [];
}


export async function getOrderDetail(id: number): Promise<Order> {
    const res = await axios.get(`${API_URL}/orderdetail/${id}`);
    return res.data.data;
}

export async function updateOrder(id: number, data: UpdateOrderPayload): Promise<void> {
    await axios.put(`${API_URL}/updateorder/${id}`, data);
}

export async function deleteOrder(id: number): Promise<void> {
    await axios.delete(`${API_URL}/deleteorder/${id}`);
}


export async function getRevenueData(): Promise<{ month: string; revenue: number }[]> {
  const orders = await listOrders({});
  const map = new Map<string, number>();

  orders.forEach(order => {
    if (order.status === 'DELIVERED' && order.total_amount) {
      const month = new Date(order.order_date).toLocaleString('en-US', { month: 'short' });
      const prev = map.get(month) || 0;
      map.set(month, prev + Number(order.total_amount));
    }
  });

  return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }));
}
