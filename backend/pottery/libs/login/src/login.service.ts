import { Injectable, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/database/entities/user.entity';
import { RoleEntity } from '@app/database/entities/role.entity';
import { PermissionEntity } from '@app/database/entities/permission.entity';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '@app/customer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
    constructor(
        private jwtService: JwtService,
        private customerService: CustomerService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) { }

    async login(body: any) {
        const { email, password } = body || {};
        const customers = await this.customerService.getCustomers({ key: email, size: 1, page: 1 });
        const user = customers?.customers?.find((c: any) => c.email === email);
        if (!user) {
            return { success: false, message: 'Email does not exist', status: HttpStatus.UNAUTHORIZED };
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return { success: false, message: 'Incorrect password', status: HttpStatus.UNAUTHORIZED };
        }
        const token = this.jwtService.sign({ email: user.email, name: user.full_name });
        return { success: true, token, user: { email: user.email, name: user.full_name } };
    }

    async register(body: any) {
        const { email, password, name } = body || {};
        const customers = await this.customerService.getCustomers({ key: email, size: 1, page: 1 });
        if (customers?.customers?.find((c: any) => c.email === email)) {
            return { success: false, message: 'Email already exists', status: HttpStatus.BAD_REQUEST };
        }
        const result = await this.customerService.createCustomer({
            email,
            password_hash: password,
            full_name: name,
            is_active: true,
            username: email,
            address: '',
        });
        if (!result?.customer) {
            return { success: false, message: 'Registration failed', status: HttpStatus.INTERNAL_SERVER_ERROR };
        }
        const token = this.jwtService.sign({ email, name });
        return { success: true, token, user: { email, name } };
    }

    async googleAuthRedirect(user: any) {
        const customers = await this.customerService.getCustomers({ key: user.email, size: 1, page: 1 });
        let customer = customers?.customers?.find((c: any) => c.email === user.email);
        if (!customer) {
            const result = await this.customerService.createCustomer({
                email: user.email,
                full_name: user.name,
                is_active: true,
                username: user.email,
                address: '',
                password_hash: '12345',
            });
            customer = result?.customer;
        }
        const token = this.jwtService.sign({ email: user.email, name: user.name });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/';
        return `${frontendUrl}/login-success?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name)}`;
    }

    async adminLogin(adminLoginDto: { username: string; password: string }) {
        const { username, password } = adminLoginDto;
        const user = (await this.userRepository.findOne({
            where: { username },
            relations: ['role', 'role.permissions'],
        })) as UserEntity;
        if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
        const isMatch = await bcryptjs.compare(password, user.password_hash as string);
        if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng');
        const role = user.role as RoleEntity;
        if (!role) throw new UnauthorizedException('Không tìm thấy role');
        const permissions = (role.permissions as PermissionEntity[] ?? []).map((p) => ({ id: p.id, name: p.name }));
        return {
            message: 'Bạn đã đăng nhập thành công',
            roleId: role.id,
            roleName: role.name,
            permissions: permissions.map(p => p.name),
        };
    }
}
