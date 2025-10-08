// src/services/voucher.service.ts (hoặc tên file gộp khác)

import axios from 'axios';

// =======================================================
// 1. KIỂU DỮ LIỆU (DTO/INTERFACE)
// =======================================================

/** DTO cơ bản cho tạo mới Voucher */
export interface CreateVoucherDto {
    name: string;
    start_time?: Date;
    end_time?: Date;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    voucher_percentage?: number;
    quantity?: number;
    order_conditions?: number;
    is_active?: boolean;
}

/** DTO cho cập nhật Voucher (các trường là optional) */
export interface UpdateVoucherDto extends Partial<CreateVoucherDto> {
    name?: string; 
}

/** DTO cho response khi lấy danh sách hoặc chi tiết Voucher */
export interface VoucherResponseDto {
    id: number;
    name: string;
    start_time?: Date;
    end_time?: Date;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    voucher_percentage?: number;
    quantity?: number;
    order_conditions?: number;
    is_active?: boolean;
    created_at: Date;
    updated_at: Date | null;
}

/** DTO cho request tìm kiếm/phân trang danh sách Voucher */
export interface ListVoucherRequestDto {
    page?: number;
    size?: number;
    key?: string; // Tên tìm kiếm
}

/** DTO cho cập nhật/nhận voucher cho khách hàng */
export interface VoucherCustomerDto {
    voucher_id: number;
    customer_id: number;
}


// =======================================================
// 2. CÁC HÀM GỌI API
// =======================================================

const API_URL = 'http://localhost:3000/vouchers'; // Thay thế bằng URL Backend thực tế của bạn

/**
 * Tạo mới một hoặc nhiều Voucher. Backend mong đợi một mảng DTO.
 * @param data Mảng các CreateVoucherDto
 */
export const createVoucher = async (data: CreateVoucherDto[]) => {
    const response = await axios.post(`${API_URL}/createvoucher`, data);
    return response.data; // { message: string, voucher: VoucherResponseDto }[]
};

/**
 * Lấy danh sách Voucher cho quản trị viên.
 * @param query Tham số phân trang và tìm kiếm
 */
export const listVouchersAdmin = async (query: ListVoucherRequestDto) => {
    const response = await axios.get(`${API_URL}/listvouchers`, { params: query });
    return response.data as VoucherResponseDto[];
};

/**
 * Lấy chi tiết một Voucher theo ID.
 * @param id ID của Voucher
 */
export const getVoucherDetail = async (id: number) => {
    const response = await axios.get(`${API_URL}/voucherdetail/${id}`);
    // Backend trả về mảng 1 phần tử, ta lấy phần tử đầu tiên
    return response.data[0] as VoucherResponseDto; 
};

/**
 * Cập nhật thông tin một Voucher.
 * @param id ID của Voucher cần cập nhật
 * @param data Dữ liệu cập nhật
 */
export const updateVoucher = async (id: number, data: UpdateVoucherDto) => {
    const response = await axios.put(`${API_URL}/updatevoucher/${id}`, data);
    return response.data; // { message: string, voucher: VoucherResponseDto }[]
};

/**
 * Xóa mềm (soft delete) một Voucher.
 * @param id ID của Voucher cần xóa
 */
export const deleteVoucher = async (id: number) => {
    const response = await axios.delete(`${API_URL}/deletevoucher/${id}`);
    return response.data; // { message: string }[]
};