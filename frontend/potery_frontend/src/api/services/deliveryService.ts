import axios from 'axios';
import { Order } from './orderService'; // Re-use Order type
import { User } from './userService'; // Re-use User type for Driver

const API_URL_DRIVER = 'http://localhost:3000/driver-location';
const API_URL_USERS = 'http://localhost:3000/users';

// --- Enums ---

export enum DriverStatus {
    WAITING_ACCEPT = 'WAITING_ACCEPT',
    ACCEPTED = 'ACCEPTED',
}

export interface DriverOrder extends Order {
    product_count: number;
}
export interface DriverLocation {
    id: number;
    driver_id: number;
    order_id: number;
    latitude: number | null;
    longitude: number | null;
    timestamp: string;
    driver_status: DriverStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    order?: Order; // Optional: include full order details
}
export interface AssignDriverDto {
    order_id: number;
    driver_id: number;
}
export interface AcceptOrderDto {
    order_id: number;
    driver_id: number;
    latitude?: number;
    longitude?: number;
}
export interface RejectOrderDto {
    order_id: number;
}

export interface GetDriverOrdersDto {
    status?: DriverStatus;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// --- API Functions ---

export const getOrdersForDriverAdmin = async (): Promise<DriverOrder[]> => {
    try {
        const res = await axios.get<ApiResponse<DriverOrder[]>>(`${API_URL_DRIVER}/admin/orders`);
        return res.data.data;
    } catch (error) {
        console.error("Error fetching orders for admin:", error);
        return [];
    }
};

export const getAvailableDrivers = async (): Promise<User[]> => {
    try {
        // API có thể trả về { message, users: [] } hoặc { success, data: [] }
        const res = await axios.get<{ users?: User[], data?: User[] }>(`${API_URL_USERS}/drivers`);
        // Xử lý cả hai cấu trúc phản hồi có thể có
        const drivers = res.data.users || res.data.data || [];
        // Đảm bảo luôn trả về một mảng
        return Array.isArray(drivers) ? drivers : [];
    } catch (error) {
        console.error("Error fetching available drivers:", error);
        return [];
    }
};


export const assignDriverToOrder = async (payload: AssignDriverDto): Promise<ApiResponse<DriverLocation>> => {
    const res = await axios.post<ApiResponse<DriverLocation>>(`${API_URL_DRIVER}/admin/assign-driver`, payload);
    return res.data;
};


export const getOrdersForDriver = async (driverId: number, params?: GetDriverOrdersDto): Promise<DriverLocation[]> => {
    const res = await axios.get<ApiResponse<DriverLocation[]>>(`${API_URL_DRIVER}/driver/${driverId}/orders`, { params });
    return res.data.data;
};


export const acceptOrder = async (payload: AcceptOrderDto): Promise<ApiResponse<void>> => {
    const res = await axios.post<ApiResponse<void>>(`${API_URL_DRIVER}/driver/accept-order`, payload);
    return res.data;
};


export const rejectOrder = async (payload: RejectOrderDto): Promise<ApiResponse<void>> => {
    const res = await axios.delete<ApiResponse<void>>(`${API_URL_DRIVER}/driver/reject-order`, { data: payload });
    return res.data;
};
