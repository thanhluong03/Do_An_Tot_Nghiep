import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InventoryDetailEntity } from '../entities/inventory_detail.entity';

@Injectable()
export class InventoryDetailRepository {
    constructor(
        @InjectRepository(InventoryDetailEntity)
        private readonly repository: Repository<InventoryDetailEntity>,
    ) { }

    async create(
        data: Partial<InventoryDetailEntity>,
    ): Promise<InventoryDetailEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<InventoryDetailEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: [
                'inventory',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async findByInventoryId(
        inventory_id: number,
    ): Promise<InventoryDetailEntity[]> {
        return this.repository.find({
            where: { inventory_id, deleted_at: IsNull() },
            relations: [
                'inventory',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async findByInventoryAndClassification(
        inventory_id: number,
        classification_attribute_relationship_id: number,
    ): Promise<InventoryDetailEntity | null> {
        return this.repository.findOne({
            where: {
                inventory_id,
                classification_attribute_relationship_id,
                deleted_at: IsNull(),
            },
            relations: [
                'inventory',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async update(
        id: number,
        data: Partial<InventoryDetailEntity>,
    ): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.update(id, { deleted_at: new Date() });
    }

    async deleteByInventoryId(inventoryId: number): Promise<void> {
        await this.repository.update(
            {
                inventory_id: inventoryId,
                deleted_at: IsNull()
            },
            { deleted_at: new Date() }
        );
    }

    async findAll(): Promise<InventoryDetailEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            relations: [
                'inventory',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
            order: { created_at: 'DESC' },
        });
    }
}