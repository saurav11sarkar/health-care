import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IFilterParams } from 'src/app/helper/pick';
import { Prisma } from 'src/generated/prisma/client';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';

@Injectable()
export class DoctorScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctorSchedule(
    userId: string,
    createDoctorScheduleDto: CreateDoctorScheduleDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { email: user.email },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const existingSchedules = await this.prisma.schedule.findMany({
      where: {
        id: { in: createDoctorScheduleDto.scheduleIds },
      },
    });

    if (
      existingSchedules.length !== createDoctorScheduleDto.scheduleIds.length
    ) {
      throw new NotFoundException('One or more schedules not found');
    }

    const doctorSchedules = createDoctorScheduleDto.scheduleIds.map(
      (scheduleId) => ({
        doctorId: doctor.id,
        scheduleId,
      }),
    );

    const result = await this.prisma.doctorSchedule.createMany({
      data: doctorSchedules,
      skipDuplicates: true,
    });

    return { user, doctorSchedules: result };
  }

  async getMyDoctorSchedules(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { email: user.email },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const { startDateTime, endDateTime, isBooked } = params;

    const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

    // Date range filter (Schedule relation)
    if (startDateTime || endDateTime) {
      andConditions.push({
        schedule: {
          startDateTime: startDateTime
            ? { gte: new Date(startDateTime) }
            : undefined,
          endDateTime: endDateTime ? { lte: new Date(endDateTime) } : undefined,
        },
      });
    }

    // isBooked filter
    if (isBooked !== undefined) {
      andConditions.push({
        isBooked: isBooked === 'true',
      });
    }

    const whereConditions: Prisma.DoctorScheduleWhereInput = {
      doctorId: doctor.id,
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

    const result = await this.prisma.doctorSchedule.findMany({
      where: whereConditions,
      include: {
        schedule: true,
      },
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    });

    const total = await this.prisma.doctorSchedule.count({
      where: whereConditions,
    });

    return {
      doctorSchedules: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleDoctorSchedule(doctorId: string, scheduleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });
    if (!user) throw new NotFoundException('User not found');
    const doctor = await this.prisma.doctor.findUnique({
      where: { email: user.email },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    const doctorSchedule = await this.prisma.doctorSchedule.findUnique({
      where: {
        doctorId_scheduleId: { doctorId: doctor.id, scheduleId: scheduleId },
      },
      include: { schedule: true },
    });
    if (!doctorSchedule)
      throw new NotFoundException('Doctor schedule not found');
    return doctorSchedule;
  }

  async updateDoctorSchedule(
    userId: string,
    scheduleId: string,
    updateData: UpdateDoctorScheduleDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { email: user.email },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const doctorSchedule = await this.prisma.doctorSchedule.findUnique({
      where: {
        doctorId_scheduleId: {
          doctorId: doctor.id,
          scheduleId,
        },
      },
    });

    if (!doctorSchedule) {
      throw new NotFoundException('Doctor schedule not found');
    }

    const result = await this.prisma.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctor.id,
          scheduleId,
        },
      },
      data: updateData as Prisma.DoctorScheduleUpdateInput,
      include: {
        schedule: true,
      },
    });

    return result;
  }
}
