
import axios from "axios";
import { Product } from "./productApi";
import { Store } from "./storeService";

const API_URL_INVENTORY = "http://localhost:3000/inventory"; 
const API_URL_PRODUCTS = "http://localhost:3000/products"; 
const API_URL_STORES = "http://localhost:3000/stores"; 

// --- Interfaces (Tương thích với DTOs) ---

export interface ListInventoryDto {
    page?: number;
    size?: number;
    key?: string;
    product_id?: number;
    store_id?: number;
}

export interface CreateInventoryDto {
    product_id: number | string | number[] | string[]; 
    
    // THAY ĐỔI DÒNG NÀY:
    store_id: number | string | number[] | string[];
    quantity_stock: number;
}

export interface UpdateInventoryDto {
    quantity_stock?: number;
    quantity_sold?: number;
}

export interface Inventory {
    id: number;
    product_id: number;
    store_id: number;
    quantity_stock: number;
    quantity_sold: number;
    created_at: string;
    updated_at: string;
    // Thêm các trường hiển thị tên từ mối quan hệ (nếu backend có trả về)
    product_name?: string; 
    store_name?: string;
}

export interface SelectOption {
    id: number;
    name: string;
}


export const listInventories = async (dto: ListInventoryDto): Promise<any> => {
    const res = await axios.get(`${API_URL_INVENTORY}/list`, {
        params: dto
    }); 
    
    const responseData = res.data;
    if (responseData && (Array.isArray(responseData.data) || Array.isArray(responseData.items))) {
         return responseData;
    }
    if (Array.isArray(responseData)) {
        return { data: responseData, total: responseData.length, page: dto.page || 1, size: dto.size || 10 };
    }
    return { data: [], total: 0, page: 1, size: 10 }; 
};

export const createInventory = async (data: CreateInventoryDto): Promise<Inventory> => {
    const res = await axios.post(`${API_URL_INVENTORY}/createinventory`, data);
    return res.data;
};

export const updateInventory = async (id: number, data: UpdateInventoryDto): Promise<Inventory> => {
    const res = await axios.put(`${API_URL_INVENTORY}/updateinventory/${id}`, data);
    return res.data;
};

export const deleteInventory = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL_INVENTORY}/deleteinventory/${id}`);
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
    const products: Product[] = res.data;
    return Array.isArray(products) 
        ? products.map(p => ({ id: p.id as number, name: p.name })) 
        : [];
};

export const listDropdownStores = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_STORES}/liststore`);
    const storesData = res.data.stores || res.data;
    const stores: Store[] = Array.isArray(storesData) ? storesData : [];
    return stores.map(s => ({ id: s.id as number, name: s.store_name }));
};