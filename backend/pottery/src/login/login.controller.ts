import {
    Body,
    Controller,
    Post,
    Get,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginService } from '@app/login';
@Controller('login')
export class LoginController {
    constructor(private loginService: LoginService) { }
    @Post()
    async login(@Body() body, @Res() res) {
        const result = await this.loginService.login(body);
        if (!result.success) {
            return res.status(result.status).json(result);
        }
        return res.json(result);
    }

    @Post('register')
    async register(@Body() body, @Res() res) {
        const result = await this.loginService.register(body);
        if (!result.success) {
            return res.status(result.status).json(result);
        }
        return res.json(result);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
        const redirectUrl = await this.loginService.googleAuthRedirect(req.user);
        return res.redirect(redirectUrl);
    }
}
