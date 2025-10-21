import axios, { AxiosError } from 'axios';
import { User, UserProfile } from '../../types';

// Cấu hình base URL cho axios instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Lấy token từ localStorage (chỉ chạy trên client)
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Tạo axios instance để dễ dàng quản lý headers, đặc biệt là Authorization
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Hàm xử lý lỗi tập trung từ Axios để lấy ra message lỗi chi tiết từ backend.
 * @param error Lỗi Axios
 * @returns Error mới với message đã được trích xuất
 */
const handleAxiosError = (error: unknown, defaultMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    let message = defaultMessage;

    if (responseData && responseData.message) {
      // Xử lý trường hợp message là string hoặc array of string
      message = Array.isArray(responseData.message)
        ? responseData.message.join(', ')
        : responseData.message;
    } else if (error.message) {
      message = error.message;
    }
    return new Error(message);
  }
  return new Error(defaultMessage);
};

export const userApi = {
  getCustomerDetailById: async (customerId: string | number) => {
    try {
      const res = await api.get(`/customers/customerdetail/${customerId}`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error, 'Không thể lấy thông tin khách hàng.');
    }
  },
  // Tìm customer theo email để lấy id từ bảng customers
  getCustomerByEmail: async (email: string): Promise<{ id: string | number; email: string; name?: string } | null> => {
    try {
      const res = await api.get('/customers/listcustomers', { params: { key: email, size: 1, page: 1 } });
      const list = res.data?.customers || [];
      if (Array.isArray(list) && list.length > 0) {
        const c = list[0];
        return { id: c.id, email: c.email, name: c.full_name };
      }
      return null;
    } catch (error) {
      throw handleAxiosError(error, 'Failed to find customer by email');
    }
  },
  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found.');

      // ✅ Kiểm tra cache trước
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('customer');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.full_name && parsed.phone_number && parsed.address) {
            return parsed;
          }
        }
      }

      // ✅ Nếu không có cache đầy đủ -> lấy từ API
      const customerId = typeof window !== 'undefined' ? localStorage.getItem('customerId') : null;
      if (customerId) {
        const response = await api.get(`/customers/customerdetail/${customerId}`);
        const userData = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('customer', JSON.stringify(userData));
        }
        return userData;
      }

      throw new Error('User data not found.');
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },



  // Lấy profile user (Dùng chung logic với getCurrentUser)
  getUserProfile: async (): Promise<UserProfile> => {
    // Tùy thuộc vào cấu trúc dữ liệu, có thể gọi lại getCurrentUser hoặc dùng endpoint khác
    // Giả sử: dùng /customers/customerdetail/:id
    const user = await userApi.getCurrentUser();
    // Cần ánh xạ User/Customer sang UserProfile nếu cần
    return user as unknown as UserProfile; // Cần chắc chắn Customer type khớp UserProfile
  },

  // Cập nhật profile
  // Cập nhật profile
  // Cập nhật profile
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const token = getToken();
      if (!token) throw new Error('Không tìm thấy token đăng nhập.');

      const customerId =
        typeof window !== 'undefined' ? localStorage.getItem('customerId') : null;
      if (!customerId) throw new Error('Không tìm thấy ID người dùng.');

      let response;
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        response = await axios.put(
          `http://localhost:3000/customers/updatecustomer/${customerId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const d = data as any;
        const payload: Record<string, any> = {
          full_name: d.full_name || d.name || '',
          email: d.email || '',
          phone_number: d.phone || d.phone_number || '',
          address: d.address || '',
        };
        response = await axios.put(
          `http://localhost:3000/customers/updatecustomer/${customerId}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      const updatedUser = response.data;

      // 🔄 Chuẩn hóa về UserProfile cho frontend
      const normalizedUser = {
        id: updatedUser.id || customerId,
        name: updatedUser.full_name || updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone_number || '',
        address: updatedUser.address || '',
        avatar_image: updatedUser.avatar_image || null,
      } as unknown as UserProfile;

      // Cập nhật localStorage
      localStorage.setItem('customer', JSON.stringify(normalizedUser));

      return normalizedUser;
    } catch (error) {
      console.error('❌ Lỗi update profile:', error);
      throw handleAxiosError(error, 'Không thể cập nhật thông tin người dùng.');
    }
  },


  // Đăng ký (backend: POST /login/register)
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/login/register', data);
      const { user, token } = response.data || {};
      // Lưu token
      localStorage.setItem('token', token);
      // Lấy customerId từ email
      if (user?.email) {
        const customer = await userApi.getCustomerByEmail(user.email);
        if (customer?.id) localStorage.setItem('customerId', String(customer.id));
        // Lưu customer với id nếu có
        const persisted = { id: customer?.id, email: user.email, name: user.name } as User;
        localStorage.setItem('customer', JSON.stringify(persisted));
        return { user: persisted, token };
      }
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'Failed to register');
    }
  },

  // Đăng nhập (backend: POST /login)
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/login', { email, password });
      localStorage.removeItem('guest_id');
      const { user, token } = response.data || {};

      if (!token) throw new Error('Không nhận được token đăng nhập.');

      localStorage.setItem('token', token);

      // ✅ SỬ DỤNG TRỰC TIẾP ID TỪ BACKEND thay vì tìm kiếm lại
      if (user?.id) {
        localStorage.setItem('customerId', String(user.id));

        // Luôn fetch chi tiết customer từ API sử dụng ID từ backend
        try {
          const detailRes = await api.get(`/customers/customerdetail/${user.id}`);
          const fullCustomer = detailRes.data;
          localStorage.setItem('customer', JSON.stringify(fullCustomer));
          return { user: fullCustomer, token };
        } catch (detailError) {
          // Nếu không lấy được chi tiết, vẫn lưu thông tin từ backend
          const persisted = { id: user.id, email: user.email, name: user.name } as User;
          localStorage.setItem('customer', JSON.stringify(persisted));
          return { user: persisted, token };
        }
      }

      return { user, token };
    } catch (error) {
      throw handleAxiosError(error, 'Đăng nhập thất bại.');
    }
  },


  // Đăng xuất (Bổ sung xóa customerId)
  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('customerId'); // Xóa ID khi logout
      localStorage.removeItem('customer');
    }
  },

  // URL đăng nhập Google
  getGoogleLoginUrl: () => `${API_BASE_URL}/login/google`,
};