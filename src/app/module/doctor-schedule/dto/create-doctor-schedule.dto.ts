import { IsArray, IsString } from 'class-validator';

export class CreateDoctorScheduleDto {
  @IsArray()
  @IsString({ each: true })
  scheduleIds: string[];
}
