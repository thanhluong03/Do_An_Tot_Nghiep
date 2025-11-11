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

    async findByProductAndStore(
        product_id: number,
        store_id: number,
    ): Promise<InventoryEntity | null> {
        return this.repository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('inventory.store', 'store')
            .leftJoinAndSelect('inventory.inventory_details', 'inventory_details')
            .where('inventory.product_id = :product_id', { product_id })
            .andWhere('inventory.store_id = :store_id', { store_id })
            .andWhere('inventory.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('store.deleted_at IS NULL')
            .getOne();
    }

    async create(data: Partial<InventoryEntity>): Promise<InventoryEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<InventoryEntity | null> {
        return this.repository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('inventory.store', 'store')
            .leftJoinAndSelect('inventory.inventory_details', 'inventory_details')
            .where('inventory.id = :id', { id })
            .andWhere('inventory.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('store.deleted_at IS NULL')
            .getOne();
    }

    async findAll(): Promise<InventoryEntity[]> {
        return this.repository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('inventory.store', 'store')
            .leftJoinAndSelect('inventory.inventory_details', 'inventory_details')
            .where('inventory.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('store.deleted_at IS NULL')
            .orderBy('inventory.created_at', 'DESC')
            .getMany();
    }

    async findByProduct(product_id: number): Promise<InventoryEntity[]> {
        return this.repository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('inventory.store', 'store')
            .leftJoinAndSelect('inventory.inventory_details', 'inventory_details')
            .where('inventory.product_id = :product_id', { product_id })
            .andWhere('inventory.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('store.deleted_at IS NULL')
            .getMany();
    }

    async findByStore(store_id: number): Promise<InventoryEntity[]> {
        return this.repository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('inventory.store', 'store')
            .leftJoinAndSelect('inventory.inventory_details', 'inventory_details')
            .where('inventory.store_id = :store_id', { store_id })
            .andWhere('inventory.deleted_at IS NULL')
            .andWhere('product.deleted_at IS NULL')
            .andWhere('store.deleted_at IS NULL')
            .getMany();
    }

    async update(id: number, data: Partial<InventoryEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }
}
