export interface IProductImage {
  image_data: Buffer;
}
export class ICreateProduct {
  name?: string
  description?: string
  price?: number
  category_id?: number
  supplier_id?: number
  images?: IProductImage[]
}
export interface IUpdateProduct {
  name?: string
  description?: string
  price?: number
  category_id?: number
  supplier_id?: number
  images?: IProductImage[]
}
export interface IListProduct {
  page?: number
  size?: number
  key?: string
}