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
        const userId = Number(data.user_id);
        const supplierId = Number(data.supplier_id);

        try {
            // Tạo đơn nhập hàng
            const importProduct = await this.importProductRepository.create({
                user_id: userId,
                supplier_id: supplierId,
            });

            // Tạo chi tiết nhập hàng cho từng sản phẩm
            for (const detail of data.details) {
                const productId = Number(detail.product_id);
                const classificationId = detail.classification_attribute_relationship_id
                    ? Number(detail.classification_attribute_relationship_id)
                    : null;

                // Tạo chi tiết nhập hàng
                await this.importProductDetailRepository.createDetail({
                    import_product_id: importProduct.id,
                    product_id: productId,
                    classification_attribute_relationship_id: classificationId,
                    import_quantity: detail.import_quantity,
                    import_price: detail.import_price,
                });

                // Cập nhật số lượng cho sản phẩm
                if (classificationId) {
                    // Sản phẩm có phân loại: cập nhật quantity trong classification
                    const classification = await this.classificationAttributeRelationshipRepository.findById(classificationId);
                    if (classification) {
                        classification.quantity = Number(classification.quantity || 0) + detail.import_quantity;
                        await this.classificationAttributeRelationshipRepository.update(classificationId, {
                            quantity: classification.quantity,
                        });
                    }
                    // Cập nhật tổng số lượng cho product
                    await this.updateTotalQuantityDivided(productId);
                } else {
                    // Sản phẩm không có phân loại: cập nhật trực tiếp quantity của product
                    const product = await this.productRepository.findById(productId);
                    if (product) {
                        const newQuantity = Number(product.quantity || 0) + detail.import_quantity;
                        await this.productRepository.update(productId, {
                            quantity: newQuantity,
                            total_quantity_divided: newQuantity,
                        });
                    }
                }
            }

            const { data: allImportProducts } = await this.list({
                page: 1,
                size: 1000,
            });

            return {
                success: true,
                message: 'Nhập hàng thành công',
                importProduct,
                importProducts: allImportProducts,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Nhập hàng thất bại',
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

            // Lấy tất cả chi tiết cũ
            const existingDetails = await this.importProductDetailRepository.findByImportProductId(id);

            // Revert quantity từ chi tiết cũ
            for (const detail of existingDetails) {
                if (detail.classification_attribute_relationship_id) {
                    // Sản phẩm có phân loại
                    const classification = await this.classificationAttributeRelationshipRepository.findById(detail.classification_attribute_relationship_id);
                    if (classification) {
                        classification.quantity = Number(classification.quantity || 0) - detail.import_quantity;
                        await this.classificationAttributeRelationshipRepository.update(detail.classification_attribute_relationship_id, {
                            quantity: classification.quantity,
                        });
                    }
                    await this.updateTotalQuantityDivided(detail.product_id);
                } else {
                    // Sản phẩm không có phân loại
                    const product = await this.productRepository.findById(detail.product_id);
                    if (product) {
                        const newQuantity = Number(product.quantity || 0) - detail.import_quantity;
                        await this.productRepository.update(detail.product_id, {
                            quantity: newQuantity,
                            total_quantity_divided: newQuantity,
                        });
                    }
                }
                // Xóa chi tiết cũ
                await this.importProductDetailRepository.softDeleteDetail(detail.id);
            }

            // Tạo lại chi tiết mới
            for (const detail of data.details || []) {
                const productId = Number(detail.product_id);
                const classificationId = detail.classification_attribute_relationship_id
                    ? Number(detail.classification_attribute_relationship_id)
                    : null;

                // Tạo chi tiết nhập hàng mới
                await this.importProductDetailRepository.createDetail({
                    import_product_id: id,
                    product_id: productId,
                    classification_attribute_relationship_id: classificationId,
                    import_quantity: detail.import_quantity,
                    import_price: detail.import_price,
                });

                // Cập nhật số lượng
                if (classificationId) {
                    // Sản phẩm có phân loại
                    const classification = await this.classificationAttributeRelationshipRepository.findById(classificationId);
                    if (classification) {
                        classification.quantity = Number(classification.quantity || 0) + detail.import_quantity;
                        await this.classificationAttributeRelationshipRepository.update(classificationId, {
                            quantity: classification.quantity,
                        });
                    }
                    await this.updateTotalQuantityDivided(productId);
                } else {
                    // Sản phẩm không có phân loại
                    const product = await this.productRepository.findById(productId);
                    if (product) {
                        const newQuantity = Number(product.quantity || 0) + detail.import_quantity;
                        await this.productRepository.update(productId, {
                            quantity: newQuantity,
                            total_quantity_divided: newQuantity,
                        });
                    }
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

            // Lấy tất cả chi tiết và revert quantity
            const details = await this.importProductDetailRepository.findByImportProductId(id);
            for (const detail of details) {
                if (detail.classification_attribute_relationship_id) {
                    // Sản phẩm có phân loại
                    const classification = await this.classificationAttributeRelationshipRepository.findById(detail.classification_attribute_relationship_id);
                    if (classification) {
                        classification.quantity = Number(classification.quantity || 0) - detail.import_quantity;
                        await this.classificationAttributeRelationshipRepository.update(detail.classification_attribute_relationship_id, {
                            quantity: classification.quantity,
                        });
                    }
                    await this.updateTotalQuantityDivided(detail.product_id);
                } else {
                    // Sản phẩm không có phân loại
                    const product = await this.productRepository.findById(detail.product_id);
                    if (product) {
                        const newQuantity = Number(product.quantity || 0) - detail.import_quantity;
                        await this.productRepository.update(detail.product_id, {
                            quantity: newQuantity,
                            total_quantity_divided: newQuantity,
                        });
                    }
                }
                // Xóa chi tiết
                await this.importProductDetailRepository.softDeleteDetail(detail.id);
            }

            // Xóa phiếu nhập hàng
            await this.importProductRepository.softDelete(id);

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
        let list = (await this.importProductRepository.findAll())
            .filter(inv => inv.supplier);

        let sid: number | undefined = undefined;

        if (input.supplier_id !== undefined && input.supplier_id !== null) {
            sid = Number(input.supplier_id);
            list = list.filter((inv) => Number(inv.supplier_id) === sid);
        }

        if (input.user_id !== undefined && input.user_id !== null) {
            const uid = Number(input.user_id);
            list = list.filter((inv) => Number(inv.user_id) === uid);
        }

        if (input.key && input.key.trim() !== '') {
            const keyLower = input.key.toLowerCase();
            list = list.filter((inv) => {
                const supplierName = inv.supplier?.name?.toLowerCase() || '';
                const userName = inv.user?.full_name?.toLowerCase() || inv.user?.username?.toLowerCase() || '';
                return supplierName.includes(keyLower) || userName.includes(keyLower);
            });
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

                // Nhóm details theo product_id
                const groupedByProduct = details.reduce((acc, detail) => {
                    const productId = detail.product_id;
                    if (!acc[productId]) {
                        acc[productId] = {
                            product_id: detail.product_id,
                            product_name: detail.product?.name,
                            classifications: []
                        };
                    }

                    if (detail.classification_attribute_relationship_id) {
                        // Có phân loại
                        acc[productId].classifications.push({
                            id: detail.id,
                            classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                            classification_name: detail.classification_attribute_relationship_id
                                ? `${detail.classification_attribute_relationship?.attribute1?.name || ''} - ${detail.classification_attribute_relationship?.attribute2?.name || ''}`
                                : '',
                            attribute1_name: detail.classification_attribute_relationship?.attribute1?.name || '',
                            attribute2_name: detail.classification_attribute_relationship?.attribute2?.name || '',
                            import_quantity: detail.import_quantity,
                            import_price: detail.import_price,
                        });
                    } else {
                        // Không có phân loại
                        acc[productId].import_quantity = detail.import_quantity;
                        acc[productId].import_price = detail.import_price;
                    }

                    return acc;
                }, {} as Record<number, any>);

                return {
                    id: inv.id,
                    supplier_id: inv.supplier_id,
                    supplier_name: inv.supplier?.name,
                    user_id: inv.user_id,
                    user_name: inv.user?.full_name || inv.user?.username,
                    products: Object.values(groupedByProduct),
                    created_at: inv.created_at,
                    updated_at: inv.updated_at,
                };
            }),
        ); return { data: dataWithDetails, total, page, size };
    }
}