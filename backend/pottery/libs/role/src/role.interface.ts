export class ICreateRole {
    name?: string
    description?: string
}
export interface IUpdateRole {
    name?: string
    description?: string
}
export interface IListRole {
    page?: number
    size?: number
    key?: string
}