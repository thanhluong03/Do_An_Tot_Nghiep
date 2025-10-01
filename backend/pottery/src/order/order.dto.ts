import type { OrderStatus, PaymentStatus, PaymentMethod } from '../../libs/database/src/entities/order.entity';
export interface CreateOrderDto {
    customer_id: number;
    driver_id?: number;
    shipping_address?: string;
    payment_method?: PaymentMethod;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    items: Array<{
        product_id: number;
        quantity: number;
        price_at_order: number;
    }>;
}

export interface UpdateOrderDto {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_address?: string;
    payment_method?: PaymentMethod;
    items?: Array<{
        product_id: number;
        quantity: number;
        price_at_order: number;
    }>;
}
