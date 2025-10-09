// /src/types/permission.ts

export interface IPermissionResponseDto {
    id: number;
    role_id: number;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export interface IUpdatePermissionsDto {
    permissions: string[]; // Danh sách tên quyền hạn mới cho vai trò
}