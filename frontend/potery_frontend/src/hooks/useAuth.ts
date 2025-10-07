import { useState, useEffect, createContext, useContext } from 'react';
import { userApi } from '../api/modules/users';
import { User } from '../types';
import { useRouter } from 'next/navigation';
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('customerId'); 
      // Chỉ cần có token là coi như đăng nhập; ID có thể fetch sau
      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('customerId');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      try {
        // Ưu tiên lấy từ local storage để không bị chớp tắt dropdown
        const cached = localStorage.getItem('user');
        if (cached) {
          const parsed = JSON.parse(cached) as User;
          setUser(parsed);
        } else {
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        // Nếu API lỗi (401/404), xóa token và ID
        localStorage.removeItem('token');
        localStorage.removeItem('customerId');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await userApi.login({ email, password });
      // userApi.login đã lưu token, customerId, user vào localStorage
      setUser(response.user);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
      };
      const response = await userApi.register(payload);
      // userApi.register đã lưu token, customerId, user vào localStorage
      setUser(response.user);
      router.push('/'); 
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('customerId');
      localStorage.removeItem('user');
      // userApi.logout() đã xóa cả token và customerId
      router.push('/'); 
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    // ⭐ TRẠNG THÁI ĐÃ ĐĂNG NHẬP DỰA TRÊN USER ⭐
    isAuthenticated: !!user,
  };
};
