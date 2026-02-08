import { Module } from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { DoctorScheduleController } from './doctor-schedule.controller';

@Module({
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
