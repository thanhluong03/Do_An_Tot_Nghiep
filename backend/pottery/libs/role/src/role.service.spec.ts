import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository, RoleEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
    let service: RoleService;
    let mockRoleRepository: jest.Mocked<RoleRepository>;

    const createMockRole = (overrides: Partial<RoleEntity> = {}): RoleEntity => ({
        id: 1,
        name: 'Test Role',
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: [],
        rolePermissions: [],
        ...overrides,
    } as RoleEntity);

    beforeEach(async () => {
        mockRoleRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                { provide: RoleRepository, useValue: mockRoleRepository },
            ],
        }).compile();

        service = module.get<RoleService>(RoleService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('create', () => {
        it('should create role successfully', async () => {
            const createData = {
                name: 'New Role',
                description: 'New Description',
            };
            const mockRole = createMockRole(createData);
            mockRoleRepository.create.mockResolvedValue(mockRole);

            const result = await service.create(createData);

            expect(mockRoleRepository.create).toHaveBeenCalledWith({
                name: createData.name,
                description: createData.description,
            });
            expect(result.message).toBe('Role created successfully');
            expect(result.role).toEqual(mockRole);
            console.log('✅ Create role thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                name: 'New Role',
                description: 'New Description',
            };
            mockRoleRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create role');
            expect(result.role).toBeNull();
            console.log('✅ Create role error handling thành công');
        });
    });

    describe('findAll', () => {
        it('should return roles with success message', async () => {
            const mockRoles = [
                createMockRole({ name: 'Role 1' }),
                createMockRole({ id: 2, name: 'Role 2' }),
            ];
            mockRoleRepository.findAll.mockResolvedValue(mockRoles);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(mockRoleRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
            });
            expect(result.message).toBe('Roles fetched successfully');
            expect(result.roles).toEqual(mockRoles);
            console.log('✅ Get roles thành công');
        });

        it('should return no roles found message when empty', async () => {
            mockRoleRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('No roles found');
            expect(result.roles).toEqual([]);
            console.log('✅ No roles found thành công');
        });

        it('should use default pagination when not provided', async () => {
            const mockRoles = [createMockRole()];
            mockRoleRepository.findAll.mockResolvedValue(mockRoles);

            await service.findAll({});

            expect(mockRoleRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
            });
            console.log('✅ Default pagination thành công');
        });
    });

    describe('findOne', () => {
        it('should return role when found', async () => {
            const roleId = 1;
            const mockRole = createMockRole({ id: roleId });
            mockRoleRepository.findById.mockResolvedValue(mockRole);

            const result = await service.findOne(roleId);

            expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
            expect(result.message).toBe('Role fetched successfully');
            expect(result.role).toEqual(mockRole);
            console.log('✅ Get role by ID thành công');
        });

        it('should throw NotFoundException when role not found', async () => {
            const roleId = 999;
            mockRoleRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(roleId)).rejects.toThrow(
                new NotFoundException('Role not found')
            );
            console.log('✅ Role not found error thành công');
        });
    });

    describe('update', () => {
        it('should update role successfully', async () => {
            const roleId = 1;
            const updateData = { name: 'Updated Role', description: 'Updated Description' };
            const updatedRole = createMockRole({ id: roleId, ...updateData });

            mockRoleRepository.update.mockResolvedValue(undefined);
            mockRoleRepository.findById.mockResolvedValue(updatedRole);

            const result = await service.update(roleId, updateData);

            expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, updateData);
            expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
            expect(result.message).toBe('Role updated successfully');
            expect(result.role).toEqual(updatedRole);
            console.log('✅ Update role thành công');
        });

        it('should throw NotFoundException when role not found for update', async () => {
            const roleId = 999;
            const updateData = { name: 'Updated Role' };

            mockRoleRepository.update.mockResolvedValue(undefined);
            mockRoleRepository.findById.mockResolvedValue(null);

            await expect(service.update(roleId, updateData)).rejects.toThrow(
                new NotFoundException('Role not found')
            );
            console.log('✅ Update role not found error thành công');
        });
    });

    describe('softDelete', () => {
        it('should delete role successfully', async () => {
            const roleId = 1;
            const mockRole = createMockRole({ id: roleId });

            mockRoleRepository.findById.mockResolvedValue(mockRole);
            mockRoleRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.softDelete(roleId);

            expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
            expect(mockRoleRepository.softDelete).toHaveBeenCalledWith(roleId);
            expect(result.message).toBe('Role deleted successfully');
            console.log('✅ Delete role thành công');
        });

        it('should throw NotFoundException when role not found for deletion', async () => {
            const roleId = 999;

            mockRoleRepository.findById.mockResolvedValue(null);

            await expect(service.softDelete(roleId)).rejects.toThrow(
                new NotFoundException('Role not found')
            );
            console.log('✅ Delete role not found error thành công');
        });
    });
});
