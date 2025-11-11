import { SupplierEntity, SupplierRepository, ProductRepository, ClassificationAttributeRelationshipRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateSupplier, IListSupplier, IUpdateSupplier } from './supplier.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class SupplierService {
    constructor(
        private readonly supplierRepository: SupplierRepository,
        private readonly productRepository: ProductRepository,
        private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
    ) { }

    async create(data: ICreateSupplier): Promise<{ message: string, supplier: SupplierEntity | null }> {
        try {
            const supplier = await this.supplierRepository.create({
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
            });
            return {
                message: 'Supplier created successfully',
                supplier,
            };
        } catch (error) {
            return {
                message: 'Failed to create supplier',
                supplier: null,
            };
        }
    }

    async findAll(params: IListSupplier): Promise<{ message: string, suppliers: SupplierEntity[] }> {
        const suppliers = await this.supplierRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: suppliers.length > 0 ? 'Suppliers fetched successfully' : 'No suppliers found',
            suppliers,
        };
    }

    async findOne(id: number): Promise<{ message: string, supplier: SupplierEntity }> {
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) throw new NotFoundException('Supplier not found');
        return {
            message: 'Supplier fetched successfully',
            supplier,
        };
    }

    async update(id: number, data: IUpdateSupplier): Promise<{ message: string, supplier: SupplierEntity }> {
        await this.supplierRepository.update(id, data);
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) throw new NotFoundException('Supplier not found');
        return {
            message: 'Supplier updated successfully',
            supplier,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) throw new NotFoundException('Supplier not found');

        // Lấy danh sách sản phẩm của supplier
        const products = await this.productRepository.findBySupplier(id);
        for (const product of products) {
            // Trừ quantity đi total_quantity_divided
            const newQuantity = (product.quantity || 0) - (product.total_quantity_divided || 0);
            // Đặt total_quantity_divided về 0
            await this.productRepository.update(product.id, {
                quantity: newQuantity < 0 ? 0 : newQuantity,
                total_quantity_divided: 0,
            });

            // Nếu có phân loại, trừ quantity của từng classification_attribute_relationship về 0
            const relationships = await this.classificationAttributeRelationshipRepository.findByProductIdForImport(product.id);
            if (relationships && relationships.length > 0) {
                for (const rel of relationships) {
                    if (rel.id) {
                        await this.classificationAttributeRelationshipRepository.update(rel.id, {
                            quantity: 0,
                        });
                    }
                }
            }
        }

        await this.supplierRepository.softDelete(id);
        return { message: 'Supplier deleted successfully' };
    }
}
