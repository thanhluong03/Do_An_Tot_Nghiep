import axios from 'axios';
import { Order } from './orderService'; // Re-use Order type
import { User } from './userService'; // Re-use User type for Driver

const API_URL_DRIVER = 'http://localhost:3000/driver-location';
const API_URL_DELIVERY_PROOF = 'http://localhost:3000/deliveryproofs';
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

// --- Delivery Proof ---
export interface CreateDeliveryProofPayload {
    order_id: number;
    driver_id: number;
    image?: File | string | null;
    captured_at?: string;
}

export interface DeliveryProof {
    id: number;
    order_id: number | string;
    driver_id: number | string;
    image_proof: string | null;
    captured_at: string;
    created_at: string;
    updated_at: string;
}

export const createDeliveryProof = async (payload: CreateDeliveryProofPayload) => {
    try {
        if (payload.image && payload.image instanceof File) {
            const form = new FormData();
            form.append('order_id', String(payload.order_id));
            // Backend accepts user_id; keep driver_id only for backward-compat
            form.append('user_id', String(payload.driver_id));
            form.append('driver_id', String(payload.driver_id));
            form.append('captured_at', payload.captured_at || new Date().toISOString());
            // Append multiple common field names to be compatible with various backends
            form.append('image_proof', payload.image); // expected by some controllers
            form.append('image', payload.image);       // common default
            form.append('file', payload.image);        // NestJS FileInterceptor('file')
            form.append('imageProof', payload.image);  // camelCase variant

            // Debug: log form entries (names only to avoid logging large blobs)
            try {
                const keys: string[] = [];
                // @ts-ignore - for...of on FormData works in browser
                for (const [k] of (form as any).entries()) keys.push(k);
                // eslint-disable-next-line no-console
                console.log('[createDeliveryProof] FormData keys:', keys);
            } catch {}

            // Do NOT set Content-Type manually so Axios sets proper boundary
            try {
                const res = await axios.post<{ message: string; deliveryProof: DeliveryProof }>(
                    `${API_URL_DELIVERY_PROOF}/createdeliveryproof`,
                    form
                );
                return res.data;
            } catch (err: any) {
                // If multipart fails (e.g., server expects base64 for bytea), fallback to base64 JSON
                // eslint-disable-next-line no-console
                console.warn('[createDeliveryProof] multipart failed, trying base64 JSON fallback');
                // Resize/compress to reduce payload and avoid 413
                const file = payload.image as File;
                const base64 = await new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    const reader = new FileReader();
                    reader.onload = () => {
                        img.onload = () => {
                            try {
                                const maxW = 1024;
                                const scale = Math.min(1, maxW / img.width);
                                const w = Math.round(img.width * scale);
                                const h = Math.round(img.height * scale);
                                const canvas = document.createElement('canvas');
                                canvas.width = w;
                                canvas.height = h;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) throw new Error('Canvas context not available');
                                ctx.drawImage(img, 0, 0, w, h);
                                const out = canvas.toDataURL('image/jpeg', 0.7); // compress quality
                                resolve(out);
                            } catch (e) {
                                reject(e);
                            }
                        };
                        img.onerror = reject;
                        img.src = String(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                // Strip data URL prefix to keep only base64 bytes
                const commaIdx = base64.indexOf(',');
                const rawBase64 = commaIdx >= 0 ? base64.substring(commaIdx + 1) : base64;
            const body = {
                    order_id: Number(payload.order_id),
                    user_id: Number(payload.driver_id),
                    driver_id: Number(payload.driver_id),
                    image_proof: rawBase64,
                    captured_at: payload.captured_at || new Date().toISOString(),
                } as any;
                // Also include alternate key if backend expects 'image'
                body.image = rawBase64;
                const res = await axios.post<{ message: string; deliveryProof: DeliveryProof }>(
                    `${API_URL_DELIVERY_PROOF}/createdeliveryproof`,
                    body
                );
                return res.data;
            }
        }

        // Fallback JSON payload when sending base64 string (not recommended for large files)
        const res = await axios.post<{ message: string; deliveryProof: DeliveryProof }>(
            `${API_URL_DELIVERY_PROOF}/createdeliveryproof`,
            {
                order_id: Number(payload.order_id),
                driver_id: Number(payload.driver_id),
                image_proof: typeof payload.image === 'string' ? payload.image : null,
                captured_at: payload.captured_at || new Date().toISOString(),
            }
        );
        return res.data;
    } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[createDeliveryProof] Error:', {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
        });
        throw err;
    }
};
