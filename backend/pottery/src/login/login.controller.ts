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
    googleAuth(@Req() req: any) {
        const redirectUrl = req.query?.redirect_url as string;
        if (redirectUrl && req.session) {
            req.session.redirectUrl = redirectUrl;
        }
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: any) {
        const redirectUrl = await this.loginService.googleAuthRedirect(req.user, req.session?.redirectUrl);
        return res.redirect(redirectUrl);
    }
}
