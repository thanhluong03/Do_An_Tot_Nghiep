import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ShippingFeeRequest {
    storeAddress: string;
    deliveryAddress: string;
    city: string;
}

export interface ShippingFeeResponse {
    success: boolean;
    data: {
        fee: number;
        distance: number;
        isHanoi: boolean;
        message: string;
    };
}

export const shippingApi = {
    calculateFee: async (data: ShippingFeeRequest): Promise<ShippingFeeResponse['data']> => {
        const res = await axios.post<ShippingFeeResponse>(`${API_BASE_URL}/shipping/calculate-fee`, data);
        if (!res.data.success) {
            throw new Error('Failed to calculate shipping fee');
        }
        return res.data.data;
    },
};
