export interface IOrderItem {
    product_id: number;
    store_id: number;
    quantity: number;
    price_at_order: number;
    classification_attribute_relationship_id?: number;
    attribute1_name?: string;
    attribute2_name?: string;
    shipping_fee?: number;
    shipping_message?: string;
    product_name?: string;
    product_images?: {
        id?: number;
        image_data: string;
        is_main_image?: boolean;
        priority?: number;
    }[];
    description?: string;
    price?: number;
    category_id?: number;
    category_name?: string;
    store_name?: string;
    store_address?: string;
}

import type { OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
export interface ICreateOrder {
    customer_id?: number; // ✅ Cho phép undefined nếu là khách
    guest_id?: string; // ✅ Thêm dòng này
    shipping_address?: string;
    payment_method?: PaymentMethod;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    note?: string;
    items: IOrderItem[];
}

export interface IUpdateOrder {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_address?: string;
    payment_method?: PaymentMethod;
    items?: IOrderItem[];
    reason_change?: string;
    reason_change_images?: Buffer[];
    note?: string;
    cancel_reason?: string;
    cancel_reason_images?: Buffer[];
    reason_change_date?: string;
    cancel_date?: string;
    person_cancel?: string;
    delivery_fail_images?: Buffer[];
    delivery_fail_reason?: string;
    cancel_return_reason?: string;
    cancel_return_date?: string;
    person_cancel_return?: string;
    delivery_fail_return_reason?: string;
    is_delivery_fail_return?: boolean;
    is_cancel_return?: boolean;
}

export interface IListOrder {
    page: number;
    size: number;
    key?: string;
    customer_id?: number;
    store_id?: number;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    start_date?: string;
    end_date?: string;
}
