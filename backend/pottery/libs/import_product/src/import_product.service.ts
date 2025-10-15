import { Injectable, NotFoundException } from '@nestjs/common';
import {
    ProductRepository,
    SupplierRepository,
    ImportProductRepository,
} from '@app/database';
import {
    CreateImportProductInput,
    UpdateImportProductInput,
    ListImportProductInput,
} from './import_product.interface';

@Injectable()
export class ImportProductService {
    constructor(
        private readonly importProductRepository: ImportProductRepository,
        private readonly productRepository: ProductRepository,
        private readonly supplierRepository: SupplierRepository,
    ) { }

    async create(data: CreateImportProductInput) {
        const supplierId = Number(data.supplier_id);
        for (const item of data.items) {
            const pid = Number(item.product_id);
            await this.importProductRepository.create({
                product_id: pid,
                supplier_id: supplierId,
                import_quantity: item.import_quantity,
                import_price: item.import_price,
            });
            const product = await this.productRepository.findById(pid);
            if (product) {
                product.quantity = Number(product.quantity) + item.import_quantity;
                product.total_quantity_divided = Number(product.total_quantity_divided) + item.import_quantity;
                await this.productRepository.update(pid, {
                    quantity: product.quantity,
                    total_quantity_divided: product.total_quantity_divided
                });
            }
        }
        const { data: allImportProducts } = await this.list({
            page: 1,
            size: 1000,
        });
        return {
            importProducts: allImportProducts,
        };
    }

    async update(
        id: number,
        data: UpdateImportProductInput,
    ) {
        const importProduct = await this.importProductRepository.findById(id);
        if (!importProduct) {
            throw new NotFoundException('Import product not found');
        }
        const oldImportQuantity = importProduct.import_quantity || 0;
        const newImportQuantity = typeof data.import_quantity === 'number' ? data.import_quantity : 0;
        importProduct.import_quantity = newImportQuantity;
        const product = await this.productRepository.findById(importProduct.product_id);
        if (product) {
            product.quantity = Number(product.quantity) - oldImportQuantity + newImportQuantity;
            product.total_quantity_divided = Number(product.total_quantity_divided) - oldImportQuantity + newImportQuantity;
            await this.productRepository.update(product.id, {
                quantity: product.quantity,
                total_quantity_divided: product.total_quantity_divided
            });
        }
        return this.importProductRepository.create(importProduct);
    }

    async delete(id: number) {
        const importProduct = await this.importProductRepository.findById(id);
        if (!importProduct) {
            throw new NotFoundException('Import product not found');
        }
        const product = await this.productRepository.findById(importProduct.product_id);
        if (product) {
            product.quantity = Number(product.quantity) - (importProduct.import_quantity || 0);
            product.total_quantity_divided = Number(product.total_quantity_divided) - (importProduct.import_quantity || 0);
            await this.productRepository.update(product.id, {
                quantity: product.quantity,
                total_quantity_divided: product.total_quantity_divided
            });
        }
        await this.importProductRepository.softDelete(id);
        return { deleted: true };
    }


    async list(input: ListImportProductInput): Promise<{ data: any[]; total: number; page: number; size: number }> {
        let list = await this.importProductRepository.findAll();
        let pid: number | undefined = undefined;
        let sid: number | undefined = undefined;
        if (input.product_id !== undefined && input.product_id !== null) {
            pid = Number(input.product_id);
            list = list.filter(inv => Number(inv.product_id) === pid);
        }
        if (input.supplier_id !== undefined && input.supplier_id !== null) {
            sid = Number(input.supplier_id);
            list = list.filter(inv => Number(inv.supplier_id) === sid);
        }
        if (input.key && input.key.trim() !== '') {
            const keyLower = input.key.toLowerCase();
            list = list.filter(inv => {
                const productName = inv.product?.name?.toLowerCase() || '';
                const supplierName = inv.supplier?.name?.toLowerCase() || '';
                return productName.includes(keyLower) || supplierName.includes(keyLower);
            });
        }

        if (pid !== undefined && sid !== undefined) {
            const idx = list.findIndex(inv => Number(inv.product_id) === pid && Number(inv.supplier_id) === sid);
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
            supplier_id: inv.supplier_id,
            supplier_name: inv.supplier?.name,
            import_quantity: inv.import_quantity,
            import_price: inv.import_price,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
        }));
        return { data, total, page, size };
    }
}
