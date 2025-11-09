// src/api/services/userService.ts
import axios from "axios";

export interface User {
    id?: number;
    username: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
    address?: string;
    is_active?: boolean;
    role_id: number;
    store_id?: number;
    avatar_image?: string | { type: string; data: number[] };
}

const bufferToBase64 = (buffer: { data: number[] }): string | null => {
    if (typeof window === 'undefined' || !buffer || !buffer.data) {
        return null;
    }

    try {
        const binary = new Uint8Array(buffer.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        return `data:image/jpeg;base64,${btoa(binary)}`;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getUserAvatarUrl = (user: User): string => {
    const defaultImage = "http://localhost:3001/noAva.png";
    const avatarData = user.avatar_image;

    if (!avatarData) {
        return defaultImage;
    }

    if (typeof avatarData === "string" && avatarData.trim() !== "") {
        const trimmedData = avatarData.trim();

        if (trimmedData.startsWith("data:") || trimmedData.startsWith("http")) {
            return trimmedData;
        }

        if (trimmedData.length > 100 && !trimmedData.includes('/')) {
            return `data:image/jpeg;base64,${trimmedData}`;
        }

        return trimmedData;
    }

    if (typeof avatarData === "object" && avatarData !== null && "data" in avatarData && Array.isArray(avatarData.data)) {
        const base64Url = bufferToBase64(avatarData as { data: number[] });
        if (base64Url) return base64Url;
    }

    return defaultImage;
};

const API_URL = "http://localhost:3000/users";

export async function listUsers(params?: { page?: number; size?: number; key?: string }) {
    const res = await axios.get(`${API_URL}/listusers`, { params });
    return res.data.users || [];
}


export async function getUserDetail(id: number) {
    const res = await axios.get(`${API_URL}/userdetail/${id}`);
    return res.data;
}

export async function createUser(data: FormData) {
    const res = await axios.post(`${API_URL}/createuser`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function updateUser(id: number, data: FormData) {
    const res = await axios.put(`${API_URL}/updateuser/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function deleteUser(id: number) {
    const res = await axios.delete(`${API_URL}/deleteuser/${id}`);
    return res.data;
}
export async function changePassword(
    userId: number,
    data: { oldPassword: string; newPassword: string }
) {
    const res = await axios.put(`${API_URL}/changepassword/${userId}`, data);
    return res.data;
}
