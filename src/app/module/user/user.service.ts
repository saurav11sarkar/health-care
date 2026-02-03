import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import config from 'src/app/config';
import { fileUpload } from 'src/app/helper/fileUpload';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createPatient(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
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

    let profilePhotoUrl = createUserDto.profilePhoto;

    if (file) {
      const upload = await fileUpload.uploadToCloudinary(file);
      profilePhotoUrl = upload.url;
    }

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
          profilePhoto: profilePhotoUrl,
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

  async createAdmin(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }
    let profilePhotoUrl = createUserDto.profilePhoto;
    if (file) {
      const upload = await fileUpload.uploadToCloudinary(file);
      profilePhotoUrl = upload.url;
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
          role: 'admin',
        },
      });
      await tsx.admin.create({
        data: {
          email: user.email,
          name: createUserDto.name,
          profilePhoto: profilePhotoUrl,
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

  async createDoctor(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    let profilePhotoUrl = createUserDto.profilePhoto;

    if (file) {
      const upload = await fileUpload.uploadToCloudinary(file);
      profilePhotoUrl = upload.url;
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
          role: 'doctor',
        },
      });
      await tsx.doctor.create({
        data: {
          email: user.email,
          name: createUserDto.name,
          profilePhoto: profilePhotoUrl,
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

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: true,
        admin: true,
      },
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async getAllUsers(params: IFilterParams, options: IOptions) {
    const { searchTerm, ...filterData } = params;
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);

    const andConditions: Prisma.UserWhereInput[] = [];
    const searchAbleFields = ['email'];
    if (searchTerm) {
      andConditions.push({
        OR: searchAbleFields.map((field) => ({
          [field]: { contains: searchTerm, mode: 'insensitive' },
        })),
      });
    }

    if (Object.keys(filterData).length) {
      andConditions.push({
        AND: Object.entries(filterData).map(([field, value]) => ({
          [field]: { equals: value },
        })),
      });
    }

    const whereConditions: Prisma.UserWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await this.prisma.user.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: { name: true, profilePhoto: true },
        },
        doctor: {
          select: { name: true, profilePhoto: true },
        },
        admin: {
          select: { name: true, profilePhoto: true },
        },
      },
    });
    const total = await this.prisma.user.count({ where: whereConditions });
    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }
}
