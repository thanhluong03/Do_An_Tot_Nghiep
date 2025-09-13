import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly repository: Repository<PermissionEntity>
    ) { }

    async create(data: Partial<PermissionEntity>): Promise<PermissionEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async createMany(
        data: Partial<PermissionEntity>[]
    ): Promise<PermissionEntity[]> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<PermissionEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() }
        });
    }

    async findByRoleId(roleId: number): Promise<PermissionEntity[]> {
        return this.repository.find({
            where: { role_id: roleId, deleted_at: IsNull() },
            order: { created_at: 'ASC' }
        });
    }

    async update(id: number, data: Partial<PermissionEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async deleteByRoleId(roleId: number): Promise<void> {
        await this.repository.update(
            { role_id: roleId },
            { deleted_at: new Date() }
        );
    }
}