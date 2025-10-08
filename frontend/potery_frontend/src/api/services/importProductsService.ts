// src/api/services/importProductsService.ts (Tạo hoặc cập nhật file này)

import axios from "axios";

// Giả định API URLs
const API_URL_IMPORTPRODUCT = "http://localhost:3000/importproduct"; 
const API_URL_PRODUCTS = "http://localhost:3000/products"; 
const API_URL_SUPPLIERS = "http://localhost:3000/suppliers"; 

// --- Interfaces (Tương thích với DTOs Backend) ---

export interface ListImportProductDto {
    page?: number;
    size?: number;
    key?: string;
    product_id?: number;
    supplier_id?: number;
}

export interface CreateImportProductDto {
    product_id: number | string | number[] | string[]; 
    supplier_id: number | string | number[] | string[]; 
    import_quantity: number; 
}

export interface UpdateImportProductDto {
    import_quantity?: number; 
}

export interface ImportProduct {
    id: number;
    product_id: number;
    supplier_id: number;
    import_quantity: number; 
    created_at: string;
    updated_at: string;
    product_name?: string; 
    supplier_name?: string; 
}

export interface SelectOption {
    id: number;
    name: string;
}

// Giả định Product Interface (Đã rút gọn từ ProductTable)
export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number; // Trường tồn kho cần được cập nhật
    category_id?: number;
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
}

// --- API Calls ---

export const listImportProducts = async (
    dto: ListImportProductDto
): Promise<{ data: ImportProduct[]; total: number; page: number; size: number }> => {
    const res = await axios.get(`${API_URL_IMPORTPRODUCT}/list`, {
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

export const createImportProduct = async (data: CreateImportProductDto): Promise<any> => {
    const res = await axios.post(`${API_URL_IMPORTPRODUCT}/createimportproduct`, data);
    return res.data; 
};

export const updateImportProduct = async (id: number, data: UpdateImportProductDto): Promise<ImportProduct> => {
    const res = await axios.put(`${API_URL_IMPORTPRODUCT}/updateimportproduct/${id}`, data);
    return res.data;
};

export const deleteImportProduct = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL_IMPORTPRODUCT}/deleteimportproduct/${id}`);
};

// Hàm mới: Tải toàn bộ danh sách sản phẩm (có thể dùng chung endpoint list của Product)
export const listProducts = async (dto: { page: number, size: number }): Promise<{ data: Product[]; total: number; page: number; size: number }> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`, { params: dto });
    // Giả định response trả về format { data: Product[], total: number, page: number, size: number }
    if (res.data.data && Array.isArray(res.data.data)) {
        return res.data;
    }
    // Xử lý trường hợp backend chỉ trả về mảng
    const list: Product[] = res.data || [];
    return { data: list, total: list.length, page: 1, size: 1000 };
};

// Hàm cũ: Tải danh sách Sản phẩm cho Dropdown
export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
    const products: Product[] = res.data.data || res.data; // Lấy từ data hoặc root
    return Array.isArray(products) 
        ? products.map(p => ({ id: p.id as number, name: p.name })) 
        : [];
};

// Hàm cũ: Tải danh sách Nhà cung cấp cho Dropdown
export const listDropdownSuppliers = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_SUPPLIERS}/listsupplier`);
    const suppliersData = res.data.suppliers || res.data.data || res.data;
    const suppliers: any[] = Array.isArray(suppliersData) ? suppliersData : [];
    return suppliers.map(s => ({ id: s.id as number, name: s.name || s.name })); 
};