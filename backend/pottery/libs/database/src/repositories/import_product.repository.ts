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
        return this.repository.findOne({
            where: {
                product_id,
                supplier_id,
                deleted_at: IsNull(),
            },
            relations: ['product', 'supplier'],
        });
    }

    async create(data: Partial<ImportProductEntity>): Promise<ImportProductEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<ImportProductEntity | null> {
        return this.repository.findOne({ where: { id, deleted_at: IsNull() } });
    }

    async findAll(): Promise<ImportProductEntity[]> {
        return this.repository.find({ where: { deleted_at: IsNull() }, order: { created_at: 'DESC' } });
    }

    async findByProduct(product_id: number): Promise<ImportProductEntity[]> {
        return this.repository.find({ where: { product_id, deleted_at: IsNull() } });
    }

    async findBySupplier(supplier_id: number): Promise<ImportProductEntity[]> {
        return this.repository.find({ where: { supplier_id, deleted_at: IsNull() } });
    }

    async update(id: number, data: Partial<ImportProductEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}
