// src/api/services/inventoryService.ts (Hoàn thiện)

import axios from "axios";
import { Product } from "./productApi"; // Import từ productService bạn cung cấp
import { Store } from "./storeService"; // Import từ storeService bạn cung cấp

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

// Giao diện chung cho Dropdown
export interface SelectOption {
    id: number;
    name: string;
}

// --- API TỒN KHO (Inventory) ---

/**
 * Lấy danh sách tồn kho
 * Hàm này ĐẢM BẢO luôn trả về một mảng Inventory[]
 */
// inventoryService.ts (Đã sửa)

// Thay thế hàm listInventories hiện tại bằng đoạn code này:
export const listInventories = async (dto: ListInventoryDto): Promise<any> => {
    // SỬA: Thay axios.post bằng axios.get
    // và truyền DTO (chứa page, size, key...) vào thuộc tính 'params'
    const res = await axios.get(`${API_URL_INVENTORY}/list`, {
        params: dto // Truyền DTO làm query parameters (?page=1&size=10...)
    }); 
    
    const responseData = res.data;

    // Logic xử lý phản hồi từ Server (giả định Server trả về { data: [], total: X, ...})
    // Thay vì chỉ trả về mảng, ta cần trả về TOÀN BỘ object để client có thể lấy total, page, size
    if (responseData && (Array.isArray(responseData.data) || Array.isArray(responseData.items))) {
         // Trả về toàn bộ object phân trang
         return responseData;
    }
    
    // Trường hợp API trả về thẳng mảng
    if (Array.isArray(responseData)) {
        // Tạo object phân trang giả nếu API chỉ trả về mảng
        return { data: responseData, total: responseData.length, page: dto.page || 1, size: dto.size || 10 };
    }
    
    // Trả về một object rỗng hợp lệ
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


// --- API CHO DROPDOWN (Dùng API Products & Stores thực tế) ---

/**
 * Lấy danh sách Sản phẩm cho Dropdown
 */
export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    // Dựa vào endpoint bạn cung cấp: GET /products/listproduct
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
    
    const products: Product[] = res.data;

    // Giả định ListProduct trả về mảng Product, ta map thành SelectOption
    // Lưu ý: Nếu listproduct trả về object phân trang, cần trích xuất mảng product trước
    return Array.isArray(products) 
        ? products.map(p => ({ id: p.id as number, name: p.name })) 
        : [];
};

/**
 * Lấy danh sách Cửa hàng cho Dropdown
 */
export const listDropdownStores = async (): Promise<SelectOption[]> => {
    // Dựa vào endpoint bạn cung cấp: GET /stores/liststore
    const res = await axios.get(`${API_URL_STORES}/liststore`);
    
    // Dựa vào StoreController, liststore trả về { stores: [...] }
    const storesData = res.data.stores || res.data;
    const stores: Store[] = Array.isArray(storesData) ? storesData : [];

    // Giả định Store có id và store_name
    return stores.map(s => ({ id: s.id as number, name: s.store_name }));
};