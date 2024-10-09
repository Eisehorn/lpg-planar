import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {User} from '@prisma/client';
import {URI} from 'otpauth';
import {PrismaService} from "../prisma/prisma.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

	constructor(private configService: ConfigService, private usersService: UsersService, private jwtService: JwtService, private prismaService: PrismaService) {
	}

	async authGoogleUser(code: string) {
		const formData = new FormData();
		formData.set('code', code);
		formData.set('client_id', this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'));
		formData.set('client_secret', this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'));
		formData.set('redirect_uri', `${this.configService.getOrThrow('FRONTEND_DOMAIN')}/google_auth`);
		formData.set('grant_type', 'authorization_code');

		const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
			method: 'post',
			body: formData,
		});
		if (tokenRes.status != 200) {
			throw new UnauthorizedException('Status code not 200!');
		}
		const tokenData = await tokenRes.json();
		const token = tokenData['access_token'] as string;
		const user = await this.usersService.createUserIfGoogleIdNotExists(token);

		const tokens = await this.generateTokens(user, true);
		return {first_login: user.just_created, ...tokens};
	}

	async authUser(username: string, password: string) {
		const isValidOrNew = await this.pwdCheck(username, password);
		if (!isValidOrNew)
			throw new BadRequestException('Password incorrect');
		const isStrong = this.pwdStrengthCheck(password);
		if (!isStrong)
			throw new BadRequestException('Password not strong enough');
		const user = await this.usersService.createUserIfNotExists(username, password);
		const tokens = await this.generateTokens(user, true);

		return {first_login: user.just_created, ...tokens};
	}

	async refreshToken(refreshToken: string) {
		try {
			const jwt = await this.jwtService.verifyAsync(refreshToken, {secret: this.configService.getOrThrow('JWT_REFRESH_SECRET')});

			const user = await this.usersService.getUser(jwt.sub);
			if (user) {
				return await this.generateTokens(user, true);
			}
		} catch (e) {
			throw new UnauthorizedException('Refresh Token not created!');
		}

		throw new UnauthorizedException('Refresh Token not found!');
	}

	async isValidAuthorizationHeader(header: string) {
		const token = this.extractTokenFromHeader(header);
		if (!token) {
			throw new UnauthorizedException('Invalid token');
		}

		const payload = await this.getJWTPayload(token);
		const user = await this.usersService.getUser(payload.sub);
		if (!user) {
			throw new UnauthorizedException('Invalid token');
		}
		return {user, payload};
	}

	private async getJWTPayload(token: string) {
		try {
			return await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
				},
			);
		} catch {
			throw new UnauthorizedException('Invalid token');
		}
	}

	private extractTokenFromHeader(header: string): string | undefined {
		const [type, token] = header.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	private async generateTokens(user: User, putRefreshToken: boolean) {
		const jwtPayload: any = {sub: user.id};
		const access_token = await this.jwtService.signAsync(jwtPayload, {
			secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
			expiresIn: '30m',
		});
		if (!putRefreshToken) {
			return {temp_access_token: access_token};
		}

		return {
			access_token: await this.jwtService.signAsync(jwtPayload, {
				secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
				expiresIn: '30m',
			}),
			refresh_token: await this.jwtService.signAsync(jwtPayload, {
				secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
				expiresIn: '48h',
			}),
		};
	}

	private pwdStrengthCheck(password: string) {
		const lengthCheck = password.length >= 8;
		const lowercaseCheck = /[a-z]/.test(password);
		const uppercaseCheck = /[A-Z]/.test(password);
		const numberCheck = /[0-9]/.test(password);
		const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);

		return (
			lengthCheck &&
			lowercaseCheck &&
			uppercaseCheck &&
			numberCheck &&
			specialCharCheck
		);
	}

	private async pwdCheck(username: string, password: string) {
		const user : User | null = await this.prismaService.user.findFirst({
			where: {
				username: username,
			}
		});
		if (user) {
			const isPasswordMatch = await bcrypt.compare(password, user.password)
			if (!isPasswordMatch) {
				return false;
			}
		}
		return true;
	}
}
