import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

export interface CreateCustomerPayload {
  username: string;
  password: string; // backend expects 'password'
  email?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
}

export const customersApi = {
  async createCustomer(data: CreateCustomerPayload) {
    const form = new FormData();
    form.append('username', data.username);
    form.append('password', data.password);
    if (data.full_name) form.append('full_name', data.full_name);
    if (data.email) form.append('email', data.email);
    if (data.phone_number) form.append('phone_number', data.phone_number);
    if (data.address) form.append('address', data.address);
    // avatar_image is optional; omit by default

    const res = await api.post('/customers/createcustomer', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};


