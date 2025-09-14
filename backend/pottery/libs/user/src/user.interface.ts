export class ICreateUser {
    username?: string
    password_hash?: string
    email?: string
    full_name?: string
    phone_number?: string
    address?: string
    avatar_image?: Buffer
    is_active?: boolean
    role_id?: number
}
export interface IUpdateUser {
    username?: string
    password_hash?: string
    email?: string
    full_name?: string
    phone_number?: string
    address?: string
    avatar_image?: Buffer
    is_active?: boolean
    role_id?: number
}
export interface IListUser {
    page?: number
    size?: number
    key?: string
}