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

export interface ImportProductClassificationDto {
    classification_attribute_relationship_id: number | string;
    import_quantity: number;
    import_price: number;
}

export interface CreateImportProductDto {
    product_id: number | string;
    supplier_id: number | string;
    classifications: ImportProductClassificationDto[];
    import_quantity?: number; // Dành cho sản phẩm không có phân loại
    import_price?: number;
}

/**
 * Cập nhật: DTO cập nhật đơn nhập hàng. 
 */
export interface UpdateImportProductDto {
    classifications?: ImportProductClassificationDto[];
}

export interface ImportProduct {
    id: number;
    supplier_id: number;
    product_id: number;
    product_name?: string;
    supplier_name?: string;
    details?: ImportProductDetail[];
    created_at?: string;
    updated_at?: string;
    import_quantity?: number; // SỐ LƯỢNG NẾU KHÔNG CÓ DETAILS
    import_price?: number;   
}

export interface ImportProductDetail {
    id: number;
    classification_attribute_relationship_id: number;
    classification_name: string;
    attribute1_name?: string;
    attribute2_name?: string;
    import_quantity: number;
    import_price: number;
}

export interface ProductClassification {
    id: number;
    name: string;
    price?: number;
    quantity?: number;
    product_attribute_id_1: number;
    product_attribute_id_2: number;
    attribute1_name?: string;
    attribute2_name?: string;
}

export interface SelectOption {
    id: number | string;
    name: string;
    imageUrl?: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    total_quantity_divided: number;
    supplier_id: number | string;
    category_id?: number;
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
}

// 💡 INTERFACE MỚI: Định nghĩa cấu trúc response có phân trang
export interface ListResponse<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
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
        return null;
    }
};

export const getProductImageUrl = (product: Product): string => {
    const firstImage = product.images?.[0];

    if (firstImage?.url && typeof firstImage.url === "string" && firstImage.url !== "") {
        return firstImage.url;
    }

    if (product.main_image) {
        if (typeof product.main_image === "string" && product.main_image !== "") {
            return product.main_image;
        }
        if (typeof product.main_image === "object" && product.main_image !== null && "data" in product.main_image && Array.isArray(product.main_image.data)) {
            const base64Url = bufferToBase64(product.main_image as { data: number[] });
            if (base64Url) return base64Url;
        }
    }

    if (firstImage?.image_data) {
        const imageData = firstImage.image_data;

        if (typeof imageData === "object" && imageData !== null && "data" in imageData && Array.isArray(imageData.data)) {
            const base64Url = bufferToBase64(imageData as { data: number[] });
            if (base64Url) return base64Url;
        }

        else if (typeof imageData === "string" && imageData !== "") {
            return `data:image/png;base64,${imageData.startsWith('data:') ? imageData.split(',')[1] : imageData}`;
        }
    }

    return "/no-image.jpg";
};


// --- API Calls ---

// 💡 CẬP NHẬT: Hàm listImportProducts trả về ListResponse có phân trang
export const listImportProducts = async (
    dto: ListImportProductDto
): Promise<ListResponse<ImportProduct>> => {
    const res = await axios.get(`${API_URL_IMPORTPRODUCT}/list`, {
        params: dto
    });

    const responseData = res.data;

    // Logic xử lý response để luôn trả về đúng format ListResponse
    const dataItems = responseData.data || responseData.items || responseData;
    const total = responseData.total || (Array.isArray(dataItems) ? dataItems.length : 0);
    const page = responseData.page || dto.page || 1;
    const size = responseData.size || dto.size || 10;

    if (Array.isArray(dataItems)) {
        return { data: dataItems, total, page, size };
    }

    // Nếu không có dữ liệu trả về, vẫn trả về ListResponse rỗng
    return { data: [], total: 0, page: 1, size: 10 };
};

export const createImportProduct = async (data: CreateImportProductDto): Promise<any> => {
    const res = await axios.post(`${API_URL_IMPORTPRODUCT}/createimportproduct`, data);
    return res.data;
};

/**
 * Hàm cập nhật đơn nhập hàng.
 */
export const updateImportProduct = async (id: number, data: UpdateImportProductDto): Promise<ImportProduct> => {
    const res = await axios.put(`${API_URL_IMPORTPRODUCT}/updateimportproduct/${id}`, data);

    return res.data;
};

export const deleteImportProduct = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL_IMPORTPRODUCT}/deleteimportproduct/${id}`);
};


export const listProducts = async (dto: { page: number, size: number }): Promise<{ data: Product[]; total: number; page: number; size: number }> => {
    // Đảm bảo params page và size được truyền đúng
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`, { params: dto });
    const responseData = res.data.data || res.data;
    const list: Product[] = Array.isArray(responseData.data) ? responseData.data : Array.isArray(responseData.items) ? responseData.items : Array.isArray(responseData) ? responseData : [];

    return {
        data: list,
        total: responseData.total || res.data.total || list.length,
        page: responseData.page || res.data.page || dto.page || 1,
        size: responseData.size || res.data.size || dto.size || 10,
    };
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await listProducts({ page: 1, size: 1000 });
    const products: Product[] = res.data;

    return Array.isArray(products)
        ? products.map(p => ({
            id: p.id as number,
            name: p.name,
            imageUrl: getProductImageUrl(p)
        }))
        : [];
};

export const listDropdownSuppliers = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_SUPPLIERS}/listsupplier`);
    const suppliersData = res.data.suppliers || res.data.data || res.data;
    const suppliers: any[] = Array.isArray(suppliersData) ? suppliersData : [];
    return suppliers.map(s => ({ id: s.id as number, name: s.name || s.name }));
};

export const getProductClassifications = async (productId: number): Promise<ProductClassification[]> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/classifications/${productId}`);
    return Array.isArray(res.data) ? res.data : [];
};