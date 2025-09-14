export class ICreateStore {
    store_name?: string
    address?: string
    phone?: string

}
export interface IUpdateStore {
    store_name?: string
    address?: string
    phone?: string
}
export interface IListStore {
    page?: number
    size?: number
    key?: string
}