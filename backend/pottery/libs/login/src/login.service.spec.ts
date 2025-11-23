import { LoginService } from './login.service';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '@app/customer';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/database/entities/user.entity';
import { RoleEntity } from '@app/database/entities/role.entity';
import { PermissionEntity } from '@app/database/entities/permission.entity';

describe('LoginService', () => {
    let service: LoginService;
    let jwtService: Partial<JwtService>;
    let customerService: Partial<CustomerService>;
    let userRepository: Partial<Repository<UserEntity>>;
    let roleRepository: Partial<Repository<RoleEntity>>;
    let permissionRepository: Partial<Repository<PermissionEntity>>;

    beforeEach(() => {
        jwtService = { sign: jest.fn().mockReturnValue('token') };
        customerService = {
            getCustomers: jest.fn(),
            createCustomer: jest.fn(),
        };
        userRepository = { findOne: jest.fn() };
        roleRepository = {};
        permissionRepository = {};

        service = new LoginService(
            jwtService as JwtService,
            customerService as CustomerService,
            userRepository as Repository<UserEntity>,
            roleRepository as Repository<RoleEntity>,
            permissionRepository as Repository<PermissionEntity>,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should fail if user not found', async () => {
            console.log('Test: login thất bại khi không tìm thấy user');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [] });
            const result = await service.login({ email: 'test@test.com', password: '123' });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Email does not exist');
        });
        it('should fail if password incorrect', async () => {
            console.log('Test: login thất bại khi sai mật khẩu');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [{ email: 'test@test.com', password_hash: 'hash' }] });
            jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);
            const result = await service.login({ email: 'test@test.com', password: 'wrong' });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Incorrect password');
        });
        it('should succeed if user and password correct', async () => {
            console.log('Test: login thành công khi đúng user và password');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [{ email: 'test@test.com', password_hash: 'hash', id: 1, full_name: 'Test' }] });
            jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
            const result = await service.login({ email: 'test@test.com', password: '123' });
            expect(result.success).toBe(true);
            expect(result.token).toBe('token');
            expect(result.user?.email).toBe('test@test.com');
        });
    });

    describe('register', () => {
        it('should fail if email exists', async () => {
            console.log('Test: register thất bại khi email đã tồn tại');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [{ email: 'test@test.com' }] });
            const result = await service.register({ email: 'test@test.com', password: '123', name: 'Test' });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Email already exists');
        });
        it('should fail if createCustomer fails', async () => {
            console.log('Test: register thất bại khi tạo customer lỗi');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [] });
            (customerService.createCustomer as jest.Mock).mockResolvedValue({ customer: null });
            const result = await service.register({ email: 'new@test.com', password: '123', name: 'Test' });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Registration failed');
        });
        it('should succeed if createCustomer returns customer', async () => {
            console.log('Test: register thành công khi tạo customer mới');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [] });
            (customerService.createCustomer as jest.Mock).mockResolvedValue({ customer: { id: 2 } });
            const result = await service.register({ email: 'new@test.com', password: '123', name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.token).toBe('token');
            expect(result.user?.id).toBe(2);
        });
    });

    describe('googleAuthRedirect', () => {
        it('should create customer if not exists and return redirect url', async () => {
            console.log('Test: googleAuthRedirect trả về url đúng khi tạo mới customer');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [] });
            (customerService.createCustomer as jest.Mock).mockResolvedValue({ customer: { id: 3 } });
            const result = await service.googleAuthRedirect({ email: 'g@test.com', name: 'Google' }, 'http://test.com');
            expect(result).toContain('http://test.com/login-success');
            expect(result).toContain('token');
        });
        it('should use existing customer and return redirect url', async () => {
            console.log('Test: googleAuthRedirect trả về url đúng khi đã có customer');
            (customerService.getCustomers as jest.Mock).mockResolvedValue({ customers: [{ email: 'g@test.com', id: 4 }] });
            const result = await service.googleAuthRedirect({ email: 'g@test.com', name: 'Google' });
            expect(result).toContain('/login-success');
            expect(result).toContain('token');
        });
    });

    describe('adminLogin', () => {
        it('should throw if user not found', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue(null);
            await expect(service.adminLogin({ username: 'admin', password: '123' })).rejects.toThrow('Tài khoản không tồn tại');
        });
        it('should throw if password not match', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue({ username: 'admin', password_hash: 'hash', role: {} });
            jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);
            await expect(service.adminLogin({ username: 'admin', password: 'wrong' })).rejects.toThrow('Mật khẩu không đúng');
        });
        it('should throw if no role', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue({ username: 'admin', password_hash: 'hash', role: null });
            jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
            await expect(service.adminLogin({ username: 'admin', password: '123' })).rejects.toThrow('Không tìm thấy role');
        });
        it('should return token and info if login success', async () => {
            console.log('Test: adminLogin trả về token và thông tin khi thành công');
            (userRepository.findOne as jest.Mock).mockResolvedValue({
                id: 5,
                username: 'admin',
                password_hash: 'hash',
                full_name: 'Admin',
                role: { id: 1, name: 'ADMIN', permissions: [{ name: 'READ' }, { name: 'WRITE' }] },
                store_id: 10,
            });
            jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
            const result = await service.adminLogin({ username: 'admin', password: '123' });
            expect(result.token).toBe('token');
            expect(result.adminID).toBe(5);
            expect(result.roleName).toBe('ADMIN');
            expect(result.permissions).toContain('READ');
        });
    });
});
