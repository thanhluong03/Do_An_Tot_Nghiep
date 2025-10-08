import axios from "axios";
// Giả định bạn có các interface Product, Supplier (tương tự như Store)
import { Product } from "./productApi"; 
import { Supplier } from "./supplierService"; // Cần tạo Supplier service nếu chưa có

const API_URL_IMPORTPRODUCT = "http://localhost:3000/importproduct"; 
const API_URL_PRODUCTS = "http://localhost:3000/products"; 
const API_URL_SUPPLIERS = "http://localhost:3000/suppliers"; // Giả định endpoint

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
    supplier_id: number | string | number[] | string[]; // THAY ĐỔI
    import_quantity: number; // THAY ĐỔI
}

export interface UpdateImportProductDto {
    import_quantity?: number; // THAY ĐỔI
}

export interface ImportProduct {
    id: number;
    product_id: number;
    supplier_id: number;
    import_quantity: number; // THAY ĐỔI
    created_at: string;
    updated_at: string;
    product_name?: string; 
    supplier_name?: string; // THAY ĐỔI
}

export interface SelectOption {
    id: number;
    name: string;
}


export const listImportProducts = async (
    dto: ListImportProductDto
): Promise<{ data: ImportProduct[]; total: number; page: number; size: number }> => {
    // Gọi đúng endpoint list của backend ImportProduct
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
    // Gọi đúng endpoint create của backend ImportProduct
    const res = await axios.post(`${API_URL_IMPORTPRODUCT}/createimportproduct`, data);
    return res.data; // Backend trả về { importProducts: [...] }
};

export const updateImportProduct = async (id: number, data: UpdateImportProductDto): Promise<ImportProduct> => {
    // Gọi đúng endpoint update của backend ImportProduct
    const res = await axios.put(`${API_URL_IMPORTPRODUCT}/updateimportproduct/${id}`, data);
    return res.data;
};

export const deleteImportProduct = async (id: number): Promise<void> => {
    // Gọi đúng endpoint delete của backend ImportProduct
    await axios.delete(`${API_URL_IMPORTPRODUCT}/deleteimportproduct/${id}`);
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
    const products: Product[] = res.data;
    return Array.isArray(products) 
        ? products.map(p => ({ id: p.id as number, name: p.name })) 
        : [];
};

// Hàm mới: Tải danh sách Nhà cung cấp (tương tự Stores)
export const listDropdownSuppliers = async (): Promise<SelectOption[]> => {
    // Giả định endpoint list của Supplier là /listsupplier
    const res = await axios.get(`${API_URL_SUPPLIERS}/listsupplier`);
    const suppliersData = res.data.suppliers || res.data;
    const suppliers: Supplier[] = Array.isArray(suppliersData) ? suppliersData : [];
    return suppliers.map(s => ({ id: s.id as number, name: s.name || s.name })); // Giả định field tên
};