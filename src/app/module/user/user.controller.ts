import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPatient(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.createPatient(createUserDto);
    return {
      message: 'User created successfully',
      data: result,
    };
  }
}
