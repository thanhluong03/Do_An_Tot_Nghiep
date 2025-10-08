import axios from "axios";

const API_URL = "http://localhost:3000/vouchers";

export interface Voucher {
  id?: number;
  name?: string;
  voucher_percentage?: number;
  quantity?: number;
  order_conditions?: number;
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
  effective_period_begins?: string | Date;
  effective_period_ends?: string | Date;
}

// ✅ Chuyển input datetime-local sang format ISO backend
const toBackendDate = (date?: string) => {
  if (!date) return undefined;
  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

export const getVouchers = async (): Promise<Voucher[]> => {
  const res = await axios.get(`${API_URL}/listvouchers`);
  // ⚠️ SỬA: Vì Controller NestJS trả về mảng trực tiếp (VoucherResponseDto[]), 
  // nên chỉ cần lấy res.data. Backend của bạn không trả về object { vouchers: [...] }
  return res.data || []; 
};

export const addVoucher = async (voucher: Voucher): Promise<void> => {
  // Lọc bỏ các trường không cần thiết hoặc có giá trị 0/rỗng để tránh lỗi validation
  const cleanVoucher = (v: Voucher) => {
    const payload = {
      name: v.name,
      // ⚠️ SỬA: Backend DTO mong đợi "HH:mm:ss" cho start_time/end_time
      start_time: v.start_time?.split("T")[1] + ":00", 
      end_time: v.end_time?.split("T")[1] + ":00",
      
      // Gửi ngày/giờ đầy đủ theo chuẩn ISO cho effective_period_begins/ends
      effective_period_begins: toBackendDate(v.start_time),
      effective_period_ends: toBackendDate(v.end_time),
      
      // Lọc các giá trị number = 0 hoặc undefined
      voucher_percentage: v.voucher_percentage > 0 ? v.voucher_percentage : undefined,
      quantity: v.quantity > 0 ? v.quantity : undefined,
      order_conditions: v.order_conditions > 0 ? v.order_conditions : undefined,
      is_active: v.is_active ?? true,
    };
    
    // Loại bỏ các trường undefined
    Object.keys(payload).forEach(key => 
        payload[key] === undefined && delete payload[key]);

    return payload;
  };

  const payload = [cleanVoucher(voucher)]; // Backend cần payload là một MẢNG
  
  await axios.post(`${API_URL}/createvoucher`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateVoucher = async (
  id: number,
  voucher: Voucher
): Promise<void> => {
  // Lặp lại logic làm sạch dữ liệu cho Update
  const cleanVoucher = (v: Voucher) => {
    const payload = {
      ...v,
      // Đảm bảo gửi đúng format thời gian cho backend
      start_time: v.start_time?.split("T")[1] + ":00",
      end_time: v.end_time?.split("T")[1] + ":00",
      effective_period_begins: toBackendDate(v.start_time),
      effective_period_ends: toBackendDate(v.end_time),
    };
    
    // Lọc các trường undefined
    Object.keys(payload).forEach(key => 
        payload[key] === undefined && delete payload[key]);

    return payload;
  };
  
  await axios.put(`${API_URL}/updatevoucher/${id}`, cleanVoucher(voucher));
};

export const deleteVoucher = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/deletevoucher/${id}`);
};

export const updateVoucherCustomer = async (
  customerId: number,
  voucherId: number
) => {
  const res = await axios.post(`${API_URL}/updatevouchercustomer`, {
    customer_id: customerId,
    voucher_id: voucherId,
  });
  return res.data;
};