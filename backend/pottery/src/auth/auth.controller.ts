import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto } from './forgot-password.dto';
import { AuthService } from '@app/auth';
import { VerifyCodeDto } from './verify-code.dto';
import { ResetPasswordDto } from './reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        const input: ForgotPasswordDto = { email: dto.email };
        return await this.authService.sendForgotPasswordCode(input);
    }

    @Post('verify-code')
    async verifyCode(@Body() dto: VerifyCodeDto) {
        const input: VerifyCodeDto = { email: dto.email, code: dto.code };
        return await this.authService.verifyCode(input);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        const input: ResetPasswordDto = {
            email: dto.email,
            code: dto.code,
            newPassword: dto.newPassword,
            confirmPassword: dto.confirmPassword,
        };
        return await this.authService.resetPassword(input);
    }
}
