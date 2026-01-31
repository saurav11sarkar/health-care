import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { fileUpload } from 'src/app/helper/fileUpload';
import { ValidatedBody } from 'src/app/helper/validated.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
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
}
