export interface ListImportProductInput {
  page: number;
  size: number;
  key?: string;
  product_id?: number;
  supplier_id?: number;
}

export interface ImportProductClassificationInput {
  classification_attribute_relationship_id: number | string;
  import_quantity: number;
  import_price: number;
}

export interface CreateImportProductInput {
  product_id: number | string;
  supplier_id: number | string;
  classifications?: ImportProductClassificationInput[];
  import_quantity?: number;
  import_price?: number;
}

export interface UpdateImportProductInput {
  classifications?: ImportProductClassificationInput[];
  import_quantity?: number;
  import_price?: number;
}
