import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'
@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) { }

    async create(data: Partial<UserEntity>): Promise<UserEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<UserEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async update(id: number, data: Partial<UserEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }

    async findDrivers(): Promise<UserEntity[]> {
        return this.repository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.deleted_at IS NULL')
            .andWhere('user.is_active = :isActive', { isActive: true })
            .andWhere('role.name = :roleName', {
                roleName: 'DRIVER'
            })
            .orderBy('user.created_at', 'DESC')
            .getMany();
    }

    async findDriversByStore(storeId: number): Promise<UserEntity[]> {
        return this.repository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.store', 'store')
            .where('user.deleted_at IS NULL')
            .andWhere('user.is_active = :isActive', { isActive: true })
            .andWhere('user.store_id = :storeId', { storeId })
            .andWhere('role.name = :roleName', {
                roleName: 'DRIVER'
            })
            .orderBy('user.created_at', 'DESC')
            .getMany();
    }
}