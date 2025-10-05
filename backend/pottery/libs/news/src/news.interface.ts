export class ICreateNews {
    title?: string
    content?: string
    published_at?: Date
    is_published?: boolean
    user_id?: number

}
export interface IUpdateNews {
    title?: string
    content?: string
    published_at?: Date
    is_published?: boolean
    user_id?: number
}
export interface IListNews {
    page?: number
    size?: number
    key?: string
}