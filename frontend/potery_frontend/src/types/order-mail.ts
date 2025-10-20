export interface OrderMailProduct {
    name: string;
    quantity: number;
    price: number;
}

// Interface cũ cho tham khảo (không sử dụng)
export interface OldSendOrderMailDto {
    to: string;
    orderId: string;
    customerName: string;
    products: OrderMailProduct[];
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderTime: string;
    shippingAddress: string;
}

// Interface mới - chỉ cần email và orderId
export interface SendOrderMailDto {
    to: string;
    orderId: number;
}
