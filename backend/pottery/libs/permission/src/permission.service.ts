import { Injectable } from '@nestjs/common';
import { PermissionEntity, PermissionRepository } from '@app/database';
import { ICreatePermission } from './permission.interface';

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRepository: PermissionRepository) { }
e
    getAllAvailablePermissions(): {
        message: string;
        permissions: string[];
    } {
        const availablePermissions = [
            '/dashboard',
            '/users',
            '/roles',
            '/permissions',
            '/products',
            '/orders',
            '/suppliers',
            '/reports',
            '/settings',
            '/categories',
            '/inventory',
            '/customers'
        ];

        return {
            message: 'Available permissions fetched successfully',
            permissions: availablePermissions
        };
    }
    async getPermissionsByRole(roleId: number): Promise<{
        message: string;
        permissions: PermissionEntity[];
    }> {
        const permissions = await this.permissionRepository.findByRoleId(roleId);
        return {
            message:
                permissions.length > 0
                    ? 'Permissions fetched successfully'
                    : 'No permissions found for this role',
            permissions
        };
    }

    async updatePermissionsForRole(
        roleId: number,
        permissionNames: string[]
    ): Promise<{ message: string }> {
        try {
            await this.permissionRepository.deleteByRoleId(roleId);

            for (const permissionName of permissionNames) {
                await this.permissionRepository.create({
                    role_id: roleId,
                    name: permissionName,
                    description: `Permission to access ${permissionName}`
                });
            }

            return {
                message: 'Permissions updated successfully'
            };
        } catch (error) {
            throw new Error('Failed to update permissions');
        }
    }

    async create(data: ICreatePermission): Promise<{
        message: string;
        permission: PermissionEntity | null;
    }> {
        try {
            const permission = await this.permissionRepository.create(data);
            return {
                message: 'Permission created successfully',
                permission
            };
        } catch (error) {
            return {
                message: 'Failed to create permission',
                permission: null
            };
        }
    }
}
