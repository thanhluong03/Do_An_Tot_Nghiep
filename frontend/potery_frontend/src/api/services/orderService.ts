// src/api/services/orderService.ts
import axios from 'axios';

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

export type OrderStatus = 'CREATED' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'ONSITE' | 'BANK_TRANSFER' | 'CARD';

// ✅ NEW: Định nghĩa cho trường current_order (chi tiết đầy đủ)
export interface CurrentOrderDetails {
    customer_id: number;
    shipping_address: string;
    voucher_id: number | null;
    total_amount: number; // Trong current_order có thể là number
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
    order_date: string;
    // ✅ UPDATED: Giữ lại là string để khớp với dữ liệu gốc của listOrders/getOrderDetail (nếu API trả về string)
    total_amount: string | number; 
    status: OrderStatus;
    shipping_address?: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    
    // ✅ ADDED: Trường này cần cho chi tiết đơn hàng
    current_order?: CurrentOrderDetails; 
    
    // Giữ lại items ở cấp độ gốc cho trường hợp đơn giản hơn
    items?: OrderItem[]; 
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

// ✅ getOrderDetail giờ trả về Order với cấu trúc chi tiết
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