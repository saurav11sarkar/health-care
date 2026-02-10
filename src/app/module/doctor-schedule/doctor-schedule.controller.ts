import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';

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

  @Get('my-schedules')
  @UseGuards(AuthGuard('doctor'))
  async getMyDoctorSchedules(@Req() req: Request) {
    const filters = pick(req.query, [
      'startDateTime',
      'endDateTime',
      'isBooked',
    ]);

    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

    const result = await this.doctorScheduleService.getMyDoctorSchedules(
      req.user!.id,
      filters,
      options,
    );

    return {
      message: 'My doctor schedules retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('doctor'))
  async getSingleDoctorSchedule(@Param('id') id: string, @Req() req: Request) {
    const doctorId = req.user!.id;
    const result = await this.doctorScheduleService.getSingleDoctorSchedule(
      doctorId,
      id,
    );
    return {
      message: 'Doctor schedule retrieved successfully',
      data: result,
    };
  }
}
