import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminLoginDto } from './admin-login.dto';
import { LoginService } from '@app/login';

@Controller('admin')
export class AdminLoginController {
  constructor(private readonly loginService: LoginService) { }

  @Post('login')
  async login(@Body() adminLoginDto: AdminLoginDto, @Res() res: Response) {
    const result = await this.loginService.adminLogin(adminLoginDto);

    // ✅ Set cookie HttpOnly cho token
    res.cookie('adminToken', result.token, {
      httpOnly: true,
      secure: false, // true nếu dùng HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    // ✅ Trả JSON để frontend lưu thêm role, permissions
    return res.json({
      message: result.message,
      adminID: result.adminID,
      roleName: result.roleName,
      permissions: result.permissions,
      adminName: result.adminName,
      roleId: result.roleId,
      store_id: result.store_id,
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('adminToken', { path: '/' });
    return res.json({ message: 'Đã đăng xuất thành công' });
  }
}
