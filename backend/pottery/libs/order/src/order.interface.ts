export interface IOrderItem {
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

import type { OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
export interface ICreateOrder {
    customer_id: number;
    shipping_address?: string;
    payment_method?: PaymentMethod;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    items: IOrderItem[];
}

export interface IUpdateOrder {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_address?: string;
    payment_method?: PaymentMethod;
    items?: IOrderItem[];
}

export interface IListOrder {
    page: number;
    size: number;
    key?: string;
    customer_id?: number;
    store_id?: number; // Thêm store_id (number)
    status?: OrderStatus; // ✅ ĐÃ SỬA: Dùng OrderStatus enum
    payment_status?: PaymentStatus; 
}
