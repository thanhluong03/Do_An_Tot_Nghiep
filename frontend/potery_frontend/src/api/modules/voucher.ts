// api/modules/vouchers.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

// Định nghĩa cấu trúc cơ bản của Voucher (tùy thuộc vào backend)
export interface Voucher {
  isClaimed: any;
  id: string | number;
  code: string;
  description: string;
  discount_value: number; // Giá trị giảm (tiền mặt hoặc %)
  discount_type: 'FIXED' | 'PERCENT'; // Loại giảm giá
  min_order_value: number; // Giá trị đơn hàng tối thiểu
  // ... các trường khác
}

export const voucherApi = {
  /**
   * Lấy danh sách voucher CÓ SẴN để người dùng LẤY (Pop-up)
   * Endpoint: GET /vouchers/listvouchers (hoặc /listvoucherselectofcustomers)
   */
  async fetchAvailableVouchers(): Promise<Voucher[]> {
    const res = await api.get('/vouchers/listvouchers');
    // Giả định backend trả về array
    return Array.isArray(res.data) ? res.data : (res.data.vouchers || []);
  },

  /**
   * Cập nhật/Nhận voucher cho khách hàng (LƯU VÀO DB)
   * Endpoint: POST /vouchers/updatevouchercustomer
   */
  async claimVoucher(customerId: string | number, voucherId: string | number) {
    const payload = { customerId: Number(customerId), voucherId: Number(voucherId) };
    const res = await api.post('/vouchers/updatevouchercustomer', payload);
    return res.data;
  },

  /**
   * Lấy danh sách voucher người dùng ĐÃ NHẬN (để áp dụng khi thanh toán)
   * Endpoint: GET /vouchers/customer/:customerId
   */
  async fetchCustomerVouchers(customerId: string | number): Promise<Voucher[]> {
    const res = await api.get(`/vouchers/customer/${customerId}`);
    // Giả định backend trả về array voucher
    return Array.isArray(res.data) ? res.data : (res.data.customerVouchers || []);
  },
};