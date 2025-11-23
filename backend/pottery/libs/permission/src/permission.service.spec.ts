import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { PermissionRepository, PermissionEntity } from '@app/database';

describe('PermissionService', () => {
    let service: PermissionService;
    let mockPermissionRepository: any;

    const createMockPermission = (overrides: Partial<PermissionEntity> = {}): PermissionEntity => ({
        id: 1,
        role_id: 1,
        name: 'test_permission',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        ...overrides
    } as PermissionEntity);

    beforeEach(async () => {
        mockPermissionRepository = {
            create: jest.fn(),
            findByRoleId: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionService,
                { provide: PermissionRepository, useValue: mockPermissionRepository },
            ],
        }).compile();

        service = module.get<PermissionService>(PermissionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('getAllAvailablePermissions', () => {
        it('should return available permissions with success message', () => {
            const result = service.getAllAvailablePermissions();

            expect(result.message).toBe('Available permissions fetched successfully');
            expect(result.permissions).toBeDefined();
            expect(typeof result.permissions).toBe('object');
            console.log('✅ Get available permissions thành công');
        });
    });

    describe('getPermissionsByRole', () => {
        it('should return permissions for role with success message', async () => {
            const roleId = 1;
            const mockPermissions = [
                createMockPermission(),
                createMockPermission({ id: 2, name: 'another_permission' })
            ];
            mockPermissionRepository.findByRoleId.mockResolvedValue(mockPermissions);

            const result = await service.getPermissionsByRole(roleId);

            expect(result.message).toBe('Permissions fetched successfully');
            expect(result.permissions).toEqual(mockPermissions);
            expect(mockPermissionRepository.findByRoleId).toHaveBeenCalledWith(roleId);
            console.log('✅ Get permissions by role thành công');
        });

        it('should return no permissions found message when empty', async () => {
            const roleId = 999;
            mockPermissionRepository.findByRoleId.mockResolvedValue([]);

            const result = await service.getPermissionsByRole(roleId);

            expect(result.message).toBe('No permissions found for this role');
            expect(result.permissions).toEqual([]);
            console.log('✅ No permissions found thành công');
        });
    });

    describe('create', () => {
        it('should create permission successfully', async () => {
            const createData = {
                role_id: 1,
                name: 'new_permission',
            };

            const mockPermission = createMockPermission(createData);
            mockPermissionRepository.create.mockResolvedValue(mockPermission);

            const result = await service.create(createData);

            expect(result.message).toBe('Permission created successfully');
            expect(result.permission).toEqual(mockPermission);
            expect(mockPermissionRepository.create).toHaveBeenCalledWith(createData);
            console.log('✅ Create permission thành công');
        });

        it('should handle create permission error', async () => {
            const createData = {
                role_id: 1,
                name: 'new_permission',
            };

            mockPermissionRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create permission');
            expect(result.permission).toBeNull();
            console.log('✅ Create permission error handling thành công');
        });
    });

    describe('updatePermissionsForRole', () => {
        it('should update permissions for role successfully', async () => {
            const roleId = 1;
            const permissionKeys = ['read_users', 'write_users'];
            const currentPermissions = [createMockPermission({ name: 'read_users' })];

            mockPermissionRepository.findByRoleId.mockResolvedValue(currentPermissions);
            mockPermissionRepository.create.mockResolvedValue(createMockPermission());

            const result = await service.updatePermissionsForRole(roleId, permissionKeys);

            expect(result.message).toBe('Permissions updated successfully');
            expect(mockPermissionRepository.findByRoleId).toHaveBeenCalledWith(roleId);
            console.log('✅ Update permissions for role thành công');
        });

        it('should handle update permissions error', async () => {
            const roleId = 1;
            const permissionKeys = ['read_users'];

            mockPermissionRepository.findByRoleId.mockRejectedValue(new Error('Database error'));

            const result = await service.updatePermissionsForRole(roleId, permissionKeys);

            expect(result.message).toBe('Failed to update permissions');
            console.log('✅ Update permissions error handling thành công');
        });
    });
});
