import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { RoleEntity } from '../entities/role.entity'

@Injectable()
export class RoleRepository {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly repository: Repository<RoleEntity>,
    ) { }

    async create(data: Partial<RoleEntity>): Promise<RoleEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<RoleEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: ['permissions']
        });
    }

    async findByIdWithPermissions(id: number): Promise<RoleEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: ['permissions']
        });
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<RoleEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<RoleEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}