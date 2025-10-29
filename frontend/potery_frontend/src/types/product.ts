// Product Classification and Attribute types
export interface ProductAttribute {
  id?: number;
  name: string;
}

export interface ProductClassification {
  id?: number;
  name: string;
  attributes: ProductAttribute[];
}

export interface ClassificationAttributeRelationship {
  id?: number;
  product_attribute_id_1: number;
  product_attribute_id_2: number;
  price?: number;
  quantity?: number;
  attribute1_name?: string;
  attribute2_name?: string;
}

export interface StoreClassification {
  id?: number;
  attribute1_id: number;
  attribute2_id: number;
  attribute1_name: string;
  attribute2_name: string;
  price: number;
  quantity_stock: number;
  quantity_sold: number;
}

export interface ProductStore {
  store_id: string;
  store_name: string;
  store_address: string;
  quantity_stock: number;
  quantity_sold: number;
  classifications: StoreClassification[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  category_name?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: Date;
  supplier: {
    id: string;
    name: string;
    logo?: string;
  };
  store: {
    id: string;
    name: string;
    address: string;
    quantity_sold: number;
    quantity_stock: number;
  };
  stores?: ProductStore[];
  total_quantity_sold?: number;
  classifications?: ProductClassification[];
  relationships?: ClassificationAttributeRelationship[];
  createdAt: Date;
  updatedAt: Date;
}
export interface ProductCategory {
  slug: string;
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}
export interface FlashSale {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  products: Product[];
}
