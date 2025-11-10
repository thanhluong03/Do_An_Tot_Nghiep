// src/api/services/orderService.ts
import axios from 'axios';
const API_URL_STORES = "http://localhost:3000/stores";
const API_URL = 'http://localhost:3000/orders';
const API_URLMail = 'http://localhost:3000/mail';
export interface ProductImage {
  id: number;
  image_data: string;
  is_main_image: boolean;
  priority: number;
}
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
  product_images?: ProductImage[];
  attribute1_name?: string;
  attribute2_name?: string;

}

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'VNPAY';

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
  customer_email?: string;
  is_login_customer?: boolean;
}

export interface ListOrderParams {
  page?: number;
  size?: number;
  key?: string;
  customer_id?: number;
  store_id?: number | "";
  status?: OrderStatus | "";
  payment_status?: PaymentStatus | "";
  start_date?: string;
  end_date?: string;
}export interface UpdateOrderPayload {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_address?: string;
  payment_method?: PaymentMethod;
  user_id?: number;
}
export interface Store {
  id: number;
  name: string;
  store_name?: string;
  storeName?: string;
}

export const listDropdownStores = async (): Promise<Store[]> => {
  const res = await axios.get(`${API_URL_STORES}/liststore`);
  const storesData = res.data.stores || res.data;
  const stores: Store[] = Array.isArray(storesData) ? storesData : [];
  return stores.map((s: any) => ({
    id: s.id as number,
    name: s.name || s.store_name || s.storeName || "Không rõ tên"
  }));
};
export interface ListOrdersResponse {
  data: Order[];
  total: number;
}
export async function listOrders(params: ListOrderParams): Promise<ListOrdersResponse> {
  // Create a mutable copy of params to avoid "read-only" errors.
  const queryParams = { ...params }; // <-- Đã có sao chép nông ở đây!
  if (queryParams.store_id === "") queryParams.store_id = undefined;

  const res = await axios.get(`${API_URL}/listorders`, { params: queryParams });
  const responseData = res.data.data;

  if (!responseData || typeof responseData.total === 'undefined') {
    throw new Error("Invalid response format from server for listOrders");
  }

  const orders: Order[] = responseData.data || []; // Lấy danh sách từ responseData.data
  const total: number = responseData.total;      // Lấy total từ responseData.total

  // Trả về object có cấu trúc phân trang
  return { data: orders, total: total };
}
export async function listOrderAll(params: ListOrderParams): Promise<ListOrdersResponse> {
  const queryParams = {
    ...params,
    // 🚨 SỬA LỖI PHÂN TRANG: Yêu cầu kích thước lớn (ví dụ 1000)
    // để đảm bảo lấy hết dữ liệu cho dashboard.
    // Nếu API backend hỗ trợ, bạn có thể bỏ qua `size` để lấy hết.
    size: params.size || 1000
  };

  // Loại bỏ store_id nếu nó là rỗng
  if (queryParams.store_id === "") queryParams.store_id = undefined;

  const res = await axios.get(`${API_URL}/listorders`, { params: queryParams });
  const responseData = res.data.data;

  if (!responseData || typeof responseData.total === 'undefined') {
    throw new Error("Invalid response format from server for listOrders");
  }

  const orders: Order[] = responseData.data || [];
  const total: number = responseData.total;

  return { data: orders, total: total };
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
  const response = await listOrders({});
  const map = new Map<string, number>();

  response.data.forEach(order => {
    if (order.status === 'DELIVERED' && order.total_amount) {
      const month = new Date(order.order_date).toLocaleString('en-US', { month: 'short' });
      const prev = map.get(month) || 0;
      map.set(month, prev + Number(order.total_amount));
    }
  });

  return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }));
}
export const sendOrderConfirmedMail = async (data: { orderId: number, to: string }) => {
  return axios.post(`${API_URLMail}/order-confirmed`, data);
};

export const sendOrderRejectedMail = async (data: { orderId: number, to: string }) => {
  return axios.post(`${API_URLMail}/order-rejected`, data);
};