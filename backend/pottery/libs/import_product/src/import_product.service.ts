import { Injectable, NotFoundException } from '@nestjs/common';
import {
    ProductRepository,
    SupplierRepository,
    ImportProductRepository,
    ImportProductDetailRepository,
    ClassificationAttributeRelationshipRepository,
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
        private readonly importProductDetailRepository: ImportProductDetailRepository,
        private readonly productRepository: ProductRepository,
        private readonly supplierRepository: SupplierRepository,
        private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
    ) { }

    /**
     * Update total_quantity_divided for a product by summing all classification quantities
     */
    private async updateTotalQuantityDivided(productId: number): Promise<void> {
        // Get all classifications for this product
        const classifications =
            await this.classificationAttributeRelationshipRepository.findByProductId(
                productId,
            );

        // Calculate total quantity from all classifications
        const totalQuantity = classifications.reduce((total, classification) => {
            return total + (Number(classification.quantity) || 0);
        }, 0);

        // Update the product's total_quantity_divided
        await this.productRepository.update(productId, {
            total_quantity_divided: totalQuantity,
        });

        console.log(
            `Updated total_quantity_divided for product ${productId}: ${totalQuantity}`,
        );
    }

    async create(data: CreateImportProductInput) {
        const productId = Number(data.product_id);
        const supplierId = Number(data.supplier_id);

        // Always create new import_product for each import session
        const importProduct = await this.importProductRepository.create({
            product_id: productId,
            supplier_id: supplierId,
        });

        // Create import_product_details for each classification
        for (const item of data.classifications) {
            const classificationId = Number(
                item.classification_attribute_relationship_id,
            );

            await this.importProductDetailRepository.createDetail({
                import_product_id: importProduct.id,
                classification_attribute_relationship_id: classificationId,
                import_quantity: item.import_quantity,
                import_price: item.import_price,
            });

            // Update classification quantity
            const classification =
                await this.classificationAttributeRelationshipRepository.findById(
                    classificationId,
                );
            if (classification) {
                classification.quantity =
                    Number(classification.quantity || 0) + item.import_quantity;
                await this.classificationAttributeRelationshipRepository.update(
                    classificationId,
                    {
                        quantity: classification.quantity,
                    },
                );
            }
        }

        // Update total_quantity_divided for the product
        await this.updateTotalQuantityDivided(productId);

        const { data: allImportProducts } = await this.list({
            page: 1,
            size: 1000,
        });

        return {
            importProducts: allImportProducts,
        };
    }

    async update(id: number, data: UpdateImportProductInput) {
        const importProduct = await this.importProductRepository.findById(id);
        if (!importProduct) {
            throw new NotFoundException('Import product not found');
        }

        if (data.classifications) {
            // Delete existing details
            const existingDetails =
                await this.importProductDetailRepository.findByImportProductId(id);
            for (const detail of existingDetails) {
                // Revert classification quantity
                const classification =
                    await this.classificationAttributeRelationshipRepository.findById(
                        detail.classification_attribute_relationship_id,
                    );
                if (classification) {
                    classification.quantity =
                        Number(classification.quantity || 0) -
                        (detail.import_quantity || 0);
                    await this.classificationAttributeRelationshipRepository.update(
                        detail.classification_attribute_relationship_id,
                        { quantity: classification.quantity },
                    );
                }
                await this.importProductDetailRepository.softDeleteDetail(detail.id);
            }

            // Create new details
            for (const item of data.classifications) {
                const classificationId = Number(
                    item.classification_attribute_relationship_id,
                );

                await this.importProductDetailRepository.createDetail({
                    import_product_id: id,
                    classification_attribute_relationship_id: classificationId,
                    import_quantity: item.import_quantity,
                    import_price: item.import_price,
                });

                // Update classification quantity
                const classification =
                    await this.classificationAttributeRelationshipRepository.findById(
                        classificationId,
                    );
                if (classification) {
                    classification.quantity =
                        Number(classification.quantity || 0) + item.import_quantity;
                    await this.classificationAttributeRelationshipRepository.update(
                        classificationId,
                        {
                            quantity: classification.quantity,
                        },
                    );
                }
            }
        }

        return { updated: true };
    }

    async delete(id: number) {
        const importProduct = await this.importProductRepository.findById(id);
        if (!importProduct) {
            throw new NotFoundException('Import product not found');
        }

        // Delete all details and revert quantities
        const details =
            await this.importProductDetailRepository.findByImportProductId(id);
        for (const detail of details) {
            const classification =
                await this.classificationAttributeRelationshipRepository.findById(
                    detail.classification_attribute_relationship_id,
                );
            if (classification) {
                classification.quantity =
                    Number(classification.quantity || 0) - (detail.import_quantity || 0);
                await this.classificationAttributeRelationshipRepository.update(
                    detail.classification_attribute_relationship_id,
                    { quantity: classification.quantity },
                );
            }
            await this.importProductDetailRepository.softDeleteDetail(detail.id);
        }

        await this.importProductRepository.softDelete(id);

        // Update total_quantity_divided for the product
        await this.updateTotalQuantityDivided(importProduct.product_id);

        return { deleted: true };
    }
    async list(
        input: ListImportProductInput,
    ): Promise<{ data: any[]; total: number; page: number; size: number }> {
        let list = await this.importProductRepository.findAll();

        let pid: number | undefined = undefined;
        let sid: number | undefined = undefined;

        if (input.product_id !== undefined && input.product_id !== null) {
            pid = Number(input.product_id);
            list = list.filter((inv) => Number(inv.product_id) === pid);
        }

        if (input.supplier_id !== undefined && input.supplier_id !== null) {
            sid = Number(input.supplier_id);
            list = list.filter((inv) => Number(inv.supplier_id) === sid);
        }

        if (input.key && input.key.trim() !== '') {
            const keyLower = input.key.toLowerCase();
            list = list.filter((inv) => {
                const productName = inv.product?.name?.toLowerCase() || '';
                const supplierName = inv.supplier?.name?.toLowerCase() || '';
                return (
                    productName.includes(keyLower) || supplierName.includes(keyLower)
                );
            });
        }

        if (pid !== undefined && sid !== undefined) {
            const idx = list.findIndex(
                (inv) =>
                    Number(inv.product_id) === pid && Number(inv.supplier_id) === sid,
            );
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

        // Get details for each import product
        const dataWithDetails = await Promise.all(
            list.slice(start, end).map(async (inv) => {
                const details =
                    await this.importProductDetailRepository.findByImportProductId(
                        inv.id,
                    );

                return {
                    id: inv.id,
                    product_id: inv.product_id,
                    product_name: inv.product?.name,
                    supplier_id: inv.supplier_id,
                    supplier_name: inv.supplier?.name,
                    details: details.map((detail) => ({
                        id: detail.id,
                        classification_attribute_relationship_id:
                            detail.classification_attribute_relationship_id,
                        classification_name: `${detail.classification_attribute_relationship?.attribute1?.name || ''} - ${detail.classification_attribute_relationship?.attribute2?.name || ''}`,
                        attribute1_name:
                            detail.classification_attribute_relationship?.attribute1?.name ||
                            '',
                        attribute2_name:
                            detail.classification_attribute_relationship?.attribute2?.name ||
                            '',
                        import_quantity: detail.import_quantity,
                        import_price: detail.import_price,
                    })),
                    created_at: inv.created_at,
                    updated_at: inv.updated_at,
                };
            }),
        );

        return { data: dataWithDetails, total, page, size };
    }
}
