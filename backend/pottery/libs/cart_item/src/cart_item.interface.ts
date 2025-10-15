export class ICreateCartItem {
    product_id: number
    customer_id: number
    store_id: number
    quantity?: number
}

export interface IUpdateCartItem {
    product_id: number
    customer_id: number
    store_id: number
    quantity?: number
}

export interface IListCartItem {
    page?: number
    size?: number
    key?: string
}