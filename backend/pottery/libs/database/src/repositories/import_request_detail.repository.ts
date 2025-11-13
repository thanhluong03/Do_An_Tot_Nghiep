import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ImportRequestDetailEntity } from '../entities/import_request_detail.entity'

@Injectable()
export class ImportRequestDetailRepository {
    constructor(
        @InjectRepository(ImportRequestDetailEntity)
        private readonly repository: Repository<ImportRequestDetailEntity>,
    ) { }

    async create(
        data: Partial<ImportRequestDetailEntity>,
    ): Promise<ImportRequestDetailEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<ImportRequestDetailEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: [
                'importRequest',
                'product',
                'classificationAttributeRelationship',
            ],
        })
    }

    async findByImportRequestId(
        import_request_id: number,
    ): Promise<ImportRequestDetailEntity[]> {
        return this.repository.find({
            where: { import_request_id, deleted_at: IsNull() },
            relations: [
                'product',
                'classificationAttributeRelationship',
                'classificationAttributeRelationship.attribute1',
                'classificationAttributeRelationship.attribute2',
            ],
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<ImportRequestDetailEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }

    async deleteByImportRequestId(import_request_id: number): Promise<void> {
        await this.repository.softDelete({ import_request_id })
    }

    async findByProductAndClassification(
        import_request_id: number,
        product_id: number,
        classification_attribute_relationship_id?: number
    ): Promise<ImportRequestDetailEntity | null> {
        const whereCondition: any = {
            import_request_id,
            product_id,
            deleted_at: IsNull()
        };

        if (classification_attribute_relationship_id) {
            whereCondition.classification_attribute_relationship_id = classification_attribute_relationship_id;
        } else {
            whereCondition.classification_attribute_relationship_id = IsNull();
        }

        return this.repository.findOne({ where: whereCondition });
    }
}
