// src/api/services/roleService.ts
import axios from "axios";

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name: string;
  description?: string;
}

export interface ListRoleParams {
  page?: number;
  size?: number;
  key?: string;
}

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const getRoles = async (params: ListRoleParams): Promise<Role[]> => {
  const res = await API.get("/roles/listrole", { params });
  return res.data || [];
};

export const createRole = async (data: CreateRoleDto): Promise<Role[]> => {
  const res = await API.post("/roles/createrole", [data]);
  return res.data;
};

export const updateRole = async (id: number, data: UpdateRoleDto): Promise<Role[]> => {
  const res = await API.put(`/roles/updaterole/${id}`, data);
  return res.data;
};

export const deleteRole = async (id: number): Promise<{ message: string }[]> => {
  const res = await API.delete(`/roles/deleterole/${id}`);
  return res.data;
};
