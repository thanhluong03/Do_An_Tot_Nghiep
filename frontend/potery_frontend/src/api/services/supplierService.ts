import axios from "axios";

const API_URL = "http://localhost:3001/suppliers";

export interface Supplier {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách
export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await axios.get(`${API_URL}/listsupplier`);
  return res.data;
};

// Thêm mới
// export const addSupplier = async (supplier: Supplier): Promise<Supplier> => {
//   const res = await axios.post(`${API_URL}/createsupplier`, supplier);
//   return res.data;
// };

export const addSupplier = async (supplier: Supplier): Promise<Supplier> => {
  // Backend yêu cầu array => gửi [supplier]
  const res = await axios.post(`${API_URL}/createsupplier`, [supplier], {
    headers: {
      "Content-Type": "application/json",
    },
  });
  // Trả về phần tử đầu tiên (vì backend trả về array)
  return res.data[0];
};

// Sửa
export const updateSupplier = async (id: number, supplier: Supplier): Promise<Supplier> => {
  const res = await axios.put(`${API_URL}/updatesupplier/${id}`, supplier);
  return res.data;
};

// Xoá
export const deleteSupplier = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/deletesupplier/${id}`);
};
