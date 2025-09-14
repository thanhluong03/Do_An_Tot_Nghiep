export class ICreatePromotion {
    name?: string
    description?: string
    discount_type?: string
    discount_value?: number
    start_date?: Date
    end_date?: Date
    is_active?: boolean
}
export interface IUpdatePromotion {
    name?: string
    description?: string
    discount_type?: string
    discount_value?: number
    start_date?: Date
    end_date?: Date
    is_active?: boolean
}
export interface IListPromotion {
    page?: number
    size?: number
    key?: string
}