import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository, StoreRepository, InventoryRepository, InventoryDetailRepository, ClassificationAttributeRelationshipRepository } from '@app/database';
import { CreateInventoryInput, UpdateInventoryInput, ListInventoryInput, TransferInventoryInput, DistributeInventoryInput, CollectInventoryInput } from './inventory.interface';

@Injectable()
export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventoryRepository,
        private readonly inventoryDetailRepository: InventoryDetailRepository,
        private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
        private readonly productRepository: ProductRepository,
        private readonly storeRepository: StoreRepository,
    ) { }
    // async getTotalQuantityStock(inventoryId: number): Promise<number> {
    //     const details = await this.inventoryDetailRepository.findByInventoryId(inventoryId);
    //     if (!details || details.length === 0) return 0;
    //     return details.reduce((sum, detail) => sum + (detail.quantity_stock || 0), 0);
    // }
    // async getTotalQuantitySold(inventoryId: number): Promise<number> {
    //     const details = await this.inventoryDetailRepository.findByInventoryId(inventoryId);
    //     if (!details || details.length === 0) return 0;
    //     return details.reduce((sum, detail) => sum + (detail.quantity_sold || 0), 0);
    // }
    //hoang sua
    async getTotalQuantityStock(inventoryId: number, inventory?: any): Promise<number> {
        const details = await this.inventoryDetailRepository.findByInventoryId(inventoryId);
        if (!details || details.length === 0) {
            // Nếu sản phẩm không phân loại, trả quantity_stock trực tiếp từ inventory
            return inventory?.quantity_stock || 0;
        }
        return details.reduce((sum, detail) => sum + (detail.quantity_stock || 0), 0);
    }

    async getTotalQuantitySold(inventoryId: number, inventory?: any): Promise<number> {
        const details = await this.inventoryDetailRepository.findByInventoryId(inventoryId);
        if (!details || details.length === 0) {
            // Nếu sản phẩm không phân loại, trả quantity_sold trực tiếp từ inventory
            return inventory?.quantity_sold || 0;
        }
        return details.reduce((sum, detail) => sum + (detail.quantity_sold || 0), 0);
    }


    async create(data: CreateInventoryInput) {
        let productIds: number[] = [];
        let storeIds: number[] = [];
        if (data.product_id === 'all') {
            const products = await this.productRepository.findAll({ size: 1000, page: 1 });
            productIds = products.map((p) => p.id);
        } else if (Array.isArray(data.product_id)) {
            productIds = data.product_id.map((id) => Number(id));
        } else if (!isNaN(Number(data.product_id))) {
            productIds = [Number(data.product_id)];
        }
        if (data.store_id === 'all') {
            const stores = await this.storeRepository.findAll({ size: 1000, page: 1 });
            storeIds = stores.map((s) => s.id);
        } else if (Array.isArray(data.store_id)) {
            storeIds = data.store_id.map((id) => Number(id));
        } else if (!isNaN(Number(data.store_id))) {
            storeIds = [Number(data.store_id)];
        }

        for (const pid of productIds) {
            // Kiểm tra sản phẩm có phân loại không
            const productClassifications = await this.classificationAttributeRelationshipRepository.findByProductId(pid);
            const hasClassification = productClassifications && productClassifications.length > 0;
            for (const sid of storeIds) {
                let existed = await this.inventoryRepository.findByProductAndStore(pid, sid);
                if (!existed) {
                    existed = await this.inventoryRepository.create({
                        product_id: pid,
                        store_id: sid,
                    });
                }

                if (hasClassification) {
                    // Sản phẩm có phân loại: bắt buộc inventory_details
                    if (data.inventory_details && data.inventory_details.length > 0) {
                        for (const detail of data.inventory_details) {
                            const existedDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
                                existed.id,
                                detail.classification_attribute_relationship_id
                            );
                            if (existedDetail) {
                                existedDetail.quantity_stock = (existedDetail.quantity_stock || 0) + detail.quantity_stock;
                                await this.inventoryDetailRepository.update(existedDetail.id, {
                                    quantity_stock: existedDetail.quantity_stock,
                                    quantity_sold: detail.quantity_sold || existedDetail.quantity_sold || 0,
                                });
                            } else {
                                await this.inventoryDetailRepository.create({
                                    inventory_id: existed.id,
                                    classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                                    quantity_stock: detail.quantity_stock,
                                    quantity_sold: detail.quantity_sold || 0,
                                });
                            }
                            // Trừ số lượng phân loại
                            const classification = await this.classificationAttributeRelationshipRepository.findById(
                                detail.classification_attribute_relationship_id
                            );
                            if (classification) {
                                const newQuantity = Number(classification.quantity || 0) - detail.quantity_stock;
                                if (newQuantity < 0) {
                                    throw new NotFoundException(
                                        `Số lượng phân loại không đủ. Còn lại: ${classification.quantity}, yêu cầu: ${detail.quantity_stock}`
                                    );
                                }
                                await this.classificationAttributeRelationshipRepository.update(
                                    detail.classification_attribute_relationship_id,
                                    { quantity: newQuantity }
                                );
                            }
                        }
                    } else {
                        throw new NotFoundException('inventory_details là bắt buộc và không được để trống với sản phẩm có phân loại');
                    }
                } else {
                    // Sản phẩm không có phân loại: lưu trực tiếp vào inventory
                    if (data.inventory_details && data.inventory_details.length > 0) {
                        // Nếu truyền inventory_details thì cộng tổng quantity_stock
                        const totalStock = data.inventory_details.reduce((sum, detail) => sum + detail.quantity_stock, 0);
                        existed.quantity_stock = (existed.quantity_stock || 0) + totalStock;
                        existed.quantity_sold = existed.quantity_sold || 0;
                        await this.inventoryRepository.update(existed.id, {
                            quantity_stock: existed.quantity_stock,
                            quantity_sold: existed.quantity_sold,
                        });
                    } else if (typeof data['quantity_stock'] === 'number') {
                        // Nếu truyền trực tiếp quantity_stock
                        existed.quantity_stock = (existed.quantity_stock || 0) + data['quantity_stock'];
                        existed.quantity_sold = existed.quantity_sold || 0;
                        await this.inventoryRepository.update(existed.id, {
                            quantity_stock: existed.quantity_stock,
                            quantity_sold: existed.quantity_sold,
                        });
                    } else {
                        throw new NotFoundException('Phải truyền số lượng tồn kho cho sản phẩm không phân loại');
                    }
                }
            }
            // Giảm total_quantity_divided của product
            const product = await this.productRepository.findById(pid);
            if (product) {
                let totalQuantityUsed = 0;
                if (hasClassification) {
                    totalQuantityUsed = (data.inventory_details?.reduce((sum, detail) => sum + detail.quantity_stock, 0) ?? 0) * storeIds.length;
                } else {
                    if (data.inventory_details && data.inventory_details.length > 0) {
                        totalQuantityUsed = data.inventory_details.reduce((sum, detail) => sum + detail.quantity_stock, 0) * storeIds.length;
                    } else if (typeof data['quantity_stock'] === 'number') {
                        totalQuantityUsed = data['quantity_stock'] * storeIds.length;
                    }
                }
                if (Number(product.total_quantity_divided) < totalQuantityUsed) {
                    throw new NotFoundException(
                        `Số lượng sản phẩm không đủ để chia cho các cửa hàng. Sản phẩm còn: ${product.total_quantity_divided}, yêu cầu chia: ${totalQuantityUsed}`
                    );
                }
                product.total_quantity_divided = Number(product.total_quantity_divided) - totalQuantityUsed;
                await this.productRepository.update(pid, { total_quantity_divided: product.total_quantity_divided });
            }
        }

        const { data: allInventories } = await this.list({ page: 1, size: 1000 });
        return {
            inventories: allInventories,
        };
    }

    async getInventoryDetails(id: number) {
        const inventory = await this.inventoryRepository.findById(id);
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }

        const inventoryDetails = await this.inventoryDetailRepository.findByInventoryId(id);

        return {
            inventory,
            inventory_details: inventoryDetails.map(detail => ({
                id: detail.id,
                classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                quantity_stock: detail.quantity_stock,
                quantity_sold: detail.quantity_sold,
                classification_attribute_relationship: detail.classification_attribute_relationship
            }))
        };
    }

    async update(id: number, data: UpdateInventoryInput) {
        const inventory = await this.inventoryRepository.findById(id);
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }

        // Lấy các inventory details cũ
        const oldDetails = await this.inventoryDetailRepository.findByInventoryId(id);
        // Kiểm tra sản phẩm có phân loại không
        const product = await this.productRepository.findById(inventory.product_id);
        const productClassifications = await this.classificationAttributeRelationshipRepository.findByProductId(inventory.product_id);
        const hasClassification = productClassifications && productClassifications.length > 0;

        if (hasClassification) {
            // Cập nhật inventory_details cho sản phẩm có phân loại
            // Tạo map của các detail hiện tại theo classification_id
            const existingDetailsMap = new Map();
            oldDetails.forEach(detail => {
                existingDetailsMap.set(detail.classification_attribute_relationship_id, detail);
            });

            // Tạo set của các classification_id được cập nhật
            const updatedClassificationIds = new Set(
                data.inventory_details?.map(d => d.classification_attribute_relationship_id) ?? []
            );

            // Xử lý các detail mới hoặc cập nhật
            for (const detail of data.inventory_details ?? []) {
                const existingDetail = existingDetailsMap.get(detail.classification_attribute_relationship_id);

                if (existingDetail) {
                    // Cập nhật detail hiện có
                    const quantityDiff = detail.quantity_stock - existingDetail.quantity_stock;

                    // Cập nhật classification_attribute_relationship
                    const classification = await this.classificationAttributeRelationshipRepository.findById(
                        detail.classification_attribute_relationship_id
                    );
                    if (classification) {
                        const newQuantity = Number(classification.quantity || 0) - quantityDiff;
                        if (newQuantity < 0) {
                            throw new NotFoundException(`Số lượng phân loại không đủ. Còn lại: ${classification.quantity}, yêu cầu thêm: ${quantityDiff}`);
                        }
                        await this.classificationAttributeRelationshipRepository.update(
                            detail.classification_attribute_relationship_id,
                            { quantity: newQuantity }
                        );
                    }

                    // Cập nhật inventory detail
                    await this.inventoryDetailRepository.update(existingDetail.id, {
                        quantity_stock: detail.quantity_stock,
                        quantity_sold: detail.quantity_sold !== undefined ? detail.quantity_sold : existingDetail.quantity_sold
                    });
                } else {
                    // Tạo detail mới
                    const classification = await this.classificationAttributeRelationshipRepository.findById(
                        detail.classification_attribute_relationship_id
                    );
                    if (classification) {
                        const newQuantity = Number(classification.quantity || 0) - detail.quantity_stock;
                        if (newQuantity < 0) {
                            throw new NotFoundException(`Số lượng phân loại không đủ. Còn lại: ${classification.quantity}, yêu cầu: ${detail.quantity_stock}`);
                        }
                        await this.classificationAttributeRelationshipRepository.update(
                            detail.classification_attribute_relationship_id,
                            { quantity: newQuantity }
                        );
                    }

                    await this.inventoryDetailRepository.create({
                        inventory_id: id,
                        classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                        quantity_stock: detail.quantity_stock,
                        quantity_sold: detail.quantity_sold || 0
                    });
                }
            }

            // Xóa các detail không còn sử dụng và hoàn trả quantity
            for (const oldDetail of oldDetails) {
                if (!updatedClassificationIds.has(oldDetail.classification_attribute_relationship_id)) {
                    // Hoàn trả quantity cho classification
                    const classification = await this.classificationAttributeRelationshipRepository.findById(
                        oldDetail.classification_attribute_relationship_id
                    );
                    if (classification) {
                        const restoredQuantity = Number(classification.quantity || 0) + oldDetail.quantity_stock;
                        await this.classificationAttributeRelationshipRepository.update(
                            oldDetail.classification_attribute_relationship_id,
                            { quantity: restoredQuantity }
                        );
                    }

                    // Xóa detail
                    await this.inventoryDetailRepository.softDelete(oldDetail.id);
                }
            }

            // Cập nhật product total_quantity_divided
            const currentDetails = await this.inventoryDetailRepository.findByInventoryId(id);
            const oldTotalUsed = oldDetails.reduce((sum, detail) => sum + detail.quantity_stock, 0);
            const newTotalUsed = currentDetails.reduce((sum, detail) => sum + detail.quantity_stock, 0);

            if (product) {
                product.total_quantity_divided = Number(product.total_quantity_divided) + oldTotalUsed - newTotalUsed;
                await this.productRepository.update(product.id, { total_quantity_divided: product.total_quantity_divided });
            }
        } else {
            // Sản phẩm không có phân loại
            // Trừ số lượng cũ, cộng số lượng mới
            const oldStock = inventory.quantity_stock || 0;
            let newStock = oldStock;
            if (typeof data['quantity_stock'] === 'number') {
                newStock = data['quantity_stock'];
            } else if (data.inventory_details && data.inventory_details.length > 0) {
                newStock = data.inventory_details.reduce((sum, detail) => sum + detail.quantity_stock, 0);
            }
            // Cập nhật tồn kho: quantity_stock mới
            await this.inventoryRepository.update(id, {
                quantity_stock: newStock,
                quantity_sold: typeof data['quantity_sold'] === 'number' ? data['quantity_sold'] : inventory.quantity_sold || 0,
            });
            // Cập nhật lại product.total_quantity_divided: cộng lại số lượng cũ, trừ số lượng mới
            if (product) {
                product.total_quantity_divided = Number(product.total_quantity_divided) + oldStock - newStock;
                await this.productRepository.update(product.id, { total_quantity_divided: product.total_quantity_divided });
            }
        }
        // Reload inventory để có được inventory_details mới
        return this.inventoryRepository.findById(id);
    }

    async delete(id: number) {
        const inventory = await this.inventoryRepository.findById(id);
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }

        // Kiểm tra sản phẩm có phân loại không
        const product = await this.productRepository.findById(inventory.product_id);
        const productClassifications = await this.classificationAttributeRelationshipRepository.findByProductId(inventory.product_id);
        const hasClassification = productClassifications && productClassifications.length > 0;
        if (hasClassification) {
            // Lấy tất cả inventory details của inventory này
            const inventoryDetails = await this.inventoryDetailRepository.findByInventoryId(id);

            // Hoàn trả số lượng về classification_attribute_relationship
            for (const detail of inventoryDetails) {
                const classification = await this.classificationAttributeRelationshipRepository.findById(
                    detail.classification_attribute_relationship_id
                );
                if (classification) {
                    const restoredQuantity = Number(classification.quantity || 0) + Number(detail.quantity_stock);
                    await this.classificationAttributeRelationshipRepository.update(
                        classification.id,
                        { quantity: restoredQuantity }
                    );
                }
            }

            // Soft delete tất cả inventory details
            await this.inventoryDetailRepository.deleteByInventoryId(id);

            // Cập nhật lại product.total_quantity_divided: cộng lại tổng số lượng đã xóa
            if (product) {
                const totalDeleted = inventoryDetails.reduce((sum, detail) => sum + (detail.quantity_stock || 0), 0);
                product.total_quantity_divided = Number(product.total_quantity_divided) + totalDeleted;
                await this.productRepository.update(product.id, { total_quantity_divided: product.total_quantity_divided });
            }
        } else {
            // Sản phẩm không có phân loại
            // Cộng lại số lượng tồn kho đã xóa vào product.total_quantity_divided
            if (product) {
                product.total_quantity_divided = Number(product.total_quantity_divided) + (inventory.quantity_stock || 0);
                await this.productRepository.update(product.id, { total_quantity_divided: product.total_quantity_divided });
            }
        }
        // Soft delete all inventory details
        await this.inventoryDetailRepository.deleteByInventoryId(id);
        // Soft delete the inventory
        await this.inventoryRepository.softDelete(id);
        return { deleted: true };
    }


    async list(input: ListInventoryInput): Promise<{ data: any[]; total: number; page: number; size: number }> {
        let list = await this.inventoryRepository.findAll();
        let pid: number | undefined = undefined;
        let sid: number | undefined = undefined;
        if (input.product_id !== undefined && input.product_id !== null) {
            pid = Number(input.product_id);
            list = list.filter(inv => Number(inv.product_id) === pid);
        }
        if (input.store_id !== undefined && input.store_id !== null) {
            sid = Number(input.store_id);
            list = list.filter(inv => Number(inv.store_id) === sid);
        }
        if (input.key && input.key.trim() !== '') {
            const keyLower = input.key.toLowerCase();
            list = list.filter(inv => {
                const productName = inv.product?.name?.toLowerCase() || '';
                const storeName = inv.store?.store_name?.toLowerCase() || '';
                return productName.includes(keyLower) || storeName.includes(keyLower);
            });
        }

        if (pid !== undefined && sid !== undefined) {
            const idx = list.findIndex(inv => Number(inv.product_id) === pid && Number(inv.store_id) === sid);
            if (idx > 0) {
                const dup = list.splice(idx, 1)[0];
                list.unshift(dup);
            }
        }

        const total = list.length;
        const page = input.page && input.page > 0 ? input.page : 1;
        const size = input.size && input.size > 0 ? input.size : 10;
        const start = (page - 1) * size;
        const end = start + size;
        const data = await Promise.all(
            list.slice(start, end).map(async (inv) => ({
                id: inv.id,
                product_id: inv.product_id,
                product_name: inv.product?.name,
                store_id: inv.store_id,
                store_name: inv.store?.store_name,
                // quantity_stock: await this.getTotalQuantityStock(inv.id),
                // quantity_sold: await this.getTotalQuantitySold(inv.id),
                //hoang sua
                quantity_stock: await this.getTotalQuantityStock(inv.id, inv),
                quantity_sold: await this.getTotalQuantitySold(inv.id, inv),

                created_at: inv.created_at,
                updated_at: inv.updated_at,
            }))
        );
        return { data, total, page, size };
    }

    async transferInventory(data: {
        product_id: number;
        from_store_ids: number[] | 'all';
        to_store_ids: number[] | 'all';
        details: { classification_attribute_relationship_id: number; quantity: number }[];
    }) {
        // Lấy danh sách cửa hàng gửi
        let fromStores: number[] = [];
        if (data.from_store_ids === 'all') {
            const stores = await this.storeRepository.findAll({ size: 1000, page: 1 });
            fromStores = stores.map(s => s.id);
        } else {
            fromStores = data.from_store_ids;
        }
        // Lấy danh sách cửa hàng nhận
        let toStores: number[] = [];
        if (data.to_store_ids === 'all') {
            const stores = await this.storeRepository.findAll({ size: 1000, page: 1 });
            toStores = stores.map(s => s.id);
        } else {
            toStores = data.to_store_ids;
        }

        // Kiểm tra sản phẩm có phân loại không
        const productClassifications = await this.classificationAttributeRelationshipRepository.findByProductId(data.product_id);
        const hasClassification = productClassifications && productClassifications.length > 0;

        if (hasClassification) {
            // Sản phẩm có phân loại: giữ nguyên logic cũ
            // Kiểm tra tồn kho từng combo ở từng cửa hàng gửi
            for (const fromStoreId of fromStores) {
                const inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, fromStoreId);
                if (!inventory) throw new NotFoundException(`Không tìm thấy tồn kho ở cửa hàng gửi ${fromStoreId}`);
                for (const detail of data.details) {
                    const invDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
                        inventory.id,
                        detail.classification_attribute_relationship_id
                    );
                    if (!invDetail || invDetail.quantity_stock < detail.quantity) {
                        throw new NotFoundException(`Cửa hàng ${fromStoreId} không đủ tồn kho combo ${detail.classification_attribute_relationship_id}`);
                    }
                }
            }

            // Trừ tồn kho ở cửa hàng gửi
            for (const fromStoreId of fromStores) {
                const inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, fromStoreId);
                if (!inventory) continue;
                for (const detail of data.details) {
                    const invDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
                        inventory.id,
                        detail.classification_attribute_relationship_id
                    );
                    if (!invDetail) continue;
                    invDetail.quantity_stock -= detail.quantity;
                    await this.inventoryDetailRepository.update(invDetail.id, { quantity_stock: invDetail.quantity_stock });
                }
            }

            // Cộng tồn kho ở cửa hàng nhận
            for (const toStoreId of toStores) {
                let inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, toStoreId);
                if (!inventory) {
                    inventory = await this.inventoryRepository.create({ product_id: data.product_id, store_id: toStoreId });
                }
                for (const detail of data.details) {
                    let invDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
                        inventory.id,
                        detail.classification_attribute_relationship_id
                    );
                    if (invDetail) {
                        invDetail.quantity_stock += detail.quantity;
                        await this.inventoryDetailRepository.update(invDetail.id, { quantity_stock: invDetail.quantity_stock });
                    } else {
                        await this.inventoryDetailRepository.create({
                            inventory_id: inventory.id,
                            classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                            quantity_stock: detail.quantity,
                            quantity_sold: 0
                        });
                    }
                }
            }
        } else {
            // Sản phẩm không có phân loại
            // Kiểm tra tồn kho ở từng cửa hàng gửi
            for (const fromStoreId of fromStores) {
                const inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, fromStoreId);
                if (!inventory) throw new NotFoundException(`Không tìm thấy tồn kho ở cửa hàng gửi ${fromStoreId}`);
                // Nếu truyền details thì lấy tổng quantity, nếu không thì lấy quantity_stock
                let totalTransferQuantity = 0;
                if (data.details && data.details.length > 0) {
                    totalTransferQuantity = data.details.reduce((sum, d) => sum + d.quantity, 0);
                } else {
                    totalTransferQuantity = inventory.quantity_stock || 0;
                }
                if ((inventory.quantity_stock || 0) < totalTransferQuantity) {
                    throw new NotFoundException(`Cửa hàng ${fromStoreId} không đủ tồn kho sản phẩm không phân loại`);
                }
            }

            // Trừ tồn kho ở cửa hàng gửi
            for (const fromStoreId of fromStores) {
                const inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, fromStoreId);
                if (!inventory) continue;
                let totalTransferQuantity = 0;
                if (data.details && data.details.length > 0) {
                    totalTransferQuantity = data.details.reduce((sum, d) => sum + d.quantity, 0);
                } else {
                    totalTransferQuantity = inventory.quantity_stock || 0;
                }
                inventory.quantity_stock = (inventory.quantity_stock || 0) - totalTransferQuantity;
                await this.inventoryRepository.update(inventory.id, { quantity_stock: inventory.quantity_stock });
            }

            // Cộng tồn kho ở cửa hàng nhận
            for (const toStoreId of toStores) {
                let inventory = await this.inventoryRepository.findByProductAndStore(data.product_id, toStoreId);
                if (!inventory) {
                    inventory = await this.inventoryRepository.create({ product_id: data.product_id, store_id: toStoreId });
                }
                let totalTransferQuantity = 0;
                if (data.details && data.details.length > 0) {
                    totalTransferQuantity = data.details.reduce((sum, d) => sum + d.quantity, 0);
                } else {
                    totalTransferQuantity = 0;
                }
                inventory.quantity_stock = (inventory.quantity_stock || 0) + totalTransferQuantity;
                await this.inventoryRepository.update(inventory.id, { quantity_stock: inventory.quantity_stock });
            }
        }

        return { success: true, message: 'Chuyển kho thành công', fromStores, toStores, details: data.details };
    }

    async distributeInventory(data: DistributeInventoryInput) {
        throw new NotFoundException('Distribute inventory functionality is temporarily disabled during refactoring');
    }

    async collectInventory(data: CollectInventoryInput) {
        throw new NotFoundException('Collect inventory functionality is temporarily disabled during refactoring');
    }
}
