import { HttpException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import config from 'src/app/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: CreateAuthDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    console.log(user);
    if (!user) throw new HttpException('Invalid credentials', 401);

    const veryfiedPassword = await bcrypt.compare(dto.password, user.password!);
    if (!veryfiedPassword) throw new HttpException('Invalid credentials', 401);

    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      {
        secret: config.jwt.accessTokenSecret,
        expiresIn: config.jwt.accessTokenExpires as any,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      {
        secret: config.jwt.refreshTokenSecret,
        expiresIn: config.jwt.refreshTokenExpires as any,
      },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
    });

    return { data: user, accessToken };
  }
}
