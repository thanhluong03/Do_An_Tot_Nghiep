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
    quantity_sold:number;
    quantity_stock:number;
  };
  total_quantity_sold?: number;
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
