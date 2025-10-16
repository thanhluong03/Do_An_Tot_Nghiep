import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Post
} from '@nestjs/common';
import { PermissionService } from '@app/permission';
import {
    CreatePermissionDto,
    UpdatePermissionsDto,
    PermissionResponseDto
} from './permission.dto';
import { plainToInstance } from 'class-transformer';

@Controller('permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) { }

    @Get('listpermissions')
    async getAvailablePermissions(): Promise<{
        message: string;
        permissions: Record<string, { key: string; name: string }[]>;
    }> {
        return this.permissionService.getAllAvailablePermissions();
    }

    @Get('role/:roleId')
    async getPermissionsByRole(
        @Param('roleId') roleId: number
    ): Promise<PermissionResponseDto[]> {
        const result = await this.permissionService.getPermissionsByRole(
            Number(roleId)
        );
        return result.permissions.map((permission) =>
            plainToInstance(PermissionResponseDto, permission, {
                excludeExtraneousValues: true
            })
        );
    }

    @Put('role/:roleId')
    async updatePermissionsForRole(
        @Param('roleId') roleId: number,
        @Body() updatePermissionsDto: UpdatePermissionsDto
    ): Promise<{ message: string }> {
        return this.permissionService.updatePermissionsForRole(
            Number(roleId),
            updatePermissionsDto.permissions
        );
    }

    @Post('createpermission')
    async createPermission(
        @Body() createPermissionDto: CreatePermissionDto
    ): Promise<PermissionResponseDto | null> {
        const result = await this.permissionService.create(createPermissionDto);
        if (result.permission) {
            return plainToInstance(PermissionResponseDto, result.permission, {
                excludeExtraneousValues: true
            });
        }
        return null;
    }
}