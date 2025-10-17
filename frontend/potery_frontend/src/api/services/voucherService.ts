import axios from 'axios';
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

export interface UpdateVoucherDto extends Partial<CreateVoucherDto> {
    name?: string; 
}

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

export interface ListVoucherRequestDto {
    page?: number;
    size?: number;
    key?: string;
}

export interface VoucherCustomerDto {
    voucher_id: number;
    customer_id: number;
}



const API_URL = 'http://localhost:3000/vouchers';

export const createVoucher = async (data: CreateVoucherDto[]) => {
    const response = await axios.post(`${API_URL}/createvoucher`, data);
    return response.data;
};

export const listVouchersAdmin = async (query: ListVoucherRequestDto) => {
    const response = await axios.get(`${API_URL}/listvouchers`, { params: query });
    return response.data as VoucherResponseDto[];
};

export const getVoucherDetail = async (id: number) => {
    const response = await axios.get(`${API_URL}/voucherdetail/${id}`);
    return response.data[0] as VoucherResponseDto; 
};

export const updateVoucher = async (id: number, data: UpdateVoucherDto) => {
    const response = await axios.put(`${API_URL}/updatevoucher/${id}`, data);
    return response.data;
};

export const deleteVoucher = async (id: number) => {
    const response = await axios.delete(`${API_URL}/deletevoucher/${id}`);
    return response.data;
};