import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {AuthedRequest, NotAuthGuard} from './auth.guard';

@Controller('auth')
export class AuthController {

	constructor(private configService: ConfigService, private authService: AuthService) {
	}

	@UseGuards(NotAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('/google')
	googleAuth() {
		return {redirect_url: `https://accounts.google.com/o/oauth2/v2/auth?scope=openid profile email&include_granted_scopes=true&response_type=code&client_id=${this.configService.getOrThrow('GOOGLE_CLIENT_ID')}&redirect_uri=${this.configService.getOrThrow('FRONTEND_DOMAIN')}/google_auth`}
	}

	@UseGuards(NotAuthGuard)
	@Get('/google/callback')
	@HttpCode(HttpStatus.OK)
	async googleCallback(@Query('code') code: string) {
		if (!code) {
			throw new UnauthorizedException('Code not found!');
		}

		return await this.authService.authGoogleUser(code);
	}

	@UseGuards(NotAuthGuard)
	@Get('/users')
	@HttpCode(HttpStatus.OK)
	async users(username: string, password: string) {
		if (!username || !password) {
			throw new UnauthorizedException('Username or Password Missing');
		}

		return await this.authService.authUser(username, password);
	}

}