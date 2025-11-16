import axios from "axios";

const API_URL = "http://localhost:3000/stores";

export interface Store {
  id?: number;
  store_name: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách
export const getStores = async (): Promise<Store[]> => {
  const res = await axios.get(`${API_URL}/liststore`);
  return res.data;
};
export const getStoreById = async (id: number): Promise<Store> => {
  const res = await axios.get(`${API_URL}/storedetail/${id}`);
  return res.data[0]; // lấy phần tử đầu tiên của mảng
};

// Thêm mới (backend nhận array)
export const addStore = async (store: Store): Promise<Store> => {
  const res = await axios.post(`${API_URL}/createstore`, [store], {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data[0];
};

// Sửa
export const updateStore = async (id: number, store: Store): Promise<Store> => {
  const res = await axios.put(`${API_URL}/updatestore/${id}`, store);
  return res.data[0];
};

// Xoá
export const deleteStore = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/deletestore/${id}`);
};
