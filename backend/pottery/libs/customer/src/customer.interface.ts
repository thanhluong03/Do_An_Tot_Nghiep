export class ICreateCustomer {
    username?: string
    password_hash?: string
    email?: string
    full_name?: string
    phone_number?: string
    address?: string
    avatar_image?: Buffer
    is_active?: boolean
}
export interface IUpdateCustomer {
    username?: string
    password_hash?: string
    email?: string
    full_name?: string
    phone_number?: string
    address?: string
    avatar_image?: Buffer
    is_active?: boolean
}
export interface IListCustomer {
    page?: number
    size?: number
    key?: string
}