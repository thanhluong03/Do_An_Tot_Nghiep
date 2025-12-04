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

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'EXCHANGED' | 'RETURN_REQUESTED' | 'CONFIRMED_RETURN' | 'PENDING_DELIVERY' | 'DELIVERY_FAILED' | 'PACKING' | 'SHIPPING_RETURN' | 'PENDING_DELIVERY_RETURN' | 'DELIVERY_FAILED_RETURN' | 'CANCELLED_RETURN' | 'PACKING_RETURN'; 
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'MOMO';

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
export interface DriverLocation {
  id: number;
  driver: {
    id: number;
    name: string;
  };
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
  returnReason?: string;
  returnReasonImage?: { id: number; image: string }[];
  cancel_reason_image?: { id: number; image: string }[];
  note?: string;
  cancel_reason?: string | null;
  cancel_date?: string | null;
  person_cancel?: string | null;
  reason_change_date?: string | null;
  driverLocations?: DriverLocation[];
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
  cancel_reason?: string | null;
  cancel_date?: string | null;
  person_cancel?: string | null;
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
  return stores.map((s: Store) => ({
    id: s.id,
    name: s.name || s.store_name || s.storeName || "Không rõ tên"
  }));
};
export interface ListOrdersResponse {
  data: Order[];
  total: number;
  totalByStatus?: Record<string, number>;
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

  let orders: Order[] = responseData.data || [];
  // Map driverLocations if present
  orders = orders.map(order => {
    if (order.driverLocations && Array.isArray(order.driverLocations)) {
      order.driverLocations = order.driverLocations.map((loc: DriverLocation) => ({
        id: loc.id,
        driver: {
          id: loc.driver?.id,
          name: loc.driver?.name || ""
        }
      }));
    }
    return order;
  });
  const total: number = responseData.total;
  const totalByStatus = responseData.totalByStatus || {};
  return { data: orders, total: total, totalByStatus };
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
  const totalByStatus = responseData.totalByStatus || {};

  return { data: orders, total: total, totalByStatus };
}


export async function getOrderDetail(id: number): Promise<Order> {
  const res = await axios.get(`${API_URL}/orderdetail/${id}`);
  return res.data.data;
}

export async function getMultipleOrderDetails(ids: number[]): Promise<Order[]> {
  const promises = ids.map(id => getOrderDetail(id));
  const results = await Promise.allSettled(promises);

  return results
    .filter((result): result is PromiseFulfilledResult<Order> => result.status === 'fulfilled')
    .map(result => result.value);
}

export async function updateOrder(id: number, data: UpdateOrderPayload): Promise<void> {
  await axios.put(`${API_URL}/updateorder/${id}`, data);
}

export async function deleteOrder(id: number): Promise<void> {
  await axios.delete(`${API_URL}/deleteorder/${id}`);
}

export async function getRevenueData(params: {
  start_date?: string;
  end_date?: string;
  store_id?: number;
}): Promise<{ month: string; revenue: number }[]> {
  const response = await listOrders({
    start_date: params.start_date,
    end_date: params.end_date,
    store_id: params.store_id,
  });

  // Map để lưu doanh thu theo tháng-năm
  const revenueMap = new Map<string, number>();

  // Tên các tháng bằng tiếng Việt
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Xử lý dữ liệu đơn hàng
  response.data.forEach(order => {
    // Chỉ tính doanh thu từ các đơn hàng không bị hủy hoặc từ chối
    if (!['CANCELLED', 'REJECTED'].includes(order.status || '') && order.total_amount) {
      const orderDate = new Date(order.order_date);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth(); // 0-11
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`; // Format: 2024-01

      const prev = revenueMap.get(monthKey) || 0;
      revenueMap.set(monthKey, prev + Number(order.total_amount));
    }
  });

  // Xác định khoảng thời gian để hiển thị
  let startYear = new Date().getFullYear();
  let endYear = startYear;

  // Nếu có filter theo ngày, điều chỉnh khoảng năm
  if (params.start_date) {
    startYear = new Date(params.start_date).getFullYear();
  }
  if (params.end_date) {
    endYear = new Date(params.end_date).getFullYear();
  }

  const allMonths: { month: string; revenue: number }[] = [];

  // Tạo danh sách tháng cho tất cả các năm trong khoảng
  for (let year = startYear; year <= endYear; year++) {
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      // Nếu có filter ngày, chỉ hiển thị tháng trong khoảng đó
      if (params.start_date || params.end_date) {
        const monthDate = new Date(year, monthIndex, 1);

        if (params.start_date && monthDate < new Date(params.start_date)) {
          continue;
        }
        if (params.end_date && monthDate > new Date(params.end_date)) {
          continue;
        }
      }

      const monthKey = `${year}-${monthIndex.toString().padStart(2, '0')}`;
      const revenue = revenueMap.get(monthKey) || 0;

      // Hiển thị tên tháng với năm nếu có nhiều năm
      const displayName = (startYear === endYear)
        ? monthNames[monthIndex]
        : `${monthNames[monthIndex]} ${year}`;

      allMonths.push({
        month: displayName,
        revenue: revenue
      });
    }
  }

  // Nếu không có filter, chỉ hiển thị 12 tháng gần nhất
  if (!params.start_date && !params.end_date && allMonths.length > 12) {
    return allMonths.slice(-12);
  }

  return allMonths;
}
export const listOrdersByStore = async (
  storeId: number,
  page: number = 1,
  size: number = 1000
): Promise<Order[]> => {
  const res = await axios.get(`${API_URL}/store/${storeId}`, {
    params: { page, size }
  });

  // API: res.data.data = { data: [...], total: n }
  return res.data?.data?.data || [];
};



export const sendOrderConfirmedMail = async (data: { orderId: number, to: string }) => {
  return axios.post(`${API_URLMail}/order-confirmed`, data);
};

export const sendOrderRejectedMail = async (data: { orderId: number, to: string }) => {
  return axios.post(`${API_URLMail}/order-rejected`, data);
};