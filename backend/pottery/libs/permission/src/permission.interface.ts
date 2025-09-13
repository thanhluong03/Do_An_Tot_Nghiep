export interface ICreatePermission {
    role_id: number;
    name: string;
    description?: string;
}

export interface IUpdatePermission {
    name?: string;
    description?: string;
}