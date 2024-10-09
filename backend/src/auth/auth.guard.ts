import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Request} from "express";
import {User} from "@prisma/client";
import {AuthService} from './auth.service';
import {IncomingMessage} from "http";

export interface AuthedRequest extends Request {
	user: User;
}

@Injectable()
abstract class BasicAuthGuard implements CanActivate {
	constructor(protected authService: AuthService) {
	}

	abstract isValid(user: User, jwtPayload: any): boolean;

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as AuthedRequest;
		if (!request.headers.authorization) {
			throw new UnauthorizedException('Invalid Token');
		}

		const {user, payload} = await this.authService.isValidAuthorizationHeader(request.headers.authorization);
		if (!this.isValid(user, payload)) {
			throw new UnauthorizedException('Invalid Token');
		}

		request.user = user;
		return true;
	}
}

@Injectable()
export class AuthGuard extends BasicAuthGuard {

	isValid(user: User, jwtPayload: any): boolean {
		return !user.two_factor_enabled || (user.two_factor_enabled && 'two_factor_auth' in jwtPayload);
	}

}

@Injectable()
export class NotAuthGuard implements CanActivate {

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as AuthedRequest;
		const token = this.extractTokenFromHeader(request);
		if (token) {
			throw new UnauthorizedException('Invalid Token');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request) : string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}