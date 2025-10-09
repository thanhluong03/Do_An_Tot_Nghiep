import axios from "axios";

export interface Permission {
  id?: number;
  name: string;
  description: string;
}

const API_URL = "http://localhost:3001/permissions"; // Đổi port nếu backend khác

export const getPermissions = async (): Promise<Permission[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addPermission = async (data: Permission): Promise<Permission> => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updatePermission = async (id: number, data: Permission): Promise<Permission> => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deletePermission = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
