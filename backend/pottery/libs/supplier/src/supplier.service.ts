import { SupplierEntity, SupplierRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateSupplier, IListSupplier, IUpdateSupplier } from './supplier.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class SupplierService {
    constructor(
        private readonly supplierRepository: SupplierRepository,
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
        await this.supplierRepository.softDelete(id);
        return { message: 'Supplier deleted successfully' };
    }
}
