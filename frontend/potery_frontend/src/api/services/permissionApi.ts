// src/api/services/permissionService.ts
import axios from "axios";

export type PermissionEntity = {
  id: number;
  role_id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type RoleEntity = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export interface PermissionItem {
  key: string;
  name: string;
}

export const getAvailablePermissions = async (): Promise<Record<string, PermissionItem[]>> => {
  const res = await API.get("/permissions/listpermissions");
  // backend returns { message, permissions: Record<string, PermissionItem[]> }
  return res.data?.permissions || {};
};

export const getPermissionsByRole = async (roleId: number): Promise<PermissionEntity[]> => {
  const res = await API.get(`/permissions/role/${roleId}`);
  // backend returns array of PermissionResponseDto
  return res.data || [];
};

export const updatePermissionsForRole = async (roleId: number, permissions: string[]): Promise<{ message: string }> => {
  const res = await API.put(`/permissions/role/${roleId}`, { permissions });
  return res.data;
};

export const createPermission = async (payload: {
  role_id: number;
  name: string;
  description?: string;
}): Promise<PermissionEntity | null> => {
  const res = await API.post("/permissions/createpermission", payload);
  return res.data || null;
};

/**
 * Simple helper to fetch roles list used for the role dropdown.
 * It calls the existing /roles/listrole endpoint and returns RoleEntity[]
 * (This lets the permissions page work standalone.)
 */
export const getRoles = async (params?: { page?: number; size?: number; key?: string }): Promise<RoleEntity[]> => {
  const res = await API.get("/roles/listrole", { params: { page: params?.page ?? 1, size: params?.size ?? 100, key: params?.key } });
  return res.data || [];
};
