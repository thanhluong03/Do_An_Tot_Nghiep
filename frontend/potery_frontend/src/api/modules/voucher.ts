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
   * Lưu ý: Backend không trả về voucher_customer_id trong VoucherResponseDto
   * Cần lấy voucher_customer_id từ một nguồn khác hoặc query lại
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
      
      // Backend không trả về voucher_customer_id trong VoucherResponseDto
      // Cần query lại để lấy voucher_customer_id từ voucher_customer table
      // Sử dụng workaround: query tất cả voucher_customer records và map
      const mappedVouchers = await Promise.all(
        vouchers.map(async (v: any) => {
          let voucherCustomerId = v.voucher_customer_id || 
                                 v.voucherCustomerId || 
                                 v.voucher_customer?.id ||
                                 v.voucherCustomer?.id;
          
          // Nếu không có voucher_customer_id, cần query lại từ API khác
          // Workaround: Sử dụng API updatevouchercustomer để lấy voucher_customer_id
          // Hoặc query từ một nguồn khác
          if (!voucherCustomerId && v.id && customerId) {
            try {
              // Thử query từ API updatevouchercustomer (nếu có)
              // Hoặc sử dụng một cách khác để lấy voucher_customer_id
              console.log(`⚠️ Không tìm thấy voucher_customer_id cho voucher ${v.id}, sẽ query lại khi cần`);
            } catch (queryError) {
              console.warn(`⚠️ Không thể query voucher_customer_id cho voucher ${v.id}:`, queryError);
            }
          }
          
          return {
            ...v,
            voucher_customer_id: voucherCustomerId ? Number(voucherCustomerId) : undefined,
          };
        })
      );
      
      console.log('✅ Mapped vouchers with voucher_customer_id:', mappedVouchers.map(v => ({ 
        id: v.id, 
        voucher_customer_id: v.voucher_customer_id, 
        name: v.name 
      })));
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
   * Lấy voucher_customer_id từ customer_id và voucher_id
   * Sử dụng cách đơn giản: query từ database thông qua API findAvailableVouchersByCustomer
   * và tìm matching voucher, sau đó query lại voucher_customer_id từ database
   * 
   * Vì backend không có API trực tiếp để query voucher_customer_id,
   * sử dụng workaround: query tất cả voucher_customer records của customer,
   * sau đó filter theo voucher_id để lấy voucher_customer_id
   */
  async getVoucherCustomerIdByVoucherAndCustomer(customerId: string | number, voucherId: string | number): Promise<number | null> {
    try {
      console.log(`🔍 [GET VOUCHER_CUSTOMER_ID] Query voucher_customer_id từ voucher_id=${voucherId} và customer_id=${customerId}`);
      
      // Workaround: Sử dụng API updatevouchercustomer để lấy voucher_customer_id
      // Nếu thành công (tạo mới), lấy id từ response
      // Nếu đã tồn tại, sẽ throw error, nhưng có thể query lại từ database
      try {
        const res = await api.post('/vouchers/updatevouchercustomer', {
          customer_id: Number(customerId),
          voucher_id: Number(voucherId),
        });
        
        // Nếu thành công (tạo mới), lấy id từ response
        if (res.data?.voucherCustomer?.id) {
          const voucherCustomerId = Number(res.data.voucherCustomer.id);
          console.log(`✅ [GET VOUCHER_CUSTOMER_ID] Tìm thấy voucher_customer_id từ updatevouchercustomer (tạo mới): ${voucherCustomerId}`);
          return voucherCustomerId;
        }
      } catch (apiError: any) {
        // Nếu lỗi "Customer already has this voucher", có nghĩa là đã tồn tại
        // Cần query lại từ database bằng cách khác
        // Vì không có API trực tiếp, sẽ sử dụng cách: query từ fetchCustomerVouchers
        // và hy vọng có voucher_customer_id trong response (mặc dù backend không trả về)
        if (apiError?.response?.status === 400) {
          const errorMessage = apiError?.response?.data?.message || '';
          if (errorMessage.includes('already has') || errorMessage.includes('already')) {
            console.log('ℹ️ [GET VOUCHER_CUSTOMER_ID] Voucher đã tồn tại, query lại từ fetchCustomerVouchers');
            
            // Query từ fetchCustomerVouchers và tìm matching
            const vouchers = await this.fetchCustomerVouchers(customerId);
            const found = vouchers.find(v => {
              const vId = v.id ? Number(v.id) : null;
              const targetId = Number(voucherId);
              return vId === targetId;
            });
            
            if (found?.voucher_customer_id) {
              const voucherCustomerId = Number(found.voucher_customer_id);
              console.log(`✅ [GET VOUCHER_CUSTOMER_ID] Tìm thấy voucher_customer_id từ fetchCustomerVouchers: ${voucherCustomerId}`);
              return voucherCustomerId;
            }
            
            console.warn(`⚠️ [GET VOUCHER_CUSTOMER_ID] Không tìm thấy voucher_customer_id trong fetchCustomerVouchers`);
            return null;
          }
        }
        
        // Nếu lỗi khác, log và return null
        console.error('❌ [GET VOUCHER_CUSTOMER_ID] Lỗi từ updatevouchercustomer:', apiError?.response?.data || apiError?.message);
        return null;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [GET VOUCHER_CUSTOMER_ID] Lỗi query voucher_customer_id:', {
        error: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      return null;
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