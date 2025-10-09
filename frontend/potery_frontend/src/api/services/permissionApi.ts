// /src/api/permissionApi.ts

import axios from 'axios';
import { IPermissionResponseDto, IUpdatePermissionsDto } from '@/types/permission';

const API_BASE_URL = 'http://localhost:3000/permissions'; // Thay thế bằng URL API thực tế của bạn

// Lấy danh sách tất cả các quyền hạn có sẵn
export async function fetchAvailablePermissions(): Promise<string[]> {
    const response = await axios.get<{ message: string; permissions: string[] }>(
        `${API_BASE_URL}/listpermissions`
    );
    return response.data.permissions;
}

// Lấy quyền hạn hiện tại của một vai trò
export async function fetchPermissionsByRole(roleId: number): Promise<IPermissionResponseDto[]> {
    const response = await axios.get<IPermissionResponseDto[]>(
        `${API_BASE_URL}/role/${roleId}`
    );
    // Lưu ý: Controller của bạn trả về `PermissionResponseDto[]` trực tiếp
    return response.data;
}

// Cập nhật quyền hạn cho một vai trò
export async function updatePermissionsForRole(
    roleId: number,
    permissions: string[]
): Promise<{ message: string }> {
    const data: IUpdatePermissionsDto = { permissions };
    const response = await axios.put<{ message: string }>(
        `${API_BASE_URL}/role/${roleId}`,
        data
    );
    return response.data;
}