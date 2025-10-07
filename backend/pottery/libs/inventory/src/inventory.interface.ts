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

export interface TransferInventoryInput {
    product_id: number;
    from_store_id: number | 'all';
    to_store_id: number | number[] | 'all';
    quantity: number;
}

export interface DistributeInventoryInput {
    product_id: number;
    from_store_id: number;
    distributions: {
        to_store_id: number;
        quantity: number;
    }[];
}

export interface CollectInventoryInput {
    product_id: number;
    from_store_ids: number[] | 'all';
    to_store_id: number;
    quantity_per_store?: number;
}
