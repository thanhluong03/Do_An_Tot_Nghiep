
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ForgotPasswordInput, VerifyCodeInput, ResetPasswordInput } from './auth.interface';
import { CustomerEntity } from '@app/database';
import { SendMailService } from '@app/send_mail';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    // Memory cache: email -> { code, createdAt, used }
    private static codeCache = new Map<string, { code: string; createdAt: number; used: boolean }>();

    private readonly customerRepo: Repository<CustomerEntity>;
    constructor(
        dataSource: DataSource,
        private readonly mailService: SendMailService,
    ) {
        this.customerRepo = dataSource.getRepository(CustomerEntity);
    }

    async sendForgotPasswordCode(input: ForgotPasswordInput): Promise<{ success: boolean; message: string; expiresIn?: number }> {
        if (!input.email) {
            return {
                success: false,
                message: 'Email không hợp lệ',
            };
        }
        const code = randomInt(100000, 999999).toString();
        const createdAt = Date.now();
        AuthService.codeCache.set(input.email, { code, createdAt, used: false });
        await this.mailService.sendSimpleMail(
            input.email,
            'Mã xác thực quên mật khẩu',
            `Mã xác thực của bạn là: ${code}\nMã có hiệu lực trong 1 phút.`,
        );
        return {
            success: true,
            message: 'Đã gửi mã xác thực về email.',
            expiresIn: 60, // giây
        };
    }

    async verifyCode(input: VerifyCodeInput): Promise<{ success: boolean; message: string }> {
        const cache = AuthService.codeCache.get(input.email);
        if (!cache || cache.code !== input.code || cache.used) {
            return {
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            };
        }
        // Kiểm tra hạn dùng (1 phút)
        const expired = Date.now() - cache.createdAt > 60 * 1000;
        if (expired) {
            AuthService.codeCache.delete(input.email);
            return {
                success: false,
                message: 'Mã xác thực đã hết hạn.',
            };
        }
        return {
            success: true,
            message: 'Mã xác thực hợp lệ.',
        };
    }

    async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
        if (input.newPassword !== input.confirmPassword) {
            return { success: false, message: 'Mật khẩu xác thực không trùng khớp.' };
        }
        const cache = AuthService.codeCache.get(input.email);
        if (!cache || cache.code !== input.code || cache.used) {
            return {
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            };
        }
        // Kiểm tra hạn dùng (1 phút)
        const expired = Date.now() - cache.createdAt > 60 * 1000;
        if (expired) {
            AuthService.codeCache.delete(input.email);
            return {
                success: false,
                message: 'Mã xác thực đã hết hạn.',
            };
        }
        // Đổi mật khẩu cho customer
        const customer = await this.customerRepo.findOne({ where: { email: input.email } });
        if (!customer) {
            return {
                success: false,
                message: 'Không tìm thấy khách hàng.',
            };
        }
        // Hash mật khẩu mới
        if (customer) {
            const salt = await bcrypt.genSalt(10);
            customer.password_hash = await bcrypt.hash(input.newPassword, salt);
            await this.customerRepo.save(customer);
        }
        cache.used = true;
        AuthService.codeCache.delete(input.email);
        return {
            success: true,
            message: 'Đổi mật khẩu thành công.',
        };
    }
}
