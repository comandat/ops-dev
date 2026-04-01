import { Controller, Post, Body, HttpCode, HttpStatus, Res, UnauthorizedException, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() body: LoginUserDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { cookie } = await this.authService.createSession(user.id);
        res.setHeader('Set-Cookie', cookie.serialize());

        return { user };
    }

    @Post('register')
    async register(
        @Body() body: RegisterUserDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { cookie } = await this.authService.register(body);
        res.setHeader('Set-Cookie', cookie.serialize());
        return { success: true };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const sessionId = req.cookies?.auth_session;
        if (sessionId) {
            const blankCookie = await this.authService.logout(sessionId);
            res.setHeader('Set-Cookie', blankCookie.serialize());
        }
        return { success: true };
    }

    @Get('status')
    async status(@Req() req: Request) {
        return { authenticated: !!req.cookies?.auth_session };
    }
}
