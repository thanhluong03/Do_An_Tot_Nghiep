import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ImportProductDetailEntity } from '../entities/import_product_detail.entity';

@Injectable()
export class ImportProductDetailRepository {
    constructor(
        @InjectRepository(ImportProductDetailEntity)
        private readonly repository: Repository<ImportProductDetailEntity>,
    ) { }

    async findByImportProductId(
        import_product_id: number,
    ): Promise<ImportProductDetailEntity[]> {
        return this.repository.find({
            where: {
                import_product_id,
                deleted_at: IsNull(),
            },
            relations: [
                'import_product',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async findByImportProductAndClassification(
        import_product_id: number,
        classification_attribute_relationship_id: number,
    ): Promise<ImportProductDetailEntity | null> {
        return this.repository.findOne({
            where: {
                import_product_id,
                classification_attribute_relationship_id,
                deleted_at: IsNull(),
            },
            relations: [
                'import_product',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async create(
        data: Partial<ImportProductDetailEntity>,
    ): Promise<ImportProductDetailEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async createDetail(data: {
        import_product_id: number;
        classification_attribute_relationship_id: number;
        import_quantity: number;
        import_price: number;
    }): Promise<ImportProductDetailEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<ImportProductDetailEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: [
                'import_product',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }

    async update(
        id: number,
        data: Partial<ImportProductDetailEntity>,
    ): Promise<ImportProductDetailEntity | null> {
        await this.repository.update(id, data);
        return this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.repository.update(id, { deleted_at: new Date() });
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.update(id, { deleted_at: new Date() });
    }

    async softDeleteDetail(id: number): Promise<void> {
        await this.repository.update(id, { deleted_at: new Date() });
    }

    async findAll(): Promise<ImportProductDetailEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            relations: [
                'import_product',
                'classification_attribute_relationship',
                'classification_attribute_relationship.attribute1',
                'classification_attribute_relationship.attribute2',
            ],
        });
    }
}