// src/api/services/importProductsService.ts

import axios from "axios";

// Giả định API URLs
const API_URL_IMPORTPRODUCT = "http://localhost:3000/importproduct"; 
const API_URL_PRODUCTS = "http://localhost:3000/products"; 
const API_URL_SUPPLIERS = "http://localhost:3000/suppliers"; 

// --- Interfaces ---

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
    imageUrl?: string; 
}

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    category_id?: number;
    // Chấp nhận cả url (string) hoặc image_data (Buffer/string Base64)
    images?: { url?: string; image_data?: string | { data: number[] } }[]; 
    main_image?: string | { data: number[] };
}

// --- HÀM TRỢ GIÚP CHUYỂN BUFFER -> BASE64 (Dùng trong môi trường Browser/Frontend) ---
const bufferToBase64 = (buffer: { data: number[] }): string | null => {
    try {
        const binary = new Uint8Array(buffer.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        return `data:image/png;base64,${btoa(binary)}`;
    } catch (error) {
        console.error("Error converting buffer to base64:", error);
        return null;
    }
};

// --- HÀM TRỢ GIÚP LẤY URL ẢNH CHUẨN HÓA (Được Export để dùng chung) ---
export const getProductImageUrl = (product: Product): string => {
    const firstImage = product.images?.[0];

    // 1. Kiểm tra URL trong trường images
    if (firstImage?.url && typeof firstImage.url === "string" && firstImage.url !== "") {
         return firstImage.url;
    }
    
    // 2. Kiểm tra URL/Buffer trong trường main_image
    if (product.main_image) {
        if (typeof product.main_image === "string" && product.main_image !== "") {
            return product.main_image; 
        }
        if (typeof product.main_image === "object" && product.main_image !== null && "data" in product.main_image && Array.isArray(product.main_image.data)) {
            const base64Url = bufferToBase64(product.main_image as { data: number[] });
            if (base64Url) return base64Url;
        }
    }

    // 3. Kiểm tra dữ liệu Buffer/Base64 trong trường images
    if (firstImage?.image_data) {
        const imageData = firstImage.image_data;
        
        // Xử lý dữ liệu Buffer { data: number[] }
        if (typeof imageData === "object" && imageData !== null && "data" in imageData && Array.isArray(imageData.data)) {
            const base64Url = bufferToBase64(imageData as { data: number[] });
            if (base64Url) return base64Url;
        } 
        
        // Xử lý chuỗi Base64
        else if (typeof imageData === "string" && imageData !== "") {
            return `data:image/png;base64,${imageData}`;
        }
    }
    
    // 4. Mặc định
    return "/no-image.jpg"; 
};


// --- API Calls (Giữ nguyên) ---

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


export const listProducts = async (dto: { page: number, size: number }): Promise<{ data: Product[]; total: number; page: number; size: number }> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`, { params: dto });
    
    if (res.data.data && Array.isArray(res.data.data)) {
        return res.data;
    }
    const list: Product[] = res.data || [];
    return { data: list, total: list.length, page: 1, size: 1000 };
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await listProducts({ page: 1, size: 1000 });
    const products: Product[] = res.data.data || res.data || []; 
    
    return Array.isArray(products) 
        ? products.map(p => ({ 
            id: p.id as number, 
            name: p.name,
            imageUrl: getProductImageUrl(p) // SỬ DỤNG HÀM CHUẨN ĐỂ LẤY ẢNH (Bao gồm Base64)
        })) 
        : [];
};

export const listDropdownSuppliers = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_SUPPLIERS}/listsupplier`);
    const suppliersData = res.data.suppliers || res.data.data || res.data;
    const suppliers: any[] = Array.isArray(suppliersData) ? suppliersData : [];
    return suppliers.map(s => ({ id: s.id as number, name: s.name || s.name })); 
};