export type PermissionItem = { key: string; name: string };
export type AvailablePermissions = Record<string, PermissionItem[]>;
export interface ICreatePermission {
    role_id: number;
    name: string;
    description?: string;
}

export interface IUpdatePermission {
    name?: string;
    description?: string;
}