import axios from "axios";

export interface ProductImage {
  id?: number;
  url: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  supplier_id: number;
  category?: string;
  images: ProductImage[];
  main_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách sản phẩm
export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get("/products/listproduct");
  return res.data;
};

// Thêm sản phẩm
export const addProduct = async (product: Product): Promise<Product> => {
  // nếu backend yêu cầu array thì sửa thành [product] giống supplier
  const res = await axios.post("/products/createproduct", product);
  return res.data;
};

// Cập nhật sản phẩm
export const updateProduct = async (
  id: number,
  product: Product
): Promise<Product> => {
  const res = await axios.put(`/products/updateproduct/${id}`, product);
  return res.data;
};

// Xoá sản phẩm
export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`/products/deleteproduct/${id}`);
};
