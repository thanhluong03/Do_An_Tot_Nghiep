import { Injectable } from '@nestjs/common';
import {
    ImportRequestRepository,
    ImportRequestDetailRepository,
    ProductRepository,
    ClassificationAttributeRelationshipRepository,
    InventoryRepository,
    InventoryDetailRepository,
} from '@app/database';
import { ImportRequestEntity, importRequestStatus } from '@app/database';
import { CreateImportRequestInput, UpdateImportRequestInput, AcceptImportRequestInput } from './import_request.interface';
@Injectable()
export class ImportRequestService {
    constructor(
        private readonly importRequestRepository: ImportRequestRepository,
        private readonly importRequestDetailRepository: ImportRequestDetailRepository,
        private readonly productRepository: ProductRepository,
        private readonly classificationRepository: ClassificationAttributeRelationshipRepository,
        private readonly inventoryRepository: InventoryRepository,
        private readonly inventoryDetailRepository: InventoryDetailRepository,
    ) { }

    async createImportRequest(data: CreateImportRequestInput): Promise<ImportRequestEntity> {
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

    async updateImportRequest(id: number, data: UpdateImportRequestInput): Promise<ImportRequestEntity | null> {
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

    async acceptImportRequest(id: number, data: AcceptImportRequestInput): Promise<void> {
        const importRequest = await this.importRequestRepository.findById(id);
        if (!importRequest) {
            throw new Error('Import request not found');
        }

        for (const acceptDetail of data.details) {
            // Lấy detail theo ID để có đầy đủ thông tin
            const detail = await this.importRequestDetailRepository.findById(acceptDetail.detail_id);
            if (!detail) {
                throw new Error(`Import request detail not found with ID ${acceptDetail.detail_id}`);
            }

            // Validate product_id khớp
            if (detail.product_id !== acceptDetail.product_id) {
                throw new Error(`Product ID mismatch. Expected: ${detail.product_id}, got: ${acceptDetail.product_id}`);
            }

            // Validate classification_id khớp
            if (detail.classification_attribute_relationship_id !== acceptDetail.classification_attribute_relationship_id) {
                throw new Error(`Classification ID mismatch`);
            }

            // Kiểm tra số lượng có đủ không
            if (acceptDetail.classification_attribute_relationship_id) {
                // Có phân loại: kiểm tra quantity trong classification
                const classification = await this.classificationRepository.findById(
                    acceptDetail.classification_attribute_relationship_id
                );
                if (!classification || classification.quantity < acceptDetail.accept_quantity) {
                    throw new Error(`Không đủ số lượng phân loại. Có sẵn: ${classification?.quantity || 0}, yêu cầu: ${acceptDetail.accept_quantity}`);
                }

                // Trừ từ classification
                await this.classificationRepository.update(
                    acceptDetail.classification_attribute_relationship_id,
                    { quantity: classification.quantity - acceptDetail.accept_quantity }
                );
            }

            // Kiểm tra total_quantity_divided trong product
            const product = await this.productRepository.findById(acceptDetail.product_id);
            if (!product || product.total_quantity_divided < acceptDetail.accept_quantity) {
                throw new Error(`Không đủ số lượng sản phẩm. Có sẵn: ${product?.total_quantity_divided || 0}, yêu cầu: ${acceptDetail.accept_quantity}`);
            }

            // Trừ total_quantity_divided từ product
            await this.productRepository.update(acceptDetail.product_id, {
                total_quantity_divided: product.total_quantity_divided - acceptDetail.accept_quantity
            });

            // Cập nhật accept_quantity cho detail
            await this.importRequestDetailRepository.update(acceptDetail.detail_id, {
                accept_quantity: acceptDetail.accept_quantity,
            });

            // Cộng vào inventory của cửa hàng
            // Tìm inventory theo store và product
            let inventory = await this.inventoryRepository.findByProductAndStore(acceptDetail.product_id, importRequest.store_id);
            if (!inventory) {
                // Nếu chưa có thì tạo mới
                inventory = await this.inventoryRepository.create({
                    product_id: acceptDetail.product_id,
                    store_id: importRequest.store_id,
                    quantity_stock: 0,
                    quantity_sold: 0,
                });
            }
            if (acceptDetail.classification_attribute_relationship_id) {
                // Có phân loại: cộng vào inventory_detail
                let inventoryDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
                    inventory.id,
                    acceptDetail.classification_attribute_relationship_id
                );
                if (inventoryDetail) {
                    // Nếu đã có thì cộng thêm số lượng
                    await this.inventoryDetailRepository.update(inventoryDetail.id, {
                        quantity_stock: (inventoryDetail.quantity_stock || 0) + acceptDetail.accept_quantity,
                    });
                } else {
                    // Nếu chưa có thì tạo mới
                    await this.inventoryDetailRepository.create({
                        inventory_id: inventory.id,
                        classification_attribute_relationship_id: acceptDetail.classification_attribute_relationship_id,
                        quantity_stock: acceptDetail.accept_quantity,
                        quantity_sold: 0,
                    });
                }
            } else {
                // Không phân loại: cộng vào quantity_stock của inventory
                await this.inventoryRepository.update(inventory.id, {
                    quantity_stock: (inventory.quantity_stock || 0) + acceptDetail.accept_quantity,
                });
            }
        }

        // Đổi status thành ACCEPTED
        await this.importRequestRepository.update(id, {
            import_request_status: importRequestStatus.ACCEPTED,
        });
    }
}
