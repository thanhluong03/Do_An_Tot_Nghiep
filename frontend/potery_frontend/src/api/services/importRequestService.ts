import axios from "axios";

const API_URL_IMPORT_REQUEST = "http://localhost:3000/importrequests";

/* ---------------------------------- TYPES ---------------------------------- */

export interface Store {
    id: number;
    store_name: string;
    // ... các trường khác
}

export interface Attribute {
    id: number;
    name: string; // <--- Cần lấy tên này
    // ...
}

export interface ClassificationAttributeRelationship {
    id: number;
    product_attribute_id_1: number;
    product_attribute_id_2?: number;
    price: string;
    quantity: number;
    attribute1: Attribute; // <--- Thêm đối tượng Attribute
    attribute2?: Attribute; // <--- Thêm đối tượng Attribute
    // ...
}

export interface Product {
    id: number;
    name: string; // <--- Cần lấy tên này
    // ...
}

export interface ImportRequest {
    id: number;
    store_id: number;
    note?: string;
    import_request_status: "PENDING" | "ACCEPTED";
    created_at: string;
    updated_at: string;
    store_name?: string;
    // Thêm trường store và đảm bảo importRequestDetails có cấu trúc chi tiết
    store?: Store; 
    importRequestDetails?: ImportRequestDetail[];
}

export interface ImportRequestDetail {
    id?: number;
    import_request_id?: number;
    product_id: number;
    classification_attribute_relationship_id?: number | null;
    requested_quantity: number;
    created_at?: string;
    updated_at?: string;
    // Thêm các trường lồng nhau từ response API
    product?: Product; // <--- Thông tin sản phẩm
    classificationAttributeRelationship?: ClassificationAttributeRelationship | null; // <--- Thông tin phân loại
    accept_quantity?: number | null; // <--- Thêm trường này nếu có
}

export interface CreateImportRequestDto {
  store_id: number;
  note?: string;
  importRequestDetails: {
    product_id: number;
    classification_attribute_relationship_id?: number;
    requested_quantity: number;
  }[];
}

/* ---------------------------------- API ---------------------------------- */

// 📌 Lấy danh sách yêu cầu nhập hàng có phân trang
export const listImportRequests = async (
  page: number = 1,
  size: number = 10
): Promise<{
  data: ImportRequest[];
  total: number;
}> => {
  const res = await axios.get(
    `${API_URL_IMPORT_REQUEST}/listimportrequests`,
    { params: { page, size } }
  );

  return res.data;
};

// 📌 Lấy danh sách yêu cầu nhập hàng theo store
export const listImportRequestsByStore = async (
  storeId: number
): Promise<ImportRequest[]> => {
  const res = await axios.get(
    `${API_URL_IMPORT_REQUEST}/listimportrequestsbystore/${storeId}`
  );

  return res.data?.data || [];
};

// ➕ Tạo mới yêu cầu nhập hàng
export const createImportRequest = async (data: CreateImportRequestDto) => {
  const res = await axios.post(
    `${API_URL_IMPORT_REQUEST}/createimportrequest`,
    data
  );
  return res.data;
};

// ✏️ Cập nhật yêu cầu nhập hàng
export const updateImportRequest = async (id: number, data: Partial<CreateImportRequestDto>) => {
  const res = await axios.put(
    `${API_URL_IMPORT_REQUEST}/updateimportrequest/${id}`,
    data
  );
  return res.data;
};

// 🗑️ Xóa yêu cầu nhập hàng
export const deleteImportRequest = async (id: number) => {
  const res = await axios.delete(
    `${API_URL_IMPORT_REQUEST}/deleteimportrequest/${id}`
  );
  return res.data;
};
// 🛠️ ĐÃ SỬA: Khắc phục lỗi 404 bằng cách gọi endpoint detail chính xác
export const getImportRequestDetail = async (
  requestId: number
): Promise<ImportRequestDetail[]> => {
  // FIX: Thay đổi path từ 'importrequestdetails' sang 'importrequestdetail'
  const res = await axios.get(
    `${API_URL_IMPORT_REQUEST}/importrequestdetail/${requestId}`
  );

  // FIX: Trích xuất mảng chi tiết từ res.data.data.importRequestDetails
  return res.data?.data?.importRequestDetails || [];
};

export interface AcceptDetailDto {
  detail_id: number;
  product_id: number;
  classification_attribute_relationship_id?: number;
  accept_quantity: number;
}
export const acceptImportRequest = async (
  id: number,
  details: AcceptDetailDto[]
) => {
  const res = await axios.put(
    `${API_URL_IMPORT_REQUEST}/acceptimportrequest/${id}`,
    { details }
  );
  return res.data;
};