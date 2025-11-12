import { Injectable } from '@nestjs/common';
import { ImportRequestRepository, ImportRequestDetailRepository } from '@app/database';
import { ImportRequestEntity, ImportRequestDetailEntity, importRequestStatus } from '@app/database';

export interface CreateImportRequestDto {
    store_id: number;
    note?: string;
    importRequestDetails: CreateImportRequestDetailDto[];
}

export interface CreateImportRequestDetailDto {
    product_id: number;
    classification_attribute_relationship_id?: number;
    requested_quantity: number;
}

export interface UpdateImportRequestDto {
    import_request_status?: importRequestStatus;
    note?: string;
    importRequestDetails?: UpdateImportRequestDetailDto[];
}

export interface UpdateImportRequestDetailDto {
    id?: number;
    product_id: number;
    classification_attribute_relationship_id?: number;
    requested_quantity: number;
    accept_quantity?: number;
}

@Injectable()
export class ImportRequestService {
    constructor(
        private readonly importRequestRepository: ImportRequestRepository,
        private readonly importRequestDetailRepository: ImportRequestDetailRepository,
    ) { }

    async createImportRequest(data: CreateImportRequestDto): Promise<ImportRequestEntity> {
        console.log('Creating import request:', data);

        // Tạo import request
        const importRequest = await this.importRequestRepository.create({
            store_id: data.store_id,
            note: data.note,
            import_request_status: importRequestStatus.PENDING,
        });

        // Tạo import request details
        if (data.importRequestDetails && data.importRequestDetails.length > 0) {
            for (const detail of data.importRequestDetails) {
                await this.importRequestDetailRepository.create({
                    import_request_id: importRequest.id,
                    product_id: detail.product_id,
                    classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                    requested_quantity: detail.requested_quantity,
                });
            }
        }

        // Trả về import request với relations
        const result = await this.importRequestRepository.findById(importRequest.id);
        if (!result) {
            throw new Error('Failed to retrieve created import request');
        }
        return result;
    }

    async getAllImportRequests(params: { size: number; page: number; store_id?: number }) {
        console.log('Getting all import requests:', params);
        return this.importRequestRepository.findAll(params);
    }

    async getImportRequestById(id: number): Promise<ImportRequestEntity | null> {
        console.log('Getting import request by id:', id);
        return this.importRequestRepository.findById(id);
    }

    async getImportRequestsByStore(store_id: number): Promise<ImportRequestEntity[]> {
        console.log('Getting import requests by store:', store_id);
        return this.importRequestRepository.findByStore(store_id);
    }

    async updateImportRequest(id: number, data: UpdateImportRequestDto): Promise<ImportRequestEntity | null> {
        console.log('Updating import request:', id, data);

        const existingRequest = await this.importRequestRepository.findByIdWithoutRelations(id);
        if (!existingRequest) {
            throw new Error('Import request not found');
        }

        // Cập nhật import request
        if (data.import_request_status || data.note) {
            await this.importRequestRepository.update(id, {
                import_request_status: data.import_request_status,
                note: data.note,
            });
        }

        // Cập nhật import request details nếu có
        if (data.importRequestDetails && data.importRequestDetails.length > 0) {
            console.log('Debug - importRequestDetails received:', JSON.stringify(data.importRequestDetails, null, 2));

            // Lấy tất cả details hiện tại
            const existingDetails = await this.importRequestDetailRepository.findByImportRequestId(id);
            const existingDetailIds = existingDetails.map((detail) => detail.id);
            console.log('Debug - existing detail IDs:', existingDetailIds);

            // Lấy danh sách ID từ request (những detail sẽ được giữ lại)
            const updatedDetailIds = data.importRequestDetails
                .filter((detail) => detail.id)
                .map((detail) => detail.id!);
            console.log('Debug - updated detail IDs:', updatedDetailIds);

            // Xóa những detail không còn trong danh sách cập nhật
            const detailsToDelete = existingDetailIds.filter((detailId) => !updatedDetailIds.includes(detailId));
            console.log('Debug - details to delete:', detailsToDelete);
            if (detailsToDelete.length > 0) {
                for (const detailId of detailsToDelete) {
                    await this.importRequestDetailRepository.softDelete(detailId);
                }
            }

            // Xử lý từng detail trong request
            for (const detail of data.importRequestDetails) {
                console.log('Debug - processing detail:', detail);
                if (detail.id) {
                    console.log('Debug - updating existing detail with ID:', detail.id);
                    // Cập nhật detail đã tồn tại
                    await this.importRequestDetailRepository.update(detail.id, {
                        product_id: detail.product_id,
                        classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                        requested_quantity: detail.requested_quantity,
                        accept_quantity: detail.accept_quantity,
                    });
                } else {
                    console.log('Debug - creating new detail (no ID provided)');
                    // Tạo mới detail
                    await this.importRequestDetailRepository.create({
                        import_request_id: id,
                        product_id: detail.product_id,
                        classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                        requested_quantity: detail.requested_quantity,
                        accept_quantity: detail.accept_quantity,
                    });
                }
            }
        }

        return this.importRequestRepository.findById(id);
    }

    async deleteImportRequest(id: number): Promise<void> {
        console.log('Deleting import request:', id);

        const existingRequest = await this.importRequestRepository.findByIdWithoutRelations(id);
        if (!existingRequest) {
            throw new Error('Import request not found');
        }

        // Xóa tất cả details trước
        await this.importRequestDetailRepository.deleteByImportRequestId(id);

        // Xóa import request
        await this.importRequestRepository.softDelete(id);
    }
}
