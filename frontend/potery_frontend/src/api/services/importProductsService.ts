// src/api/services/importProductsService.ts

import axios from "axios";

// Giả định API URLs
const API_URL_IMPORTPRODUCT = "http://localhost:3000/importproduct";
const API_URL_PRODUCTS = "http://localhost:3000/products";
const API_URL_SUPPLIERS = "http://localhost:3000/suppliers";

// --- Interfaces (ĐÃ SỬA ĐỔI) ---

export interface ListImportProductDto {
    page?: number;
    size?: number;
    key?: string;
    product_id?: number;
    supplier_id?: number;
}

/**
 * MỚI: Định nghĩa cho từng mặt hàng trong đơn nhập (Tương đương ImportProductItemInput ở backend)
 */
export interface ImportProductItemDto {
    product_id: number | string;
    import_quantity: number;
    import_price?: number;
}

/**
 * MỚI: Định nghĩa DTO tạo đơn nhập hàng (Tương đương CreateImportProductInput ở backend)
 * Chứa supplier_id và một mảng các mặt hàng (items)
 */
export interface CreateImportProductDto {
    supplier_id: number | string;
    items: ImportProductItemDto[]; // Sửa từ một object đơn lẻ thành một mảng
}

export interface UpdateImportProductDto {
    import_quantity?: number;
}

interface ImportProduct {
  id: number;
  supplier_id: number;
  items: {
    product_id: number;
    import_quantity: number;
    import_price?: number;
  }[];
  created_at?: string;
  updated_at?: string;
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
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
}

// --- HÀM TRỢ GIÚP CHUYỂN BUFFER -> BASE64 (Giữ nguyên) ---
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

// --- HÀM TRỢ GIÚP LẤY URL ẢNH CHUẨN HÓA (Giữ nguyên) ---
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


// --- API Calls (ĐÃ SỬA createImportProduct) ---

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

/**
 * SỬA ĐỔI: Chức năng tạo đơn nhập hàng. 
 * Nhận input theo cấu trúc { supplier_id, items: [...] }
 */
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