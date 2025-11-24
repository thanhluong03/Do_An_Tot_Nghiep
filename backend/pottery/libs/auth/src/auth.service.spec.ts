import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SendMailService } from '@app/send_mail';
import { DataSource, Repository } from 'typeorm';
import { CustomerEntity } from '@app/database';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthService', () => {
    let service: AuthService;
    let mockCustomerRepo: jest.Mocked<Repository<CustomerEntity>>;
    let mockSendMailService: jest.Mocked<SendMailService>;
    let mockDataSource: jest.Mocked<DataSource>;

    beforeEach(async () => {
        // Clear static cache before each test
        (AuthService as any).codeCache.clear();

        // Mock repository
        mockCustomerRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
        } as any;

        // Mock DataSource
        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockCustomerRepo),
        } as any;

        // Mock SendMailService
        mockSendMailService = {
            sendSimpleMail: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: SendMailService,
                    useValue: mockSendMailService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('sendForgotPasswordCode', () => {
        it('should return error when email is empty', async () => {
            const result = await service.sendForgotPasswordCode({ email: '' });

            expect(result).toEqual({
                success: false,
                message: 'Email không hợp lệ',
            });
        });

        it('should send reset code successfully', async () => {
            const email = 'test@example.com';
            mockSendMailService.sendSimpleMail.mockResolvedValue(undefined);

            const result = await service.sendForgotPasswordCode({ email });

            expect(result).toEqual({
                success: true,
                message: 'Đã gửi mã xác thực về email.',
                expiresIn: 60,
            });
            expect(mockSendMailService.sendSimpleMail).toHaveBeenCalledWith(
                email,
                'Mã xác thực quên mật khẩu',
                expect.stringContaining('Mã xác thực của bạn là:'),
            );
        });

        it('should generate 6-digit code and store in cache', async () => {
            const email = 'test@example.com';
            mockSendMailService.sendSimpleMail.mockResolvedValue(undefined);

            await service.sendForgotPasswordCode({ email });

            const cache = (AuthService as any).codeCache.get(email);
            expect(cache).toBeDefined();
            expect(cache.code).toMatch(/^\d{6}$/);
            expect(cache.used).toBe(false);
            expect(cache.createdAt).toBeGreaterThan(Date.now() - 1000);
        });
    });

    describe('verifyCode', () => {
        beforeEach(async () => {
            // Setup code in cache
            (AuthService as any).codeCache.set('test@example.com', {
                code: '123456',
                createdAt: Date.now(),
                used: false,
            });
        });

        it('should return error when code not found', async () => {
            const result = await service.verifyCode({
                email: 'notfound@example.com',
                code: '123456',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            });
        });

        it('should return error when code is wrong', async () => {
            const result = await service.verifyCode({
                email: 'test@example.com',
                code: '999999',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            });
        });

        it('should return error when code is already used', async () => {
            (AuthService as any).codeCache.set('test@example.com', {
                code: '123456',
                createdAt: Date.now(),
                used: true,
            });

            const result = await service.verifyCode({
                email: 'test@example.com',
                code: '123456',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            });
        });

        it('should return error when code is expired', async () => {
            (AuthService as any).codeCache.set('test@example.com', {
                code: '123456',
                createdAt: Date.now() - 61 * 1000, // 61 seconds ago
                used: false,
            });

            const result = await service.verifyCode({
                email: 'test@example.com',
                code: '123456',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực đã hết hạn.',
            });
            expect((AuthService as any).codeCache.has('test@example.com')).toBe(false);
        });

        it('should verify code successfully', async () => {
            const result = await service.verifyCode({
                email: 'test@example.com',
                code: '123456',
            });

            expect(result).toEqual({
                success: true,
                message: 'Mã xác thực hợp lệ.',
            });
        });
    });

    describe('resetPassword', () => {
        beforeEach(async () => {
            // Setup code in cache
            (AuthService as any).codeCache.set('test@example.com', {
                code: '123456',
                createdAt: Date.now(),
                used: false,
            });
        });

        it('should return error when passwords do not match', async () => {
            const result = await service.resetPassword({
                email: 'test@example.com',
                code: '123456',
                newPassword: 'password123',
                confirmPassword: 'password456',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mật khẩu xác thực không trùng khớp.',
            });
        });

        it('should return error when code not found', async () => {
            const result = await service.resetPassword({
                email: 'notfound@example.com',
                code: '123456',
                newPassword: 'password123',
                confirmPassword: 'password123',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực không đúng hoặc đã hết hạn.',
            });
        });

        it('should return error when code is expired', async () => {
            (AuthService as any).codeCache.set('test@example.com', {
                code: '123456',
                createdAt: Date.now() - 61 * 1000,
                used: false,
            });

            const result = await service.resetPassword({
                email: 'test@example.com',
                code: '123456',
                newPassword: 'password123',
                confirmPassword: 'password123',
            });

            expect(result).toEqual({
                success: false,
                message: 'Mã xác thực đã hết hạn.',
            });
        });

        it('should return error when customer not found', async () => {
            mockCustomerRepo.findOne.mockResolvedValue(null);

            const result = await service.resetPassword({
                email: 'test@example.com',
                code: '123456',
                newPassword: 'password123',
                confirmPassword: 'password123',
            });

            expect(result).toEqual({
                success: false,
                message: 'Không tìm thấy khách hàng.',
            });
        });

        it('should reset password successfully', async () => {
            const mockCustomer = {
                id: 1,
                email: 'test@example.com',
                password_hash: 'oldHash',
            } as CustomerEntity;

            mockCustomerRepo.findOne.mockResolvedValue(mockCustomer);
            mockCustomerRepo.save.mockResolvedValue(mockCustomer);

            const result = await service.resetPassword({
                email: 'test@example.com',
                code: '123456',
                newPassword: 'password123',
                confirmPassword: 'password123',
            });

            expect(result).toEqual({
                success: true,
                message: 'Đổi mật khẩu thành công.',
            });
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
            expect(mockCustomer.password_hash).toBe('hashedPassword');
            expect(mockCustomerRepo.save).toHaveBeenCalledWith(mockCustomer);
            expect((AuthService as any).codeCache.has('test@example.com')).toBe(false);
        });
    });
});