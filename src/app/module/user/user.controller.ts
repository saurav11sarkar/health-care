import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { fileUpload } from 'src/app/helper/fileUpload';
import { ValidatedBody } from 'src/app/helper/validated.decorator';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('patient')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePhoto', fileUpload.uploadConfig))
  async createPatient(
    @ValidatedBody(CreateUserDto) dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.createPatient(dto, file);
    return {
      message: 'User created successfully',
      data: result,
    };
  }

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePhoto', fileUpload.uploadConfig))
  async createAdmin(
    @ValidatedBody(CreateUserDto) dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.createAdmin(dto, file);
    return {
      message: 'Admin created successfully',
      data: result,
    };
  }

  @Post('doctor')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePhoto', fileUpload.uploadConfig))
  async createDoctor(
    @ValidatedBody(CreateUserDto) dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.createDoctor(dto, file);
    return {
      message: 'Doctor created successfully',
      data: result,
    };
  }

  @UseGuards(AuthGuard('admin', 'doctor', 'super_admin', 'patient'))
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Req() req: Request) {
    const userId = req.user?.id;
    const result = await this.userService.profile(userId!);
    return {
      message: 'Profile retrieved successfully',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const result = await this.userService.getAllUsers();
    return {
      message: 'Users retrieved successfully',
      data: result,
    };
  }
}
