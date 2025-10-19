export class ICreateReview {
    rating?: number
    comment?: string
    customer_id?: number
    orderitem_id: number
}
export interface IUpdateReview {
    rating?: number
    comment?: string
    customer_id?: number
    orderitem_id?: number
}
export interface IListReview {
    page?: number
    size?: number
    key?: string
}