import {forwardRef, Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {PrismaModule} from '../prisma/prisma.module';
import {UsersController} from './users.controller';
import {AuthModule} from '../auth/auth.module';

@Module({
	providers: [UsersService],
	imports: [PrismaModule, forwardRef(() => AuthModule)],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {
}
