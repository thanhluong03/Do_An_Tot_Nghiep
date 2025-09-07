export class ICreateProduct {
  name?: string
  description?: string
  price?: number
  quantity?: number
  image_url?: string
  supplier_id?: number
  }
  
  export interface IUpdateProduct {
    name?: string
    description?: string
    price?: number
    quantity?: number
    image_url?: string
    supplier_id?: number
  }
  
  export interface IListProduct {
    page?: number
    size?: number
    key?: string
  }