import {
	Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '../prisma/prisma.service';
import {User} from '@prisma/client';
import {AppService} from "../app.service";

@Injectable()
export class UsersService {
	constructor (private prismaService: PrismaService) {
	}

	async createUserIfGoogleIdNotExists(accessToken: string): Promise<any> {
		const userRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
			method: 'get',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		const userData = await userRes.json();

		const user = await this.prismaService.user.findFirst({
			where: {
				google_id: userData['id'],
			},
		});
		if (user) {
			return {just_created: false, ...user};
		}

		const createdUser = this.prismaService.user.create({
			data: {
				username: userData['name'],
				avatar: userData['picture'],
				google_id: userData['id'],
			},
		});

		return {just_created: true, ...createdUser};
	}

	async createUserIfNotExists(username: string, password: string) {
		const user = await this.prismaService.user.findFirst({
			where: {
				username: username,
			},
		});
		if (user) {
			return {just_created: false, ...user};
		}

		const data: any = {
			username: username,
			avatar: ''
		}
		if (password) {
			data.password = await bcrypt.hash(password, 10);
		}

		const createdUser = await this.prismaService.user.create({
			data: data
		})

		return {just_created: true, ...createdUser};
	}

	async getUser(id: string) {
		return this.prismaService.user.findFirst({
			where: {
				id: id,
			}
		})
	}
}