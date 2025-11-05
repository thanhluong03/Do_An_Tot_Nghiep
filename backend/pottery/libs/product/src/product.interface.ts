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
  classifications?: IProductClassification[]
  relationships?: IClassificationAttributeRelationship[]
}

export interface IUpdateProduct {
  name?: string
  description?: string
  price?: number
  category_id?: number
  supplier_id?: number
  images?: IProductImage[]
  classifications?: IProductClassification[]
  relationships?: IClassificationAttributeRelationship[]
  keepImageIndices?: number[];
  imageOperations?: {
    keep: number[];
    remove: number[];
    update: Array<{ id: number }>;
    order?: (string | number)[]; 
  };
}

export interface IListProduct {
  page?: number
  size?: number
  key?: string
  start_date?: string
  end_date?: string
}

export interface IProductAttribute {
  name: string
}

export interface IProductClassification {
  name: string
  attributes: IProductAttribute[]
}

export interface IClassificationAttributeRelationship {
  product_attribute_id_1: number
  product_attribute_id_2: number
  price?: number
  quantity?: number
}