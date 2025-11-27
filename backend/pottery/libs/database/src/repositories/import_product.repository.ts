import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ImportProductEntity } from '../entities/import_product.entity';

@Injectable()
export class ImportProductRepository {
    constructor(
        @InjectRepository(ImportProductEntity)
        private readonly repository: Repository<ImportProductEntity>,
    ) { }

    async findByProductAndSupplier(product_id: number, supplier_id: number): Promise<ImportProductEntity | null> {
        return this.repository.createQueryBuilder('import_product')
            .leftJoinAndSelect('import_product.product', 'product')
            .leftJoinAndSelect('import_product.supplier', 'supplier')
            .where('import_product.product_id = :product_id', { product_id })
            .andWhere('import_product.supplier_id = :supplier_id', { supplier_id })
            .andWhere('import_product.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('supplier.deleted_at IS NULL')
            .getOne();
    }

    async create(data: Partial<ImportProductEntity>): Promise<ImportProductEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<ImportProductEntity | null> {
        return this.repository.findOne({ where: { id, deleted_at: IsNull() } });
    }

    async findAll(): Promise<ImportProductEntity[]> {
        return this.repository.createQueryBuilder('import_product')
            .leftJoinAndSelect('import_product.supplier', 'supplier')
            .leftJoinAndSelect('import_product.user', 'user')
            .where('import_product.deleted_at IS NULL')
            .andWhere('supplier.deleted_at IS NULL')
            .orderBy('import_product.created_at', 'DESC')
            .getMany();
    }

    async findByProduct(product_id: number): Promise<ImportProductEntity[]> {
        return this.repository.createQueryBuilder('import_product')
            .leftJoinAndSelect('import_product.product', 'product')
            .leftJoinAndSelect('import_product.supplier', 'supplier')
            .where('import_product.product_id = :product_id', { product_id })
            .andWhere('import_product.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('supplier.deleted_at IS NULL')
            .getMany();
    }

    async findBySupplier(supplier_id: number): Promise<ImportProductEntity[]> {
        return this.repository.createQueryBuilder('import_product')
            .leftJoinAndSelect('import_product.product', 'product')
            .leftJoinAndSelect('import_product.supplier', 'supplier')
            .where('import_product.supplier_id = :supplier_id', { supplier_id })
            .andWhere('import_product.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('supplier.deleted_at IS NULL')
            .getMany();
    }

    async update(id: number, data: Partial<ImportProductEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}
