import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository, StoreRepository, InventoryRepository } from '@app/database';
import { CreateInventoryInput, UpdateInventoryInput, ListInventoryInput } from './inventory.interface';

@Injectable()
export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventoryRepository,
        private readonly productRepository: ProductRepository,
        private readonly storeRepository: StoreRepository,
    ) { }

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
            let totalQuantity = storeIds.length * data.quantity_stock;
            const product = await this.productRepository.findById(pid);
            if (product && Number(product.quantity) < totalQuantity) {
                throw new NotFoundException(`Số lượng sản phẩm không đủ để chia cho các cửa hàng. Sản phẩm còn: ${product.quantity}, yêu cầu chia: ${totalQuantity}`);
            }
            for (const sid of storeIds) {
                const existed = await this.inventoryRepository.findByProductAndStore(
                    pid,
                    sid,
                );
                if (existed) {
                    existed.quantity_stock += data.quantity_stock;
                    await this.inventoryRepository.create(existed);
                } else {
                    await this.inventoryRepository.create({
                        product_id: pid,
                        store_id: sid,
                        quantity_stock: data.quantity_stock,
                    });
                }
            }
            if (product) {
                product.quantity = Number(product.quantity) - totalQuantity;
                await this.productRepository.update(pid, { quantity: product.quantity });
            }
        }
        const { data: allInventories } = await this.list({ page: 1, size: 1000 });
        return {
            inventories: allInventories,
        };
    }

    async update(
        id: number,
        data: UpdateInventoryInput,
    ) {
        const inventory = await this.inventoryRepository.findById(id);
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }
        const oldQuantity = inventory.quantity_stock || 0;
        const newQuantity = typeof data.quantity_stock === 'number' ? data.quantity_stock : 0;
        inventory.quantity_stock = newQuantity;
        const product = await this.productRepository.findById(inventory.product_id);
        if (product) {
            product.quantity = Number(product.quantity) + oldQuantity - newQuantity;
            await this.productRepository.update(product.id, { quantity: product.quantity });
        }
        return this.inventoryRepository.create(inventory);
    }

    async delete(id: number) {
        const inventory = await this.inventoryRepository.findById(id);
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }
        const product = await this.productRepository.findById(inventory.product_id);
        if (product) {
            product.quantity = Number(product.quantity) + (inventory.quantity_stock || 0);
            await this.productRepository.update(product.id, { quantity: product.quantity });
        }
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
        const data = list.slice(start, end).map(inv => ({
            id: inv.id,
            product_id: inv.product_id,
            product_name: inv.product?.name,
            store_id: inv.store_id,
            store_name: inv.store?.store_name,
            quantity_stock: inv.quantity_stock,
            quantity_sold: inv.quantity_sold,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
        }));
        return { data, total, page, size };
    }
}
