import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {ConfigModule} from '@nestjs/config';
import {UsersModule} from '../users/users.module';
import {JwtModule} from '@nestjs/jwt';
import {AuthGateway} from './auth.gateway';

@Module({
	controllers: [AuthController],
	providers: [AuthService, AuthGateway],
	imports: [ConfigModule.forRoot(), UsersModule, JwtModule.register({})],
	exports: [ConfigModule, UsersModule, JwtModule, AuthService],
})
export class AuthModule {
}
