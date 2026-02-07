import { IsDateString, IsString, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  endDate: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^([0]?[1-9]|1[0-2]):([0-5]\d) ?([AaPp][Mm])$/, {
    message: 'startTime must be in hh:mm AM/PM format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0]?[1-9]|1[0-2]):([0-5]\d) ?([AaPp][Mm])$/, {
    message: 'endTime must be in hh:mm AM/PM format',
  })
  endTime: string;
}
