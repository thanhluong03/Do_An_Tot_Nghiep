// src/api/services/productApi.ts

import axios from "axios";
import {
    ProductClassification,
    ClassificationAttributeRelationship
} from "@/types/product";

const API_URL = "http://localhost:3000/products";

export interface ProductImage {
    url?: string; // nếu backend trả link
    image_data?: string | { data: number[] }; // có thể là string base64 hoặc Buffer
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    quantity?: number;
    category_id?: number;
    images: ProductImage[];
    main_image?: string | null;
    created_at?: string;
    updated_at?: string;
    category?: { id: number; name: string };
    supplier_id?: number;
    supplier?: { id: number; name: string };
    classifications?: ProductClassification[];
    relationships?: ClassificationAttributeRelationship[];
}

// Định nghĩa kiểu dữ liệu cho payload gửi lên (Không bao gồm ID, quantity và các trường meta)
// Thêm 'quantity' vào Omit
type ProductPayload = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'quantity'>; // <<-- ĐÃ THÊM 'quantity'


// Lấy danh sách sản phẩm
export const getProducts = async (): Promise<Product[]> => {
    const res = await axios.get(`${API_URL}/listproduct`);
    return res.data;
};

// Lấy chi tiết sản phẩm
export const getProductDetail = async (id: number): Promise<Product> => {
    const res = await axios.get(`${API_URL}/productdetail/${id}`);
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