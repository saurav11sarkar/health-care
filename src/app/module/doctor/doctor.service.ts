import { Injectable } from '@nestjs/common';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDoctors(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.DoctorWhereInput[] = [];
    const searchableFields = [
      'name',
      'email',
      'contactNumber',
      'address',
      'registationNumber',
      'gender',
      'qualification',
      'currentWorkPlace',
      'designation',
      'doctorSpecialies',
    ];

    if (searchTerm) {
      andConditions.push({
        OR: searchableFields.map((field) => ({
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

    const whereConditions: Prisma.DoctorWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await this.prisma.doctor.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await this.prisma.doctor.count({ where: whereConditions });

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
