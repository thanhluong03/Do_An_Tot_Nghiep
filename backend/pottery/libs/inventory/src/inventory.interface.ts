export interface ListInventoryInput {
    page: number;
    size: number;
    key?: string;
    product_id?: number;
    store_id?: number;
}

export interface InventoryDetailItemInput {
    classification_attribute_relationship_id: number;
    quantity_stock: number;
    quantity_sold?: number;
}

export interface CreateInventoryInput {
    product_id: number | string | number[] | string[];
    store_id: number | string | number[] | string[];
    inventory_details: InventoryDetailItemInput[]; // Bắt buộc phải có details
}

export interface UpdateInventoryInput {
    inventory_details?: InventoryDetailItemInput[];
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
