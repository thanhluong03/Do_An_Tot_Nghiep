
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../database/src/repositories/user.repository';
import { ICreateUser, IUpdateUser, IListUser } from './user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getUsers(params: IListUser): Promise<{ message: string, users: any[] }> {
        const users = await this.userRepository.findAll({
            page: params.page || 1,
            size: params.size || 10,
            key: params.key,
        });
        const formattedUsers = users.map(user => ({
            ...user,
            avatar_image: user.avatar_image ? user.avatar_image.toString('base64') : null,
        }));
        return {
            message: formattedUsers.length > 0 ? 'Users fetched successfully' : 'No users found',
            users: formattedUsers,
        };
    }

    async createUser(data: ICreateUser): Promise<{ message: string, user: any | null }> {
        if (data.password_hash) {
            const saltRounds = 10;
            data.password_hash = await bcrypt.hash(data.password_hash, saltRounds);
        }
        try {
            const user = await this.userRepository.create(data);
            return {
                message: 'User created successfully',
                user,
            };
        } catch (error) {
            return {
                message: 'Failed to create user',
                user: null,
            };
        }
    }

    async updateUser(id: number, data: IUpdateUser) {
        if (data.password_hash) {
            const saltRounds = 10;
            data.password_hash = await bcrypt.hash(data.password_hash, saltRounds);
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.userRepository.update(id, data);
        return this.userRepository.findById(id);
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.userRepository.softDelete(id);
        return {
            success: true,
            message: 'User deleted successfully'
        };
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async getDrivers(): Promise<{ message: string, users: any[] }> {
        const users = await this.userRepository.findDrivers();
        const formattedUsers = users.map(user => ({
            ...user,
            avatar_image: user.avatar_image ? user.avatar_image.toString('base64') : null,
        }));
        return {
            message: formattedUsers.length > 0 ? 'Drivers fetched successfully' : 'No drivers found',
            users: formattedUsers,
        };
    }
}
