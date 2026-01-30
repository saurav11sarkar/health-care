import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import config from 'src/app/config';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createPatient(
    createUserDto: CreateUserDto,
  ): Promise<Prisma.UserCreateArgs['data']> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      Number(config.bcryptSaltRounds),
    );

    const result = await this.prisma.$transaction(async (tsx) => {
      const user = await tsx.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          role: 'patient',
        },
      });
      await tsx.patient.create({
        data: {
          email: user.email,
          name: createUserDto.name,
        },
      });
      return user;
    });
    if (!result)
      throw new HttpException(
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return result;
  }
}
