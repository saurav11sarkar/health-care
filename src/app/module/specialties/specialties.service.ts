import { HttpException, Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileUpload } from 'src/app/helper/fileUpload';
import { Specialties } from 'src/generated/prisma/client';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async createSpecialties(
    createSpecialtyDto: CreateSpecialtyDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const iconFile = await fileUpload.uploadToCloudinary(file);
      createSpecialtyDto.icon = iconFile.url;
    }
    const result = await this.prisma.specialties.create({
      data: createSpecialtyDto,
    });

    return result;
  }

  async getAllSpecialties(): Promise<Specialties[]> {
    const result = await this.prisma.specialties.findMany({});
    return result;
  }

  async findOneSpecialty(id: string): Promise<Specialties | null> {
    const result = await this.prisma.specialties.findUnique({ where: { id } });
    if (!result) throw new HttpException('Specialty not found', 404);
    return result;
  }

  async deleteSpecialty(id: string) {
    const result = await this.prisma.specialties.delete({ where: { id } });
    if (!result) throw new HttpException('Specialty not found', 404);
    return result;
  }
}
