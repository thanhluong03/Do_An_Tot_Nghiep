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
  voucher_customer_id?: number;
  _id?: string;
  code?: string;
  name?: string;
  title?: string;
  description?: string;
  desc?: string;
  voucher_percentage?: number;
  discount?: number;
  discount_value?: number;
  discount_type?: 'FIXED_AMOUNT' | 'PERCENTAGE';
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
  status?: 'CREATED' | 'PENDING' | 'USED';
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
      // Bỏ qua lỗi "Request aborted" - đây là behavior bình thường khi component unmount
      if (error.message === 'Request aborted' || error.code === 'ERR_CANCELED') {
        console.log('⚠️ Request aborted (component unmounted)');
        return [];
      }
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
      const res = await api.get(`/vouchers/customer/${customerId}`, {
        params: { _: new Date().getTime() } // Cache-busting
      });
      console.log('✅ Customer vouchers raw response:', res.data);
      
      let vouchers: any[] = [];
      if (Array.isArray(res.data)) {
        vouchers = res.data;
      } else if (res.data.customerVouchers && Array.isArray(res.data.customerVouchers)) {
        vouchers = res.data.customerVouchers;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        vouchers = res.data.data;
      }
      
      // Map thêm voucher_customer_id nếu response có
      // Backend có thể trả về voucher_customer_id trong response hoặc cần map từ voucher_id
      const mappedVouchers = vouchers.map((v: any) => {
        // Nếu response có voucher_customer_id, sử dụng nó
        // Nếu không, thử lấy từ các field khác
        const voucherCustomerId = v.voucher_customer_id || v.voucherCustomerId || v.id; // Có thể id là voucher_customer_id
        return {
          ...v,
          voucher_customer_id: voucherCustomerId,
        };
      });
      
      console.log('✅ Mapped vouchers with voucher_customer_id:', mappedVouchers);
      return mappedVouchers;
    } catch (error: any) {
      // Bỏ qua lỗi "Request aborted" - đây là behavior bình thường khi component unmount
      if (error.message === 'Request aborted' || error.code === 'ERR_CANCELED') {
        console.log('⚠️ Request aborted (component unmounted)');
        return [];
      }
      console.error('❌ fetchCustomerVouchers error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể tải voucher của bạn');
    }
  },

  /**
   * Cập nhật trạng thái voucher của khách hàng sau khi sử dụng
   */
  async updateVoucherCustomerStatus(voucherCustomerId: string | number) {
    try {
      const payload = { status: 'USED' };
      const url = `/vouchers/updatevouchercustomerstatus/${voucherCustomerId}`;
      console.log('📤 Calling updateVoucherCustomerStatus:', { url, payload, voucherCustomerId });
      
      const res = await api.put(url, payload);
      console.log('✅ Update voucher status response:', res.data);
      console.log('✅ Voucher customer status updated successfully:', res.data?.voucherCustomer?.status);
      
      return res.data;
    } catch (error: any) {
      console.error('❌ updateVoucherCustomerStatus error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        voucherCustomerId,
      });
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái voucher');
    }
  },
};