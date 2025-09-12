export class ICreateSupplier {
    name?: string
    address?: string
    phone?: string
    email?: string

}
export interface IUpdateSupplier {
    name?: string
    address?: string
    phone?: string
    email?: string
}
export interface IListSupplier {
    page?: number
    size?: number
    key?: string
}