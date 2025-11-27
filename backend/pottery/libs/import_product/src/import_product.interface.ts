export interface ListImportProductInput {
  page: number;
  size: number;
  key?: string;
  supplier_id?: number;
  user_id?: number;
}

export interface ImportProductClassificationInput {
  product_id: number | string;
  classification_attribute_relationship_id?: number | string;
  import_quantity: number;
  import_price: number;
}

export interface CreateImportProductInput {
  user_id: number | string;
  supplier_id: number | string;
  details: ImportProductClassificationInput[];
}

export interface UpdateImportProductInput {
  details?: ImportProductClassificationInput[];
}
