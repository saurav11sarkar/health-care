import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import pick from 'src/app/helper/pick';
import type { Request } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    const result = await this.scheduleService.createSchedule(createScheduleDto);

    return { message: 'Schedule created successfully', data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getSchedules(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'startDateTime',
      'endDateTime',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const schedules = await this.scheduleService.getAllSchedules(
      filters,
      options,
    );
    return {
      message: 'Schedules retrieved successfully',
      meta: schedules.meta,
      data: schedules.data,
    };
  }

  @Get('available')
  @UseGuards(AuthGuard('doctor'))
  @HttpCode(HttpStatus.OK)
  async getAvailableSchedules(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'startDateTime',
      'endDateTime',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const userId = req.user!.id;
    const schedules = await this.scheduleService.getAvailableSchedules(
      userId,
      filters,
      options,
    );
    return {
      message: 'Available schedules retrieved successfully',
      meta: schedules.meta,
      data: schedules.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getScheduleById(@Param('id') id: string) {
    const schedule = await this.scheduleService.getScheduleById(id);
    return { message: 'Schedule retrieved successfully', data: schedule };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteSchedule(@Param('id') id: string) {
    const schedule = await this.scheduleService.deleteSchedule(id);
    return {
      message: 'Schedule deleted successfully',
      data: schedule,
    };
  }
}
