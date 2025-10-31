// src/api/services/customerApi.ts
import axios from "axios";

const API_URL = "http://localhost:3000/customers";

export interface Customer {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  is_active?: boolean;
  avatar_image?: string;
}


export const getCustomers = async (params: { start_date?: string; end_date?: string }) => {
  const res = await axios.get(`${API_URL}/listcustomers`, { params });
  return res.data.customers;
};

export const deleteCustomer = async (id: number) => {
  const res = await axios.delete(`${API_URL}/deletecustomer/${id}`);
  return res.data;
};
