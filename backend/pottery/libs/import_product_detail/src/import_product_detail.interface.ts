export interface ListImportProductDetailInput {
  page: number;
  size: number;
  key?: string;
  import_product_id?: number;
  classification_attribute_relationship_id?: number;
}

export interface ImportProductDetailItemInput {
  classification_attribute_relationship_id: number | string;
  import_quantity: number;
  import_price: number;
}

export interface CreateImportProductDetailInput {
  import_product_id: number | string;
  details: ImportProductDetailItemInput[];
}

export interface UpdateImportProductDetailInput {
  import_quantity?: number;
  import_price?: number;
}
