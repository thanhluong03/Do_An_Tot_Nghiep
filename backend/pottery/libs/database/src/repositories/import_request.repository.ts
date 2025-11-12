import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ImportRequestEntity } from '../entities/import_request.entity';

@Injectable()
export class ImportRequestRepository {
    constructor(
        @InjectRepository(ImportRequestEntity)
        private readonly repository: Repository<ImportRequestEntity>,
    ) { }

    async create(data: Partial<ImportRequestEntity>): Promise<ImportRequestEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<ImportRequestEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: ['store', 'importRequestDetails', 'importRequestDetails.product', 'importRequestDetails.classificationAttributeRelationship'],
        });
    }

    async findAll(params: { size: number; page: number; store_id?: number }): Promise<{ data: ImportRequestEntity[], total: number }> {
        const { size, page, store_id } = params;
        const where: any = { deleted_at: IsNull() };

        if (store_id) {
            where.store_id = store_id;
        }

        const [data, total] = await this.repository.findAndCount({
            where,
            relations: ['store', 'importRequestDetails'],
            order: { created_at: 'DESC' },
            take: size,
            skip: (page - 1) * size,
        });

        return { data, total };
    }

    async findByStore(store_id: number): Promise<ImportRequestEntity[]> {
        return this.repository.find({
            where: { store_id, deleted_at: IsNull() },
            relations: ['store', 'importRequestDetails', 'importRequestDetails.product'],
            order: { created_at: 'DESC' },
        });
    }

    async update(id: number, data: Partial<ImportRequestEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findByIdWithoutRelations(id: number): Promise<ImportRequestEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        });
    }
}
