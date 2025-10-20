export interface OrderMailProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderMail {
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
