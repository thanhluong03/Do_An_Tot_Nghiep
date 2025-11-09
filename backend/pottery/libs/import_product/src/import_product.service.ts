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

        // Update the product's total_quantity_divided và quantity
        await this.productRepository.update(productId, {
            total_quantity_divided: totalQuantity,
            quantity: totalQuantity,
        });

        console.log(
            `Updated total_quantity_divided and quantity for product ${productId}: ${totalQuantity}`,
        );
    }

    async create(data: CreateImportProductInput) {
        const productId = Number(data.product_id);
        const supplierId = Number(data.supplier_id);

        // Kiểm tra có phân loại hay không
        const hasClassification = Array.isArray(data.classifications) && data.classifications.length > 0;

        let importProduct;
        try {
            if (!hasClassification) {
                // Không có phân loại: lưu số lượng nhập và giá nhập vào bảng nhập hàng
                importProduct = await this.importProductRepository.create({
                    product_id: productId,
                    supplier_id: supplierId,
                    import_quantity: data.import_quantity,
                    import_price: data.import_price,
                });
                // Cập nhật số lượng cho sản phẩm
                const product = await this.productRepository.findById(productId);
                if (product) {
                    const newQuantity = Number(product.quantity || 0) + (data.import_quantity || 0);
                    await this.productRepository.update(productId, {
                        quantity: newQuantity,
                        total_quantity_divided: newQuantity,
                    });
                }
                // Trả về thông báo và dữ liệu
                return {
                    success: true,
                    message: 'Nhập sản phẩm thành công',
                    importProduct,
                };
            } else {
                // Có phân loại: logic cũ
                importProduct = await this.importProductRepository.create({
                    product_id: productId,
                    supplier_id: supplierId,
                });

                // Create import_product_details for each classification
                for (const item of data.classifications ?? []) {
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
                    success: true,
                    message: 'Nhập sản phẩm thành công',
                    importProduct,
                    importProducts: allImportProducts,
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Nhập sản phẩm thất bại',
                error: error?.message || error,
            };
        }
    }

    async update(id: number, data: UpdateImportProductInput) {
        try {
            const importProduct = await this.importProductRepository.findById(id);
            if (!importProduct) {
                return {
                    success: false,
                    message: 'Không tìm thấy phiếu nhập hàng',
                };
            }

            // Check if product has classification details
            const existingDetails = await this.importProductDetailRepository.findByImportProductId(id);
            if (existingDetails.length > 0) {
                // Logic for products with classification
                const newClassifications = data.classifications ?? [];
                // Map old details by classification id
                const oldDetailMap = new Map<number, any>();
                for (const detail of existingDetails) {
                    oldDetailMap.set(Number(detail.classification_attribute_relationship_id), detail);
                }
                // Map new classifications by id
                const newClassifyMap = new Map<number, any>();
                for (const item of newClassifications) {
                    newClassifyMap.set(Number(item.classification_attribute_relationship_id), item);
                }

                // Update or add details
                for (const item of newClassifications) {
                    const classificationId = Number(item.classification_attribute_relationship_id);
                    const oldDetail = oldDetailMap.get(classificationId);
                    if (oldDetail) {
                        // Cập nhật detail
                        await this.importProductDetailRepository.update(oldDetail.id, {
                            import_quantity: item.import_quantity,
                            import_price: item.import_price,
                        });
                        // Cập nhật lại quantity cho classification
                        const classification = await this.classificationAttributeRelationshipRepository.findById(classificationId);
                        if (classification) {
                            // Trừ đi số lượng cũ, cộng số lượng mới
                            classification.quantity = Number(classification.quantity || 0) - (oldDetail.import_quantity || 0) + item.import_quantity;
                            await this.classificationAttributeRelationshipRepository.update(classificationId, { quantity: classification.quantity });
                        }
                    } else {
                        // Thêm mới detail
                        await this.importProductDetailRepository.createDetail({
                            import_product_id: id,
                            classification_attribute_relationship_id: classificationId,
                            import_quantity: item.import_quantity,
                            import_price: item.import_price,
                        });
                        // Cộng quantity cho classification
                        const classification = await this.classificationAttributeRelationshipRepository.findById(classificationId);
                        if (classification) {
                            classification.quantity = Number(classification.quantity || 0) + item.import_quantity;
                            await this.classificationAttributeRelationshipRepository.update(classificationId, { quantity: classification.quantity });
                        }
                    }
                }

                // Xóa các detail cũ không còn trong danh sách mới
                for (const detail of existingDetails) {
                    const classificationId = Number(detail.classification_attribute_relationship_id);
                    if (!newClassifyMap.has(classificationId)) {
                        // Trừ quantity cho classification
                        const classification = await this.classificationAttributeRelationshipRepository.findById(classificationId);
                        if (classification) {
                            classification.quantity = Number(classification.quantity || 0) - (detail.import_quantity || 0);
                            await this.classificationAttributeRelationshipRepository.update(classificationId, { quantity: classification.quantity });
                        }
                        // Xóa detail
                        await this.importProductDetailRepository.softDeleteDetail(detail.id);
                    }
                }

                // Cập nhật lại tổng quantity cho product
                await this.updateTotalQuantityDivided(importProduct.product_id);
            } else {
                // Logic for products without classification
                // Trừ số lượng nhập cũ
                const oldImportQuantity = Number(importProduct.import_quantity || 0);
                const product = await this.productRepository.findById(importProduct.product_id);
                if (product) {
                    let newQuantity = Number(product.quantity || 0) - oldImportQuantity;
                    // Cộng số lượng nhập mới
                    const newImportQuantity = Number(data.import_quantity || 0);
                    newQuantity += newImportQuantity;
                    await this.importProductRepository.update(id, {
                        import_quantity: newImportQuantity,
                        import_price: data.import_price,
                    });
                    await this.productRepository.update(importProduct.product_id, {
                        quantity: newQuantity,
                        total_quantity_divided: newQuantity,
                    });
                }
            }

            return {
                success: true,
                message: 'Cập nhật phiếu nhập hàng thành công',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Cập nhật phiếu nhập hàng thất bại',
                error: error?.message || error,
            };
        }
    }

    async delete(id: number) {
        try {
            const importProduct = await this.importProductRepository.findById(id);
            if (!importProduct) {
                return {
                    success: false,
                    message: 'Không tìm thấy phiếu nhập hàng',
                };
            }

            // Check if product has classification details
            const details = await this.importProductDetailRepository.findByImportProductId(id);
            let totalDelete = 0;
            if (details.length > 0) {
                // Logic for products with classification
                for (const detail of details) {
                    const classification = await this.classificationAttributeRelationshipRepository.findById(detail.classification_attribute_relationship_id);
                    if (classification) {
                        classification.quantity = Number(classification.quantity || 0) - (detail.import_quantity || 0);
                        await this.classificationAttributeRelationshipRepository.update(detail.classification_attribute_relationship_id, { quantity: classification.quantity });
                    }
                    totalDelete += detail.import_quantity || 0;
                    await this.importProductDetailRepository.softDeleteDetail(detail.id);
                }
            } else {
                // Logic for products without classification
                totalDelete = Number(importProduct.import_quantity || 0);
            }

            await this.importProductRepository.softDelete(id);

            // Trừ số lượng nhập đã xóa khỏi product
            const product = await this.productRepository.findById(importProduct.product_id);
            if (product) {
                const newQuantity = Number(product.quantity || 0) - totalDelete;
                await this.productRepository.update(importProduct.product_id, {
                    quantity: newQuantity,
                    total_quantity_divided: newQuantity,
                });
            }

            return {
                success: true,
                message: 'Xóa phiếu nhập hàng thành công',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Xóa phiếu nhập hàng thất bại',
                error: error?.message || error,
            };
        }
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
                const details = await this.importProductDetailRepository.findByImportProductId(inv.id);
                if (details.length > 0) {
                    // Product with classification
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
                                detail.classification_attribute_relationship?.attribute1?.name || '',
                            attribute2_name:
                                detail.classification_attribute_relationship?.attribute2?.name || '',
                            import_quantity: detail.import_quantity,
                            import_price: detail.import_price,
                        })),
                        created_at: inv.created_at,
                        updated_at: inv.updated_at,
                    };
                } else {
                    // Product without classification
                    return {
                        id: inv.id,
                        product_id: inv.product_id,
                        product_name: inv.product?.name,
                        supplier_id: inv.supplier_id,
                        supplier_name: inv.supplier?.name,
                        import_quantity: inv.import_quantity,
                        import_price: inv.import_price,
                        created_at: inv.created_at,
                        updated_at: inv.updated_at,
                    };
                }
            }),
        );

        return { data: dataWithDetails, total, page, size };
    }
}