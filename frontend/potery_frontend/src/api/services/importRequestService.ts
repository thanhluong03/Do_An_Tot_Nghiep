import axios from "axios";

const API_URL_IMPORT_REQUEST = "http://localhost:3000/importrequests";

/* ---------------------------------- TYPES ---------------------------------- */

export interface ImportRequest {
  id: number;
  store_id: number;
  note?: string;
  import_request_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  updated_at: string;
  store_name?: string;
  importRequestDetails?: ImportRequestDetail[];
  
}

export interface ImportRequestDetail {
  id?: number;
  import_request_id?: number;
  product_id: number;
  classification_attribute_relationship_id?: number;
  requested_quantity: number;
  created_at?: string;
  updated_at?: string;
  product_name?: string;
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
export const getImportRequestDetail = async (
  requestId: number
): Promise<ImportRequestDetail[]> => {
  const res = await axios.get(
    `${API_URL_IMPORT_REQUEST}/importrequestdetails/${requestId}`
  );

  return res.data?.data || [];
};