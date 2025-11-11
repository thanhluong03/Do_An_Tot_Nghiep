import { StoreEntity, StoreRepository, InventoryRepository, InventoryDetailRepository, ProductRepository, ClassificationAttributeRelationshipRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateStore, IListStore, IUpdateStore } from './store.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class StoreService {
    constructor(
        private readonly storeRepository: StoreRepository,
        private readonly inventoryRepository: InventoryRepository,
        private readonly inventoryDetailRepository: InventoryDetailRepository,
        private readonly productRepository: ProductRepository,
        private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
    ) { }

    async create(data: ICreateStore): Promise<{ message: string, store: StoreEntity | null }> {
        try {
            const store = await this.storeRepository.create({
                store_name: data.store_name,
                address: data.address,
                phone: data.phone,
            });
            return {
                message: 'Store created successfully',
                store,
            };
        } catch (error) {
            return {
                message: 'Failed to create store',
                store: null,
            };
        }
    }

    async findAll(params: IListStore): Promise<{ message: string, stores: StoreEntity[] }> {
        const stores = await this.storeRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: stores.length > 0 ? 'Stores fetched successfully' : 'No stores found',
            stores,
        };
    }

    async findOne(id: number): Promise<{ message: string, store: StoreEntity }> {
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');
        return {
            message: 'Store fetched successfully',
            store,
        };
    }

    async update(id: number, data: IUpdateStore): Promise<{ message: string, store: StoreEntity }> {
        await this.storeRepository.update(id, data);
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');
        return {
            message: 'Store updated successfully',
            store,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');

        // Lấy tất cả inventory của cửa hàng
        const inventories = await this.inventoryRepository.findByStore(id);

        // Gom inventory theo product_id
        const productComboMap: Record<number, number> = {};
        // Gom inventory không phân loại theo product_id
        const productNoClassificationMap: Record<number, number> = {};
        for (const inventory of inventories) {
            const details = await this.inventoryDetailRepository.findByInventoryId(inventory.id);
            for (const detail of details) {
                // Tính tổng combo cho từng product_id
                if (inventory.product_id) {
                    productComboMap[inventory.product_id] = (productComboMap[inventory.product_id] || 0) + (detail.quantity_stock || 0);
                }
                // Cộng từng combo về lại quantity của classification_attribute_relationship
                if (detail.classification_attribute_relationship_id && detail.quantity_stock) {
                    const car = await this.classificationAttributeRelationshipRepository.findById(detail.classification_attribute_relationship_id);
                    if (car) {
                        car.quantity = (car.quantity || 0) + detail.quantity_stock;
                        await this.classificationAttributeRelationshipRepository.save(car);
                    }
                }
            }
            // Nếu inventory không có phân loại (không có detail hoặc detail không có classification_attribute_relationship_id)
            // và inventory có product_id, quantity_stock thì cộng quantity_stock vào product
            if ((!details || details.length === 0) && inventory.product_id && inventory.quantity_stock) {
                productNoClassificationMap[inventory.product_id] = (productNoClassificationMap[inventory.product_id] || 0) + inventory.quantity_stock;
            }
            // Nếu có detail nhưng KHÔNG có classification_attribute_relationship_id thì cộng quantity_stock vào product
            for (const detail of details) {
                if (!detail.classification_attribute_relationship_id && inventory.product_id && detail.quantity_stock) {
                    productNoClassificationMap[inventory.product_id] = (productNoClassificationMap[inventory.product_id] || 0) + detail.quantity_stock;
                }
            }
        }
        // Cộng tổng combo vào product một lần duy nhất
        for (const productIdStr of Object.keys(productComboMap)) {
            const productId = Number(productIdStr);
            const totalComboQuantity = productComboMap[productId];
            const product = await this.productRepository.findById(productId);
            if (product && totalComboQuantity > 0) {
                product.total_quantity_divided += totalComboQuantity;
                await this.productRepository.save(product);
            }
        }
        // Cộng tổng số lượng cho sản phẩm không có phân loại
        for (const productIdStr of Object.keys(productNoClassificationMap)) {
            const productId = Number(productIdStr);
            const totalQuantity = productNoClassificationMap[productId];
            const product = await this.productRepository.findById(productId);
            if (product && totalQuantity > 0) {
                product.total_quantity_divided += totalQuantity;
                await this.productRepository.save(product);
            }
        }
        await this.storeRepository.softDelete(id);
        return { message: 'Store deleted successfully' };
    }
}
