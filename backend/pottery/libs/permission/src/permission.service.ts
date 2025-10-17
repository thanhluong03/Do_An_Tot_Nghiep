import { Injectable } from '@nestjs/common';
import { PermissionEntity, PermissionRepository } from '@app/database';
import { ICreatePermission } from './permission.interface';
import { AVAILABLE_PERMISSIONS } from './permissions.type';

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRepository: PermissionRepository) { }
    getAllAvailablePermissions(): {
        message: string;
        permissions: Record<string, { key: string; name: string }[]>;
    } {
        return {
            message: 'Available permissions fetched successfully',
            permissions: AVAILABLE_PERMISSIONS,
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
        permissionKeys: string[]
    ): Promise<{ message: string }> {
        try {
            const currentPermissions = await this.permissionRepository.findByRoleId(roleId);
            const currentKeys = currentPermissions.map(p => p.name); // name là key
            // Xóa các quyền không còn
            const toDelete = currentPermissions.filter(p => !permissionKeys.includes(p.name));
            for (const perm of toDelete) {
                await this.permissionRepository.softDelete(perm.id);
            }
            // Thêm mới các quyền
            const toAdd = permissionKeys.filter(key => !currentKeys.includes(key));
            for (const key of toAdd) {
                await this.permissionRepository.create({
                    role_id: roleId,
                    name: key // Lưu đúng key vào trường name
                });
            }
            return { message: 'Permissions updated successfully' };
        } catch (error) {
            return { message: 'Failed to update permissions' };
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
