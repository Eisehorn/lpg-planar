import {
	BadRequestException,
	Body,
	Controller, Delete,
	Get,
	Header,
	HttpCode,
	HttpStatus, NotFoundException,
	ParseFilePipeBuilder,
	Post, Query,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import {AuthedRequest, AuthGuard} from '../auth/auth.guard';
import {FileInterceptor} from '@nestjs/platform-express';
import {UsersService} from './users.service';
import {toFileStream} from 'qrcode';
import {Response} from 'express';

@Controller('users')
export class UsersController {

}