export class ICreateReview {
    rating?: number
    comment?: string
    customer_id?: number
    orderitem_id: number
    images?: Buffer[]
}
export interface IUpdateReview {
    rating?: number
    comment?: string
    customer_id?: number
    orderitem_id?: number
    images?: Buffer[]
}
export interface IListReview {
    page?: number
    size?: number
    key?: string
}