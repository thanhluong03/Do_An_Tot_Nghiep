// types/role.ts

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string; // Ngày tháng thường là string khi nhận từ API
  updated_at: string | null;
}

export interface ListRoleRequest {
  page?: number;
  size?: number;
  key?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

// Kiểu dữ liệu nhận từ API listrole của backend NestJS
export interface ListRoleResponse {
  message: string;
  roles: Role[];
}

// Kiểu dữ liệu nhận từ API update/findone của backend NestJS
export interface SingleRoleResponse {
  message: string;
  role: Role;
}

// Kiểu dữ liệu nhận từ API deleterole của backend NestJS
export interface DeleteRoleResponse {
  message: string;
}