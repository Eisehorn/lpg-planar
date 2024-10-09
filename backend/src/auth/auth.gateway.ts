import {OnGatewayConnection, WebSocketGateway} from '@nestjs/websockets';
import {Injectable} from '@nestjs/common';
import {AuthService} from './auth.service';
import {IncomingMessage} from 'http';
import WebSocket from 'ws';
import {User} from '@prisma/client';

export interface AuthedWebSocket extends WebSocket {
	user: User;
}

@WebSocketGateway()
@Injectable()
export class AuthGateway implements OnGatewayConnection {
	constructor(private authService: AuthService) {
	}

	async handleConnection(client: AuthedWebSocket, request: IncomingMessage) {
		if (!request.url) {
			client.close(1008, 'Unauthorized');
			return;
		}

		const url = new URL(request.url, "http://please_work");
		const token = url.searchParams.get("token");
		if (!token) {
			client.close(1008, 'Unauthorized');
			return;
		}

		try {
			const {user, payload} = await this.authService.isValidAuthorizationHeader("Bearer " + token);
			client.user = user;
		} catch (e) {
			client.close(1008, 'Unauthorized');
			return;
		}
	}

}
