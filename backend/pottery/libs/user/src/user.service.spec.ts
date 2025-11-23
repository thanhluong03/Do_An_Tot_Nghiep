import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../../database/src/repositories/user.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../database/src/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
    let service: UserService;
    let mockUserRepository: any;

    const createMockUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
        id: 1,
        role_id: 1,
        username: 'testuser',
        password_hash: 'hashedPassword',
        email: 'test@test.com',
        full_name: 'Test User',
        phone_number: '0123456789',
        address: 'Test Address',
        avatar_image: undefined,
        is_active: true,
        store_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        role: undefined,
        news: [],
        conversations: [],
        store: undefined,
        deliveryProofs: [],
        driverLocations: [],
        orderStatusHistories: [],
        ...overrides,
    } as UserEntity);

    beforeEach(async () => {
        // Reset mocks before each test
        jest.clearAllMocks();

        mockUserRepository = {
            findAll: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findDrivers: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('getUsers', () => {
        it('should return formatted users with success message', async () => {
            const mockUsers = [
                createMockUser({
                    username: 'testuser',
                    avatar_image: Buffer.from('test'),
                }),
            ];
            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            const result = await service.getUsers({ page: 1, size: 10 });

            expect(result.message).toBe('Users fetched successfully');
            expect(result.users[0].avatar_image).toBe('dGVzdA==');
            console.log('✅ Get users thành công');
        });

        it('should return no users found message when empty', async () => {
            mockUserRepository.findAll.mockResolvedValue([]);

            const result = await service.getUsers({ page: 1, size: 10 });

            expect(result.message).toBe('No users found');
            expect(result.users).toEqual([]);
            console.log('✅ No users found thành công');
        });

        it('should use default pagination when not provided', async () => {
            const mockUsers = [createMockUser({ username: 'testuser' })];
            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            await service.getUsers({});

            expect(mockUserRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
                key: undefined,
            });
            console.log('✅ Default pagination thành công');
        });

        it('should handle null avatar image correctly', async () => {
            const mockUsers = [createMockUser({ username: 'testuser', avatar_image: undefined })];
            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            const result = await service.getUsers({ page: 1, size: 10 });

            expect(result.users[0].avatar_image).toBe(null);
            console.log('✅ Null avatar handling thành công');
        });
    });

    describe('createUser', () => {
        it('should create user successfully with hashed password', async () => {
            const createData = {
                username: 'newuser',
                password_hash: 'plainPassword',
                email: 'new@test.com',
                full_name: 'New User',
            };

            const mockUser = createMockUser(createData);
            mockUserRepository.create.mockResolvedValue(mockUser);

            const result = await service.createUser(createData);

            expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
            expect(result.message).toBe('User created successfully');
            expect(result.user).toEqual(mockUser);
            console.log('✅ Create user with password thành công');
        });

        it('should create user without password hash', async () => {
            const createData = {
                username: 'newuser',
                email: 'new@test.com',
                full_name: 'New User',
            };

            const mockUser = createMockUser(createData);
            mockUserRepository.create.mockResolvedValue(mockUser);

            const result = await service.createUser(createData);

            expect(result.message).toBe('User created successfully');
            expect(result.user).toEqual(mockUser);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            console.log('✅ Create user without password thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                username: 'newuser',
                email: 'new@test.com',
                full_name: 'New User',
            };

            mockUserRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.createUser(createData);

            expect(result.message).toBe('Failed to create user');
            expect(result.user).toBeNull();
            console.log('✅ Create user error thành công');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const userId = 1;
            const updateData = { username: 'updateduser', full_name: 'Updated User' };
            const updatedUser = createMockUser({ ...updateData, id: userId });

            mockUserRepository.findById.mockResolvedValue(createMockUser({ id: userId }));
            mockUserRepository.update.mockResolvedValue(undefined);
            mockUserRepository.findById.mockResolvedValueOnce(createMockUser({ id: userId }))
                .mockResolvedValueOnce(updatedUser);

            const result = await service.updateUser(userId, updateData);

            expect(result.id).toBe(userId);
            console.log('✅ Update user thành công');
        });

        it('should hash password when updating password', async () => {
            const userId = 1;
            const updateData = { password_hash: 'newPassword' };

            mockUserRepository.findById.mockResolvedValue(createMockUser({ id: userId }));
            mockUserRepository.update.mockResolvedValue(undefined);
            mockUserRepository.findById.mockResolvedValueOnce(createMockUser({ id: userId }))
                .mockResolvedValueOnce(createMockUser({ id: userId }));

            await service.updateUser(userId, updateData);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            console.log('✅ Update user with password thành công');
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 999;
            const updateData = { username: 'updateduser' };

            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.updateUser(userId, updateData)).rejects.toThrow(
                new NotFoundException(`User with id ${userId} not found`)
            );
            console.log('✅ Update user not found error thành công');
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const userId = 1;
            mockUserRepository.findById.mockResolvedValue(createMockUser({ id: userId }));
            mockUserRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.deleteUser(userId);

            expect(result.message).toBe('User deleted successfully');
            console.log('✅ Delete user thành công');
        });

        it('should throw NotFoundException when user not found for deletion', async () => {
            const userId = 999;

            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.deleteUser(userId)).rejects.toThrow(
                new NotFoundException(`User with id ${userId} not found`)
            );
            console.log('✅ Delete user not found error thành công');
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const userId = 1;
            const mockUser = createMockUser();
            mockUserRepository.findById.mockResolvedValue(mockUser);

            const result = await service.getUserById(userId);

            expect(result).toEqual(mockUser);
            console.log('✅ Get user by ID thành công');
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 999;
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.getUserById(userId)).rejects.toThrow(
                new NotFoundException(`User with id ${userId} not found`)
            );
            console.log('✅ Get user by ID not found error thành công');
        });
    });

    describe('getDrivers', () => {
        it('should return formatted drivers with success message', async () => {
            const mockDrivers = [createMockUser({ role_id: 3, username: 'driver1' })];
            mockUserRepository.findDrivers.mockResolvedValue(mockDrivers);

            const result = await service.getDrivers();

            expect(result.message).toBe('Drivers fetched successfully');
            expect(result.users).toHaveLength(1);
            console.log('✅ Get drivers thành công');
        });

        it('should return no drivers found message when empty', async () => {
            mockUserRepository.findDrivers.mockResolvedValue([]);

            const result = await service.getDrivers();

            expect(result.message).toBe('No drivers found');
            expect(result.users).toEqual([]);
            console.log('✅ No drivers found thành công');
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const userId = 1;
            const oldPassword = 'oldPass123';
            const newPassword = 'newPass123';
            const mockUser = createMockUser({ id: userId });

            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockUserRepository.update.mockResolvedValue(undefined);

            const result = await service.changePassword(userId, oldPassword, newPassword);

            expect(result.message).toBe('Đổi mật khẩu thành công');
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            console.log('✅ Change password thành công');
        });

        it('should throw NotFoundException when user not found', async () => {
            const userId = 999;
            const oldPassword = 'oldPass123';
            const newPassword = 'newPass123';
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
                new NotFoundException('User not found')
            );
            console.log('✅ Change password user not found error thành công');
        });

        it('should throw BadRequestException when old password is incorrect', async () => {
            const userId = 1;
            const oldPassword = 'wrongPassword';
            const newPassword = 'newPass123';
            const mockUser = createMockUser({ id: userId });

            mockUserRepository.findById.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
                new BadRequestException('Mật khẩu cũ không đúng')
            );
            console.log('✅ Wrong old password error thành công');
        });
    });
});
