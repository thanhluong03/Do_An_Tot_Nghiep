export interface ListInventoryInput {
    page: number;
    size: number;
    key?: string;
    product_id?: number;
    store_id?: number;
}
export interface CreateInventoryInput {
    product_id: number | string | number[] | string[];
    store_id: number | string | number[] | string[];
    quantity_stock: number;
}

export interface UpdateInventoryInput {
    quantity_stock?: number;
    quantity_sold?: number;
}
