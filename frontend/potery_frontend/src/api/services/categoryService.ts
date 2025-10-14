// src/api/services/categoryService.ts

import axios from "axios";

const API_URL = "http://localhost:3000/categories";

// Interfaces
export interface Category {
    id?: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ListCategoryDto {
    page?: number;
    size?: number;
    key?: string;
}

export const getCategories = async (dto?: ListCategoryDto): Promise<Category[]> => {
    const res = await axios.get(`${API_URL}/listcategory`, { params: dto });

    const data = res.data.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;

    return [];
};

export const addCategory = async (category: Category | Category[]): Promise<Category[]> => {
    const dataToSend = Array.isArray(category) ? category : [category];
    // Backend API là /createcategory và nhận một array
    const res = await axios.post(`${API_URL}/createcategory`, dataToSend, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return res.data.data || res.data;
};

// Sửa
export const updateCategory = async (id: number, category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    const res = await axios.put(`${API_URL}/updatecategory/${id}`, category);
    const updatedData = res.data.data ? res.data.data[0] : res.data[0];
    return updatedData;
};

// Xoá
export const deleteCategory = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/deletecategory/${id}`);
};