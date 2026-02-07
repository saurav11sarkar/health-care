import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { addDays, addMinutes } from 'date-fns';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchedule(dto: CreateScheduleDto) {
    const { startDate, endDate, startTime, endTime } = dto;
    const interval = 30;

    const schedules: any = [];

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      // Simple AM/PM handling
      let slotStartDateTime = new Date(
        `${currentDate.toISOString().split('T')[0]} ${startTime}`,
      );

      let dayEndDateTime = new Date(
        `${currentDate.toISOString().split('T')[0]} ${endTime}`,
      );

      // overnight support
      if (dayEndDateTime <= slotStartDateTime) {
        dayEndDateTime = addDays(dayEndDateTime, 1);
      }

      while (slotStartDateTime < dayEndDateTime) {
        const slotEndDateTime = addMinutes(slotStartDateTime, interval);
        if (slotEndDateTime > dayEndDateTime) break;

        const exists = await this.prisma.schedule.findFirst({
          where: {
            startDateTime: slotStartDateTime,
            endDateTime: slotEndDateTime,
          },
        });

        if (!exists) {
          const schedule = await this.prisma.schedule.create({
            data: {
              startDateTime: slotStartDateTime,
              endDateTime: slotEndDateTime,
            },
          });

          schedules.push(schedule);
        }

        slotStartDateTime = slotEndDateTime;
      }

      currentDate = addDays(currentDate, 1);
    }

    return schedules;
  }

  async getAllSchedules(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const {
      searchTerm,
      startDateTime: filterStartDateTime,
      endDateTime: filterEndDateTime,
      ...filterData
    } = params;

    const andConditions: Prisma.ScheduleWhereInput[] = [];
    const searchableFields = ['startDateTime', 'endDateTime'];

    if (searchTerm) {
      andConditions.push({
        OR: searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: 'insensitive' },
        })),
      });
    }

    if (filterStartDateTime && filterEndDateTime) {
      andConditions.push({
        AND: [
          { startDateTime: { gte: filterStartDateTime } },
          { endDateTime: { lte: filterEndDateTime } },
        ],
      });
    }

    if (Object.keys(filterData).length) {
      andConditions.push({
        AND: Object.entries(filterData).map(([field, value]) => ({
          [field]: { equals: value },
        })),
      });
    }

    const wheneCondition: Prisma.ScheduleWhereInput = andConditions.length
      ? { AND: andConditions }
      : {};

    const result = await this.prisma.schedule.findMany({
      where: wheneCondition,
      skip: skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
    const total = await this.prisma.schedule.count({ where: wheneCondition });

    return { data: result, meta: { total, page, limit } };
  }

  async deleteSchedule(id: string) {
    const result = await this.prisma.schedule.delete({ where: { id } });
    if (!result) throw new HttpException('Schedule not found', 404);
    return result;
  }
}
