// src/api/services/productApi.ts

import axios from "axios";
const API_URL = "http://localhost:3000/products";

export interface ProductImage {
    url?: string; // nếu backend trả link
    image_data?: { data: number[] }; // nếu backend trả Buffer
}


export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    quantity?: number; // <<-- ĐÃ THÊM TRƯỜNG NÀY
    category_id?: number; // Trường này dùng để lọc
    images: ProductImage[];
    main_image?: string | null;
    created_at?: string;
    updated_at?: string;
    category?: { id: number; name: string }; // Trường này dùng để hiển thị tên
}

// Định nghĩa kiểu dữ liệu cho payload gửi lên (Không bao gồm ID, quantity và các trường meta)
// Thêm 'quantity' vào Omit
type ProductPayload = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'quantity'>; // <<-- ĐÃ THÊM 'quantity'


// Lấy danh sách sản phẩm
export const getProducts = async (): Promise<Product[]> => {
    const res = await axios.get(`${API_URL}/listproduct`);
    return res.data;
};



// Xoá sản phẩm
export const deleteProduct = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/deleteproduct/${id}`);
};


// Thêm sản phẩm (FormData)
export const addProduct = async (formData: FormData): Promise<Product> => {
    const res = await axios.post(`${API_URL}/createproduct`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// Cập nhật sản phẩm (FormData)
export const updateProduct = async (id: number, formData: FormData): Promise<Product> => {
    const res = await axios.put(`${API_URL}/updateproduct/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};