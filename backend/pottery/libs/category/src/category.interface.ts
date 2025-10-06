export class ICreateCategory {
    name?: string
    description?: string
}
export interface IUpdateCategory {
    name?: string
    description?: string
}
export interface IListCategory {
    page?: number
    size?: number
    key?: string
}