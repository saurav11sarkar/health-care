import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async createSpecialties(createSpecialtyDto: any) {
    const result = await this.prisma.specialties.create({
      data: createSpecialtyDto,
    });

    return result;
  }

  findAll() {
    return `This action returns all specialties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} specialty`;
  }

  update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    return `This action updates a #${id} specialty`;
  }

  remove(id: number) {
    return `This action removes a #${id} specialty`;
  }
}
