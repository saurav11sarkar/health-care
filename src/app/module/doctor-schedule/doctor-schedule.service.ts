import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
