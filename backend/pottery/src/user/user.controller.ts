import { Controller, Get, Post, Put, Delete, Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../../libs/user/src/user.service';
import { CreateUserDto, UpdateUserDto, ListUserRequestDto } from './user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('createuser')
    @UseInterceptors(FileInterceptor('avatar_image'))
    async createUser(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateUserDto
    ) {
        try {
            if (!body || !body.password) {
                throw new Error('Missing password field in request body');
            }
            const { password, ...restData } = body;
            const userData = {
                ...restData,
                password_hash: password,
                avatar_image: file ? file.buffer : undefined
            };
            const user = await this.userService.createUser(userData);
            return user;
        } catch (error) {
            // Hiển thị lỗi rõ ràng
            throw error;
        }
    }

    @Get('listusers')
    async getUsers(@Query() query: ListUserRequestDto) {
        return await this.userService.getUsers(query);
    }

    @Get('userdetail/:id')
    async getUserDetail(@Param('id') id: number) {
        return await this.userService.getUserById(Number(id));
    }

    @Put('updateuser/:id')
    @UseInterceptors(FileInterceptor('avatar_image'))
    async updateUser(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UpdateUserDto
    ) {
        try {
            if (!body) {
                throw new Error('Missing request body');
            }
            let userData: any = { ...body };
            if (body.password) {
                userData.password_hash = body.password;
                delete userData.password;
            }
            if (file) {
                userData.avatar_image = file.buffer;
            }
            const user = await this.userService.updateUser(Number(id), userData);
            return user;
        } catch (error) {
            // Hiển thị lỗi rõ ràng
            throw error;
        }
    }

    @Delete('deleteuser/:id')
    async deleteUser(@Param('id') id: number) {
        return await this.userService.deleteUser(Number(id));
    }

    @Get('drivers')
    async getDrivers() {
        return await this.userService.getDrivers();
    }
}
