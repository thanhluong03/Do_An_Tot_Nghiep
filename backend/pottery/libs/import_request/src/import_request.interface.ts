export interface CreateImportRequestInput {
    store_id: number;
    note?: string;
    importRequestDetails: CreateImportRequestDetailInput[];
}

export interface CreateImportRequestDetailInput {
    product_id: number;
    classification_attribute_relationship_id?: number;
    requested_quantity: number;
}

import type { importRequestStatus } from '@app/database';
export interface UpdateImportRequestInput {
    import_request_status?: importRequestStatus;
    note?: string;
    importRequestDetails?: UpdateImportRequestDetailInput[];
}

export interface UpdateImportRequestDetailInput {
    id?: number;
    product_id: number;
    classification_attribute_relationship_id?: number;
    requested_quantity: number;
    accept_quantity?: number;
}

export interface AcceptImportRequestDetailInput {
    detail_id: number;
    product_id: number;
    classification_attribute_relationship_id?: number;
    accept_quantity: number;
}

export interface AcceptImportRequestInput {
    details: AcceptImportRequestDetailInput[];
}
