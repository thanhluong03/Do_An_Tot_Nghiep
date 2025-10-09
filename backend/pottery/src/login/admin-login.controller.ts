import { Body, Controller, Post } from '@nestjs/common';
import { AdminLoginDto } from './admin-login.dto';
import { LoginService } from '@app/login';

@Controller('admin')
export class AdminLoginController {
    constructor(private readonly loginService: LoginService) { }

    @Post('login')
    async login(@Body() adminLoginDto: AdminLoginDto) {
        return this.loginService.adminLogin(adminLoginDto);
    }
}
