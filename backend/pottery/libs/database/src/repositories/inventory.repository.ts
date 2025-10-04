import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InventoryEntity } from '../entities/inventory.entity';

@Injectable()
export class InventoryRepository {
    constructor(
        @InjectRepository(InventoryEntity)
        private readonly repository: Repository<InventoryEntity>,
    ) { }

    async findByProductAndStore(product_id: number, store_id: number): Promise<InventoryEntity | null> {
        return this.repository.findOne({
            where: {
                product_id,
                store_id,
                deleted_at: IsNull(),
            },
            relations: ['product', 'store'],
        });
    }

    async create(data: Partial<InventoryEntity>): Promise<InventoryEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<InventoryEntity | null> {
        return this.repository.findOne({ where: { id, deleted_at: IsNull() } });
    }

    async findAll(): Promise<InventoryEntity[]> {
        return this.repository.find({ where: { deleted_at: IsNull() }, order: { created_at: 'DESC' } });
    }

    async findByProduct(product_id: number): Promise<InventoryEntity[]> {
        return this.repository.find({ where: { product_id, deleted_at: IsNull() } });
    }

    async findByStore(store_id: number): Promise<InventoryEntity[]> {
        return this.repository.find({ where: { store_id, deleted_at: IsNull() } });
    }

    async update(id: number, data: Partial<InventoryEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}
