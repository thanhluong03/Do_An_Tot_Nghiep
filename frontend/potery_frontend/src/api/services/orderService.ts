// src/api/services/orderService.ts
import axios from 'axios';

export interface OrderItem {
    product_id: number;
    store_id: number;
    quantity: number;
    price_at_order: number;
    product_name?: string;
    description?: string;
    price?: number;
    category_id?: number;
    category_name?: string;
    store_name?: string;
    store_address?: string;
}

export type OrderStatus = 'CREATED' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'ONSITE' | 'BANK_TRANSFER' | 'CARD';

export interface Order {
    id: number;
    customer_id: number;
    shipping_address?: string;
    payment_method: PaymentMethod;
    status: OrderStatus;
    payment_status: PaymentStatus;
    total_amount: number;
    items: OrderItem[];
    order_date: string;
}

export interface ListOrderParams {
    page?: number;
    size?: number;
    key?: string;
    customer_id?: number;
}

export interface UpdateOrderPayload {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_address?: string;
    payment_method?: PaymentMethod;
}

const API_URL = 'http://localhost:3000/orders'; 

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