import { RoleEntity, RoleRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateRole, IListRole, IUpdateRole } from './role.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class RoleService {
    constructor(
        private readonly roleRepository: RoleRepository,
    ) { }

    async create(data: ICreateRole): Promise<{ message: string, role: RoleEntity | null }> {
        try {
            const role = await this.roleRepository.create({
                name: data.name,
                description: data.description,
            });
            return {
                message: 'Role created successfully',
                role,
            };
        } catch (error) {
            return {
                message: 'Failed to create role',
                role: null,
            };
        }
    }

    async findAll(params: IListRole): Promise<{ message: string, roles: RoleEntity[] }> {
        const roles = await this.roleRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: roles.length > 0 ? 'Roles fetched successfully' : 'No roles found',
            roles,
        };
    }

    async findOne(id: number): Promise<{ message: string, role: RoleEntity }> {
        const role = await this.roleRepository.findById(id);
        if (!role) throw new NotFoundException('Role not found');
        return {
            message: 'Role fetched successfully',
            role,
        };
    }

    async update(id: number, data: IUpdateRole): Promise<{ message: string, role: RoleEntity }> {
        await this.roleRepository.update(id, data);
        const role = await this.roleRepository.findById(id);
        if (!role) throw new NotFoundException('Role not found');
        return {
            message: 'Role updated successfully',
            role,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const role = await this.roleRepository.findById(id);
        if (!role) throw new NotFoundException('Role not found');
        await this.roleRepository.softDelete(id);
        return { message: 'Role deleted successfully' };
    }
}
