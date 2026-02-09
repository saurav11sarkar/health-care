import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';

@Controller('doctor-schedule')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @Post()
  @UseGuards(AuthGuard('doctor'))
  async createDoctorSchedule(
    @Body() createDoctorScheduleDto: CreateDoctorScheduleDto,
    @Req() req: Request,
  ) {
    const result = await this.doctorScheduleService.createDoctorSchedule(
      req.user!.id,
      createDoctorScheduleDto,
    );

    return { message: 'Doctor schedule created successfully', data: result };
  }
}
