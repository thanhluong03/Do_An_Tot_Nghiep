// api/modules/vouchers.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tạo axios instance với interceptor
const api = axios.create({ 
  baseURL: API_BASE_URL, 
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Thêm interceptor để log request
api.interceptors.request.use(
  (config) => {
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Voucher {
  id?: string | number;
  _id?: string;
  code?: string;
  name?: string;
  title?: string;
  description?: string;
  desc?: string;
  voucher_percentage?: number;
  discount?: number;
  discount_value?: number;
  discount_type?: 'FIXED' | 'PERCENT';
  quantity?: number;
  remaining_quantity?: number;
  order_conditions?: number;
  min_order_value?: number;
  start_time?: string;
  end_time?: string;
  effective_period_begins?: string;
  effective_period_ends?: string;
  is_active?: boolean;
  isClaimed?: boolean;
}

export const voucherApi = {
  /**
   * Lấy danh sách voucher có sẵn
   */
  async fetchAvailableVouchers(): Promise<Voucher[]> {
    try {
      const res = await api.get('/vouchers/listvoucherselectofcustomers');
      console.log('✅ Vouchers response:', res.data);
      
      // Xử lý nhiều format response
      let vouchers: any[] = [];
      if (Array.isArray(res.data)) {
        vouchers = res.data;
      } else if (res.data.vouchers && Array.isArray(res.data.vouchers)) {
        vouchers = res.data.vouchers;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        vouchers = res.data.data;
      }
      
      return vouchers;
    } catch (error: any) {
      console.error('❌ fetchAvailableVouchers error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách voucher');
    }
  },

  /**
   * Nhận voucher cho khách hàng
   */
  async claimVoucher(customerId: string | number, voucherId: string | number) {
    try {
      // Chuyển đổi ID sang kiểu phù hợp
      const payload = {
      customer_id: String(customerId).trim(),
      voucher_id: String(voucherId).trim(),
    };
      
      console.log('📤 Claiming voucher with payload:', payload);
      
      const res = await api.post('/vouchers/updatevouchercustomer', payload);
      console.log('✅ Claim response:', res.data);
      
      return res.data;
    } catch (error: any) {
      console.error('❌ claimVoucher error:', error.response?.data || error.message);
      
      // Xử lý các loại lỗi phổ biến
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Dữ liệu không hợp lệ');
        } else if (status === 404) {
          throw new Error('Không tìm thấy voucher hoặc khách hàng');
        } else if (status === 409) {
          throw new Error('Bạn đã nhận voucher này rồi');
        } else if (status === 422) {
          throw new Error(data.message || 'Voucher đã hết hoặc không còn hiệu lực');
        } else {
          throw new Error(data.message || 'Không thể nhận voucher');
        }
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        throw new Error('Có lỗi xảy ra. Vui lòng thử lại');
      }
    }
  },

  /**
   * Lấy danh sách voucher đã nhận của khách hàng
   */
  async fetchCustomerVouchers(customerId: string | number): Promise<Voucher[]> {
    try {
      const res = await api.get(`/vouchers/customer/${customerId}`);
      console.log('✅ Customer vouchers:', res.data);
      
      let vouchers: any[] = [];
      if (Array.isArray(res.data)) {
        vouchers = res.data;
      } else if (res.data.customerVouchers && Array.isArray(res.data.customerVouchers)) {
        vouchers = res.data.customerVouchers;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        vouchers = res.data.data;
      }
      
      return vouchers;
    } catch (error: any) {
      console.error('❌ fetchCustomerVouchers error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể tải voucher của bạn');
    }
  },
};