export interface ListImportProductInput {
    page: number;
    size: number;
    key?: string;
    product_id?: number;
    supplier_id?: number;
}
export interface ImportProductItemInput {
    product_id: number | string;
    import_quantity: number;
    import_price?: number;
}

export interface CreateImportProductInput {
    supplier_id: number | string;
    items: ImportProductItemInput[];
}

export interface UpdateImportProductInput {
    import_quantity?: number;
}
