import axios from "axios";

// =====================
// 🧩 Interface định nghĩa User
// =====================
export interface User {
  id?: number;
  username: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  is_active?: boolean;
  role_id: number;
  avatar_image?: string; // Base64 hoặc URL ảnh đại diện
}

// =====================
// ⚙️ Cấu hình API URL
// =====================
const API_URL = "http://localhost:3000/users";

// =====================
// 📋 Lấy danh sách người dùng
// =====================
export async function listUsers(params?: { page?: number; size?: number; key?: string }) {
  const res = await axios.get(`${API_URL}/listusers`, { params });
  return res.data.users || [];
}

// =====================
// 🔍 Lấy chi tiết người dùng
// =====================
export async function getUserDetail(id: number) {
  const res = await axios.get(`${API_URL}/userdetail/${id}`);
  return res.data;
}

// =====================
// ➕ Tạo mới người dùng
// =====================
export async function createUser(data: FormData) {
  const res = await axios.post(`${API_URL}/createuser`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =====================
// ✏️ Cập nhật người dùng
// =====================
export async function updateUser(id: number, data: FormData) {
  const res = await axios.put(`${API_URL}/updateuser/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =====================
// ❌ Xóa người dùng
// =====================
export async function deleteUser(id: number) {
  const res = await axios.delete(`${API_URL}/deleteuser/${id}`);
  return res.data;
}
